#!/usr/bin/env python3
"""Auto-import game data from HTML files into games.json."""
import json
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent
GAMES_DIR = ROOT / 'games'
DATA_FILE = ROOT / 'data' / 'games.json'


class GameHTMLParser(HTMLParser):
    """Extract game data from HTML files."""
    
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.in_meta_desc = False
        self.in_h1 = False
        self.in_banner_copy = False
        self.in_code_grid = False
        self.in_code_card = False
        self.in_code_h3 = False
        self.in_code_p = False
        
        self.title = ''
        self.meta_desc = ''
        self.h1_text = ''
        self.banner_desc = ''
        self.codes = []
        self.current_code = None
        self.current_reward = None
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta' and attrs_dict.get('name') == 'description':
            self.in_meta_desc = True
            self.meta_desc = attrs_dict.get('content', '')
        elif tag == 'h1':
            self.in_h1 = True
        elif tag == 'div' and 'game-banner-copy' in attrs_dict.get('class', ''):
            self.in_banner_copy = True
        elif tag == 'div' and attrs_dict.get('data-codes-grid') == '':
            self.in_code_grid = True
        elif self.in_code_grid and tag == 'article' and 'code-card' in attrs_dict.get('class', ''):
            self.in_code_card = True
        elif self.in_code_card and tag == 'h3':
            self.in_code_h3 = True
        elif self.in_code_card and tag == 'p':
            self.in_code_p = True
            
    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'h1':
            self.in_h1 = False
        elif tag == 'div' and self.in_banner_copy:
            self.in_banner_copy = False
        elif tag == 'div' and self.in_code_grid:
            self.in_code_grid = False
        elif self.in_code_card and tag == 'article':
            self.in_code_card = False
            if self.current_code:
                self.codes.append({
                    'code': self.current_code,
                    'reward': self.current_reward or 'Unknown reward',
                    'status': 'active'
                })
                self.current_code = None
                self.current_reward = None
        elif self.in_code_card and tag == 'h3':
            self.in_code_h3 = False
        elif self.in_code_card and tag == 'p':
            self.in_code_p = False
            
    def handle_data(self, data):
        if self.in_title:
            self.title += data
        elif self.in_h1:
            self.h1_text += data
        elif self.in_banner_copy:
            self.banner_desc += data
        elif self.in_code_h3:
            self.current_code = data.strip()
        elif self.in_code_p:
            self.current_reward = data.strip()


def extract_game_from_html(html_path):
    """Extract game data from an HTML file."""
    content = html_path.read_text(encoding='utf-8')
    parser = GameHTMLParser()
    parser.feed(content)
    
    # Extract slug from filename
    slug = html_path.stem
    
    # Extract name from title or h1
    name = parser.h1_text.replace(' Codes', '').strip()
    if not name:
        name = parser.title.split(' Codes')[0].strip() if ' Codes' in parser.title else slug.replace('-', ' ').title()
    
    # Extract description
    description = parser.banner_desc.strip() or parser.meta_desc.split('.')[0] + '.' if parser.meta_desc else ''
    
    # Extract image from HTML
    img_match = re.search(r'<img src="../assets/img/([^"]+)"', content)
    image = img_match.group(1) if img_match else f'{slug}.png'
    
    return {
        'name': name,
        'slug': slug,
        'description': description,
        'short_description': description,
        'long_description': description,
        'image': image,
        'codes': parser.codes,
        'category': 'general',
        'featured': False,
        'active': True,
    }


def load_games_json():
    """Load existing games.json."""
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'games': [], 'metadata': {'version': '1.0', 'last_updated': ''}}


def save_games_json(data):
    """Save games.json."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def get_next_id(games):
    """Get next available game ID."""
    if not games:
        return 1
    return max(g.get('id', 0) for g in games) + 1


def get_next_code_id(games):
    """Get next available code ID."""
    max_id = 0
    for game in games:
        for code in game.get('codes', []):
            max_id = max(max_id, code.get('id', 0))
    return max_id + 1


def import_html_games():
    """Import all games from HTML files into games.json."""
    data = load_games_json()
    existing_games = data.get('games', [])
    existing_slugs = {g.get('slug') for g in existing_games}
    
    imported = []
    updated = []
    
    for html_file in sorted(GAMES_DIR.glob('*.html')):
        slug = html_file.stem
        if slug in existing_slugs:
            # Game already exists, skip or update if needed
            continue
        
        # Extract game data from HTML
        game_data = extract_game_from_html(html_file)
        
        # Assign IDs
        game_data['id'] = get_next_id(existing_games)
        game_data['created_at'] = '2026-01-01T00:00:00Z'
        game_data['updated_at'] = '2026-01-01T00:00:00Z'
        
        # Assign code IDs
        next_code_id = get_next_code_id(existing_games)
        for code in game_data.get('codes', []):
            code['id'] = next_code_id
            code['created_at'] = '2026-01-01T00:00:00Z'
            next_code_id += 1
        
        # Add to games list
        existing_games.append(game_data)
        imported.append(game_data['name'])
    
    if imported:
        data['games'] = existing_games
        data['metadata']['last_updated'] = '2026-05-20T00:00:00Z'
        save_games_json(data)
        print(f'Imported {len(imported)} games: {", ".join(imported)}')
    else:
        print('No new games to import. All HTML files already in games.json')
    
    return data


if __name__ == '__main__':
    import_html_games()
