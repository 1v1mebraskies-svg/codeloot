# Standalone Admin Dashboard Deployment - Complete

## Overview

This repository has been restructured as a **standalone Vercel admin dashboard deployment**. It no longer serves the public CodeLoot homepage - it serves only the admin dashboard.

## Deployment Structure

### Root Level Files (Admin Dashboard)
- ✅ `index.html` - Login page (entry point)
- ✅ `admin-index.html` - Admin dashboard (accessible at /admin)
- ✅ `login.html` - Login page (standalone)
- ✅ `admin-style.css` - Admin dashboard styles
- ✅ `admin.js` - Admin dashboard logic
- ✅ `cms-api.js` - API client (auto-detects Vercel origin)
- ✅ `codeloot-data.js` - Data utilities
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Project metadata

### API Routes (Vercel Serverless)
- ✅ `api/cms-health.js` - Health check endpoint
- ✅ `api/games.js` - Games CRUD operations
- ✅ `api/sync-pages.js` - Page sync endpoint
- ✅ `api/upload-image.js` - Image upload endpoint

### Archived Files
- `public-index.html.backup` - Original main site homepage (archived)
- `admin/` folder - Original admin location (preserved for reference)

## Vercel Configuration

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/index.html"
    },
    {
      "source": "/admin",
      "destination": "/admin-index.html"
    },
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Routing Behavior
- `https://admin.codeloot.codes/` → Login page (index.html)
- `https://admin.codeloot.codes/admin` → Admin dashboard (admin-index.html)
- `https://admin.codeloot.codes/api/*` → Vercel serverless functions
- All other routes → Login page (SPA-style routing)

## Key Changes Made

### 1. File Restructuring
- Moved admin dashboard files from `admin/` to root level
- Renamed main site `index.html` to `public-index.html.backup`
- Copied `login.html` to `index.html` (new entry point)
- Renamed `style.css` to `admin-style.css` (avoid conflicts)

### 2. Updated References
- Updated HTML files to reference `admin-style.css`
- Updated `admin.js` comment to reflect Vercel API routes
- No changes needed to `cms-api.js` (auto-detects origin)

### 3. Vercel Configuration
- Simplified `vercel.json` for admin-only deployment
- Removed hostname-based routing (no longer needed)
- Configured SPA-style routing for all routes

### 4. Package Configuration
- Updated `package.json` for static site deployment
- Removed Express/Python dependencies
- Added Vercel dev scripts

## API Routes

All API routes are Vercel serverless functions in the `api/` folder:

### GET /api/cms-health
Returns health status of the CMS.

### GET /api/games
Returns all games data from `data/games.json`.

### PUT /api/games
Updates games data in `data/games.json`.

### POST /api/sync-pages
Triggers page synchronization (placeholder for Vercel).

### POST /api/upload-image
Handles image uploads (placeholder for Vercel Blob storage).

## Deployment Instructions

### Prerequisites
- Vercel account
- Git repository connected to Vercel
- Domain `admin.codeloot.codes` configured in Vercel

### Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Restructure as standalone admin dashboard"
   git push
   ```

2. **Configure Vercel Project**
   - Go to Vercel Dashboard
   - Select the project for `admin.codeloot.codes`
   - Settings → General → Framework Preset: **Other**
   - Settings → Build & Development → Build Command: Leave empty
   - Settings → Build & Development → Output Directory: Leave empty

3. **Deploy**
   - Vercel will auto-deploy on push
   - Or manually trigger deployment in dashboard

4. **Verify**
   - Visit `https://admin.codeloot.codes`
   - Should see login page
   - Login with password: `AdminPass`
   - After login, should redirect to admin dashboard

## Authentication

### Admin Password
- Default: `AdminPass`
- Stored in `admin.js` (line 5)
- **Change this in production**

### Sensitive Action Password
- Default: `jeff@`
- Stored in `admin.js` (line 6)
- Required for editing/deleting games
- **Change this in production**

## Data Storage

### Current Implementation
- Games data stored in `data/games.json`
- File system storage (Vercel serverless can read/write)
- Images stored in `assets/img/` (if needed)

### Production Considerations
For production, consider:
- Vercel KV for structured data
- Vercel Blob Storage for images
- Environment variables for sensitive data

## Troubleshooting

### Issue: "Cannot GET /"
- Verify `index.html` exists at root
- Check `vercel.json` is deployed
- Redeploy the project

### Issue: API routes not working
- Verify `api/` folder files exist
- Check Vercel Function Logs
- Ensure serverless functions are properly exported

### Issue: Styles not loading
- Verify `admin-style.css` exists at root
- Check HTML file references
- Clear browser cache

### Issue: Login not working
- Check `admin.js` for password configuration
- Verify `cms-api.js` can connect to API
- Check browser console for errors

## File Structure

```
CODELOOT/
├── index.html (login page - entry point)
├── admin-index.html (admin dashboard)
├── login.html (standalone login)
├── admin-style.css (styles)
├── admin.js (admin logic)
├── cms-api.js (API client)
├── codeloot-data.js (data utilities)
├── vercel.json (Vercel config)
├── package.json (project metadata)
├── api/ (serverless functions)
│   ├── cms-health.js
│   ├── games.js
│   ├── sync-pages.js
│   └── upload-image.js
├── data/ (data storage)
│   └── games.json
├── public-index.html.backup (archived main site)
└── admin/ (original admin location - preserved)
```

## Next Steps

1. **Change default passwords** in `admin.js`
2. **Configure production data storage** (Vercel KV/Blob)
3. **Set up environment variables** for sensitive data
4. **Test all functionality** on deployed site
5. **Remove archived files** if no longer needed

## Expected Behavior

After deployment:
- ✅ `https://admin.codeloot.codes` → Opens login page
- ✅ Login → Redirects to admin dashboard
- ✅ Admin dashboard → Full CRUD for games
- ✅ API routes → Work via Vercel serverless
- ✅ NO public homepage → Admin-only deployment
