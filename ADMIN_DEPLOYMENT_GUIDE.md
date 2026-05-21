# Admin Subdomain Deployment Guide - STATIC SITE

## Critical Configuration Required

The admin project must be configured as a **static site** deployment. The files are in the `admin/` folder, so the Vercel project must use this as the root directory.

## Vercel Project Configuration (REQUIRED)

### Step 1: Configure Root Directory
1. Go to Vercel Dashboard
2. Select the project for `admin.codeloot.codes`
3. Go to **Settings** → **General**
4. Find **Root Directory**
5. Set to: `admin`
6. Click **Save**

### Step 2: Configure Framework Preset
1. In the same Settings → General page
2. Find **Framework Preset**
3. Set to: **Other** or **Static**
4. This ensures no build step runs

### Step 3: Verify Build Settings
1. Go to **Settings** → **Build & Development**
2. **Build Command**: Leave empty (or set to `echo "Static site"`)
3. **Output Directory**: Leave empty (files are at root)
4. **Install Command**: Leave empty (no dependencies needed for static files)

### Step 4: Redeploy
1. Go to **Deployments**
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger deployment

## Files in admin/ Folder

The following files must exist in the `admin/` folder:
- ✅ `index.html` - Admin dashboard
- ✅ `login.html` - Login page
- ✅ `style.css` - Styles
- ✅ `admin.js` - Admin logic
- ✅ `cms-api.js` - API client
- ✅ `codeloot-data.js` - Data utilities
- ✅ `vercel.json` - Static site routing
- ✅ `package.json` - Project metadata

## Current vercel.json Configuration

The `admin/vercel.json` is configured for static hosting:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This serves `index.html` for all routes (SPA-style routing).

## Why Files Were Not Deploying

The issue was that the Vercel project was likely configured with:
- **Root Directory**: Repository root (default)
- This meant the `admin/` folder was not included in the deployment

By setting **Root Directory** to `admin`, the deployment will include:
- All files in the `admin/` folder
- `index.html` will be at the deployment root
- Static files will be accessible

## Verification

After configuring the Root Directory and redeploying:

1. Visit https://admin.codeloot.codes
   - Should show admin dashboard (not "Cannot GET /")

2. Check the deployment in Vercel Dashboard
   - Go to Deployments → Latest deployment
   - Click "View Function Logs" or "View Build Output"
   - Verify that `index.html`, `style.css`, `admin.js`, etc. are listed

3. Test the admin dashboard
   - Login should work
   - Static assets should load
   - Dashboard should be functional

## Troubleshooting

### Issue: Still shows "Cannot GET /"

**Check deployment output:**
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check the "Build Output" or "Files" section
4. Verify `index.html` is listed

**If files are missing:**
- Verify Root Directory is set to `admin`
- Redeploy the project
- Check that files are not in `.gitignore` or `.vercelignore`

### Issue: API routes not working

The admin folder has serverless functions in `admin/api/`. These require:
- Vercel KV database configured
- Environment variables set (if needed)

For a pure static admin dashboard without backend:
- Remove the `admin/api/` folder
- Update admin.js to use a different API endpoint

### Issue: Static files not loading (404 errors)

Check that all referenced files exist in `admin/`:
- `style.css`
- `admin.js`
- `cms-api.js`
- `codeloot-data.js`

Verify the file paths in `index.html` are correct:
```html
<link rel="stylesheet" href="style.css">
<script src="codeloot-data.js"></script>
<script src="cms-api.js"></script>
<script src="admin.js"></script>
```

## Expected Result

After proper configuration:
- ✅ https://admin.codeloot.codes → Opens admin dashboard directly
- ✅ All static files load correctly
- ✅ No "Cannot GET /" error
- ✅ SPA routing works (all routes serve index.html)
