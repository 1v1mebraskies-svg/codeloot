# CodeLoot Admin Dashboard - Separate Vercel Project

This is a separate Vercel project for the CodeLoot admin CMS dashboard.

## Deployment Instructions

### 1. Create New Vercel Project
```bash
cd admin
vercel link
```

### 2. Configure Environment Variables
In Vercel project settings, add:
- `WEBHOOK_URL`: URL of your main site's webhook endpoint (for syncing data)
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token (auto-created by Vercel)
- `KV_REST_API_URL`: Vercel KV REST API URL (auto-created by Vercel)
- `KV_REST_API_TOKEN`: Vercel KV REST API token (auto-created by Vercel)

### 3. Enable Vercel KV
In Vercel project settings → Storage → Create KV Database

### 4. Enable Vercel Blob
In Vercel project settings → Storage → Create Blob Store

### 5. Add Domain
In Vercel project settings → Domains → Add `admin.codeloot.codes`

### 6. Configure DNS
Point `admin.codeloot.codes` to this Vercel project (Vercel will provide CNAME)

## Architecture

- **Data Storage**: Vercel KV (replaces data/games.json)
- **Image Storage**: Vercel Blob (replaces assets/img/)
- **API Routes**: `/api/games`, `/api/upload-image`, `/api/sync-pages`, `/api/cms-health`
- **Webhook**: Triggers main site sync when data changes

## Main Site Integration

Your main site (codeloot.codes) needs:
1. A webhook endpoint to receive data updates from admin
2. Read from Vercel KV instead of data/games.json
3. Use Vercel Blob URLs for images

## Files Structure
```
admin/
├── index.html          # Admin dashboard (copied from /admin/index.html)
├── login.html          # Login page (copied from /admin/login.html)
├── admin.js            # Admin logic (copied from /admin/admin.js)
├── style.css           # Styles (copied from /style.css)
├── cms-api.js          # API client (copied from /js/cms-api.js)
├── codeloot-data.js    # Data utilities (copied from /js/codeloot-data.js)
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies
└── api/                # API routes
    ├── games.js
    ├── upload-image.js
    ├── sync-pages.js
    └── cms-health.js
```
