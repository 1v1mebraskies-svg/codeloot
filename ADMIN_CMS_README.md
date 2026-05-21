# CodeLoot Admin Dashboard / CMS

A lightweight, browser-based admin dashboard for managing Roblox game codes. No backend server required - runs entirely in the browser using localStorage for authentication and JSON for data storage.

## Architecture

- **Data Storage**: JSON file (`data/games.json`)
- **Authentication**: Browser localStorage (password: `admin123`)
- **Page Generation**: Browser-based HTML generation
- **No Backend Required**: Works with any static hosting (GitHub Pages, Netlify, etc.)

## Features

- **Game Management**: Add, edit, delete games with featured/active toggles
- **Codes Management**: Add, edit, delete codes with bulk import support
- **Auto Page Generation**: Generate HTML pages from JSON data
- **SEO Optimization**: Dynamic metadata, OpenGraph, Twitter cards
- **Image Handling**: Auto-connects images via slug (slug → assets/img/slug.png)
- **Search**: Filter games by name or slug
- **Mobile Friendly**: Responsive design

## Setup Instructions

### 1. Initial Setup

The admin dashboard is already set up in your project. The files are:

```
admin/
  ├── index.html      # Admin dashboard UI
  ├── admin.js        # Dashboard logic
  └── migrate.html    # Migration tool for existing games

data/
  └── games.json      # Game data (already has sample data)
```

### 2. Access the Admin Dashboard

1. Open `admin/index.html` in your browser
2. Enter password: `admin123`
3. You'll see the games management dashboard

### 3. Migrate Existing Games (Optional)

If you want to add your existing 20 games to the JSON database:

1. Open `admin/migrate.html` in your browser
2. Edit the JSON template to add your existing games
3. Each game needs:
   - `name`: Game name
   - `slug`: URL-friendly name (kebab-case)
   - `description`: Game description
   - `category`: anime, pvp, rng, horror, or general
   - `featured`: true/false
   - `active`: true/false
   - `codes`: Array of code objects

4. Click "Download JSON File"
5. Move the downloaded file to `data/games.json` (replace existing)

### 4. Add a New Game

1. Open admin dashboard (`admin/index.html`)
2. Click "+ Add Game"
3. Fill in:
   - Game Name
   - Slug (auto-generated from name)
   - Description
   - Category
   - Featured toggle
   - Active toggle
4. Click "Save Game"

### 5. Add Codes to a Game

1. Click "Codes" button on a game row
2. Click "+ Add Code" for single codes
3. Or use "Bulk Add" for multiple codes (format: `CODE|Reward`)
4. Click "Save Code" or "Bulk Add"

### 6. Generate HTML Pages

**Single Game:**
1. Click "Generate" button on a game row
2. The HTML file will download
3. Save it to the `games/` folder

**All Games:**
1. Click "Generate All Pages" button
2. All game HTML files will download
3. Save each file to the `games/` folder

### 7. Image Setup

Images are manually stored in `assets/img/`. The system automatically connects images based on the slug:

- Slug: `blox-fruits`
- Image: `assets/img/blox-fruits.png`

If the image doesn't exist, it falls back to `assets/img/code-loot-hero.png`.

## Workflow Example

1. **Place image in assets/img/**: `anime-rangers.png`
2. **Open admin dashboard**: `admin/index.html`
3. **Add game**:
   - Name: Anime Rangers
   - Slug: anime-rangers (auto-generated)
   - Description: Gems, trait crystals, and summon rewards
   - Category: anime
   - Featured: true
4. **Add codes**:
   - Click "Codes"
   - Bulk add: `RANGERS2024|Free Gems`
   - Click "Bulk Add"
5. **Generate page**:
   - Click "Generate"
   - Save `anime-rangers.html` to `games/` folder
6. **Done!** The game page is now live.

## Security

- **Password**: Default is `admin123` - change this in `admin/admin.js` line 3
- **Authentication**: Stored in browser localStorage
- **Note**: This is a simple auth system suitable for personal use. For production, consider adding additional security measures.

## Data Structure

```json
{
  "games": [
    {
      "id": 1,
      "name": "Blox Fruits",
      "slug": "blox-fruits",
      "description": "XP boosts, stat resets, Beli, and title rewards.",
      "category": "anime",
      "featured": true,
      "active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z",
      "codes": [
        {
          "id": 1,
          "code": "EASTEREXP",
          "reward": "x2 EXP for 20 minutes",
          "status": "active",
          "created_at": "2026-01-01T00:00:00Z"
        }
      ]
    }
  ],
  "metadata": {
    "version": "1.0",
    "last_updated": "2026-01-01T00:00:00Z"
  }
}
```

## Categories

- `anime` - Anime-inspired games
- `pvp` - Competitive player-vs-player games
- `rng` - Luck-based rolling/simulator games
- `horror` - Horror/survival games
- `general` - General games

## SEO Features

Generated pages include:
- Dynamic meta description
- OpenGraph tags for social sharing
- Twitter card tags
- Schema markup ready
- Clean URLs
- Mobile-optimized

## Troubleshooting

**"Error loading games data"**
- Make sure `data/games.json` exists
- Check JSON syntax is valid
- Ensure file path is correct

**"Error saving games data"**
- The browser may not support direct file writing
- You'll need to manually copy the JSON content to `data/games.json`

**Generated page has no image**
- Check image exists in `assets/img/` with correct filename
- Filename must match slug exactly (e.g., `blox-fruits.png`)
- Fallback image will be used if missing

**Bulk codes not working**
- Use format: `CODE|Reward` (one per line)
- Example: `CODE1|Reward 1`
- Make sure there are no empty lines

## Scaling to 100+ Games

This system is designed to scale:
- JSON file handles thousands of games efficiently
- Browser-based generation is fast
- No database server needed
- Easy to backup (just copy the JSON file)
- Can be hosted anywhere static sites are supported

## File Changes Summary

**New Files:**
- `admin/index.html` - Admin dashboard UI
- `admin/admin.js` - Dashboard JavaScript logic
- `admin/migrate.html` - Migration tool
- `data/games.json` - Game data storage

**Modified Files:**
- None (existing files preserved)

**Preserved:**
- All existing game pages in `games/`
- All existing images in `assets/img/`
- `index.html`, `style.css`, `app.js`
- All other existing files

## Next Steps

1. Open `admin/index.html` and test the dashboard
2. Use `admin/migrate.html` to add your existing 20 games
3. Generate HTML pages for all games
4. Replace existing game pages with generated ones
5. Update `index.html` to link to new game pages
6. Change the default password in `admin/admin.js`

## Support

For issues or questions, refer to the inline comments in the code files.
