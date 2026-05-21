# CodeLoot Admin CMS Guide

## Overview
The CodeLoot Admin CMS is a clean, simple, and reliable content management system for managing the CodeLoot website. It provides instant publishing to real files with no preview-only changes.

## Quick Start

### 1. Start the Server
```bash
python3 server.py
```
The server will start on `http://localhost:3000`

### 2. Access Admin Dashboard
Open your browser to: `http://localhost:3000/admin/login.html`

### 3. Login
- **Main Password**: `AdminPass`
- Session expires after 8 hours for security

## Features

### Game Management
- **Add Games**: Click "+ Add Game" to create new game pages
- **Edit Games**: Click "Edit" on any game to modify it
- **Delete Games**: Click "Delete" to remove games (requires sensitive password)

### Code Management
- **Add Codes**: Use the code editor or bulk paste (format: `CODE|Reward`)
- **Edit Codes**: Modify code text and rewards directly
- **Delete Codes**: Remove individual codes (requires sensitive password)
- **Bulk Add**: Paste multiple codes at once (one per line)

### Image Upload
- Upload banner images directly in the game editor
- Images auto-save to `assets/img/`
- Auto-connect to game pages and homepage cards
- No manual renaming needed

### Sensitive Actions (Require Second Password)
The following actions require the sensitive action password:
- **Delete Game**: Removes game page, homepage card, and search indexing
- **Edit Existing Game**: Overwrites game data
- **Delete Codes**: Removes code entries

**Sensitive Password**: `Jeff@`

## Save & Publish

When you click "Save & Publish", the system instantly updates:
- `data/games.json` - Main database
- `index.html` - Homepage with game cards
- `games/[slug].html` - Individual game pages
- `assets/img/[filename]` - Game images
- Search system - Auto-indexes all games

**No manual steps required.** Everything updates automatically.

## Game Fields

When creating/editing a game, you can set:
- **Game Name** - Display title
- **Slug (URL)** - URL-friendly identifier (auto-generated from name)
- **Short Description** - Homepage card text
- **Long Description** - Game page banner text
- **Category** - Game category (anime, pvp, rng, horror, general)
- **Reward Label** - Stats card reward text
- **Last Checked Date** - Update date display
- **Featured Toggle** - Show on homepage
- **Active Toggle** - Live on site
- **Update Info** - Sidebar note
- **Redeem Instructions** - Step-by-step guide (one per line)
- **Image** - Banner image upload
- **Codes** - List of active codes

## Delete System

Deleting a game automatically:
- Removes homepage card
- Removes game page HTML file
- Removes from search indexing
- Cleans up image connections
- Removes all associated codes

## Security

- **Main Password**: `AdminPass` - Required for login
- **Sensitive Password**: `Jeff@` - Required for delete/overwrite operations
- **Session Timeout**: 8 hours
- **Session Storage**: Uses browser sessionStorage (cleared on browser close)

## Mobile Support

The admin dashboard is fully responsive and works on mobile devices.

## Troubleshooting

### Server won't start
- Port 3000 may be in use. Kill existing process: `lsof -ti:3000 | xargs kill -9`

### Can't save changes
- Ensure CMS server is running: `python3 server.py`
- Check browser console for errors
- Verify you're logged in

### Images not uploading
- Check file size (max 15MB)
- Ensure file is PNG, JPG, WebP, or GIF
- Verify `assets/img/` directory exists

### Changes not reflecting on live site
- Check that save completed successfully
- Verify browser cache is cleared
- Confirm server is running

## File Structure

```
CODELOOT/
├── admin/
│   ├── login.html          # Login page
│   ├── index.html          # Admin dashboard
│   └── admin.js            # Admin logic with auth
├── data/
│   └── games.json          # Game database
├── games/
│   └── [slug].html         # Auto-generated game pages
├── assets/
│   └── img/
│       └── [filename]      # Uploaded images
├── index.html              # Auto-generated homepage
└── server.py               # CMS server (run this)
```

## Best Practices

1. **Always backup** `data/games.json` before major changes
2. **Test codes** before publishing to verify they work
3. **Use descriptive slugs** for better SEO
4. **Keep images optimized** (under 2MB recommended)
5. **Log out** when done on shared computers

## Support

For issues or questions, check the server console output for error messages.
