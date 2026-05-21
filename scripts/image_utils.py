"""Shared image path helpers for CMS upload and publish."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS_IMG = ROOT / 'assets' / 'img'

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}
MIME_TO_EXT = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
}


def extension_for_upload(filename='', content_type=''):
    if content_type:
        ct = content_type.split(';')[0].strip().lower()
        if ct in MIME_TO_EXT:
            return MIME_TO_EXT[ct]
    ext = Path(filename or '').suffix.lower()
    if ext == '.jpeg':
        ext = '.jpg'
    if ext in ALLOWED_EXTENSIONS:
        return ext
    return '.png'


def output_filename(slug, ext='.png'):
    return f'{slug}{ext}'


def remove_old_slug_images(slug, keep_name):
    """Remove prior banner/slug images so a new upload fully replaces them."""
    if not slug:
        return
    patterns = (f'{slug}.*', f'{slug}-banner.*')
    for pattern in patterns:
        for path in ASSETS_IMG.glob(pattern):
            if path.is_file() and path.name != keep_name:
                path.unlink(missing_ok=True)


def resolve_game_image(game):
    """Return the image filename to use in HTML/JSON for a game."""
    slug = (game or {}).get('slug', '')
    if not slug:
        return ''

    image = (game or {}).get('image', '').strip()
    if image and (ASSETS_IMG / image).is_file():
        return image

    for name in (
        f'{slug}.png',
        f'{slug}.jpg',
        f'{slug}.webp',
        f'{slug}.gif',
        f'{slug}-banner.png',
        f'{slug}-banner.jpg',
    ):
        if (ASSETS_IMG / name).is_file():
            return name

    return f'{slug}.png'
