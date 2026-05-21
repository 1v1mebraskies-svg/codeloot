# TRUE LIVE AUTOSYNC Setup Guide

## Overview
The admin panel now uses GitHub API as a shared data source. This means:
- **Instant live updates**: Saving in admin immediately updates the production website
- **No manual copying**: Both admin and public site use the same GitHub repository
- **Works from any device**: Phone, laptop, or any computer can make changes
- **Conflict detection**: Prevents overwriting changes made by others

## Critical Setup: GITHUB_TOKEN

The admin panel requires a GitHub Personal Access Token to read/write data to the repository.

### Step 1: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" (classic)
3. Set token name: `CodeLoot Admin Token`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Actions if needed)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 2: Add GITHUB_TOKEN to Vercel

For the CLEANADMIN deployment (admin.codeloot.codes):

1. Go to https://vercel.com/dashboard
2. Select the CLEANADMIN project
3. Go to Settings → Environment Variables
4. Add new environment variable:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: [paste your GitHub token]
   - **Environment**: Production, Preview, Development (select all)
5. Click "Save"

### Step 3: Redeploy CLEANADMIN

After adding the environment variable:

1. Go to the CLEANADMIN project in Vercel
2. Click "Deployments"
3. Click the three dots next to the latest deployment
4. Click "Redeploy"

## How It Works

### Data Flow
```
Admin Panel (admin.codeloot.codes)
    ↓ (saves via GitHub API)
GitHub Repository (1v1mebraskies-svg/CODELOOT)
    ↓ (reads via GitHub API)
Public Website (codeloot.codes)
```

### Conflict Detection
- Each save includes the current file SHA (version)
- If someone else modified the file, you get a 409 Conflict error
- The admin shows you the current data and asks you to refresh
- This prevents data loss from concurrent edits

### Image Uploads
- Images are uploaded directly to GitHub repository
- Stored in `assets/img/` directory
- Both admin and public site use the same image URLs
- No manual file copying needed

## Testing

### Test Live Autosync
1. Open admin.codeloot.codes
2. Make a small change (e.g., add a code)
3. Click Save
4. Open codeloot.codes in a new tab
5. The change should appear immediately

### Test from Multiple Devices
1. Open admin on your laptop
2. Open admin on your phone
3. Make a change on one device
4. Refresh on the other device
5. Changes should sync instantly

## Troubleshooting

### Error: "GITHUB_TOKEN environment variable is not set"
- **Cause**: GITHUB_TOKEN not configured in Vercel
- **Fix**: Follow Step 2 above to add the environment variable

### Error: "Failed to get file SHA: 404 Not Found"
- **Cause**: File doesn't exist in GitHub yet
- **Fix**: This is normal for first-time use. The system will create the file on first save.

### Error: "CONFLICT - The data was modified by another user"
- **Cause**: Someone else saved changes while you were editing
- **Fix**: Refresh the page to get the latest data, then make your changes again

### Changes not appearing on live site
- **Cause**: Browser cache or GitHub API rate limit
- **Fix**: 
  - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
  - Wait 1-2 minutes for GitHub API to propagate
  - Check Vercel deployment logs for errors

## Security Notes

- **Never commit GITHUB_TOKEN to git** - it's already in .gitignore
- **Token has repo access** - keep it secure
- **Rotate token regularly** - every 90 days recommended
- **Use separate tokens** for different projects if possible

## Benefits

✅ **True Live Autosync** - No manual syncing required
✅ **Device Agnostic** - Works from any device with internet
✅ **Conflict Safe** - Built-in conflict detection
✅ **Version History** - GitHub commits provide full history
✅ **Rollback Ready** - Can revert any change via GitHub
✅ **Zero Downtime** - No rebuilds or deployments needed
✅ **Production Ready** - Uses GitHub's reliable API infrastructure

## Architecture

### Before (Local Only)
```
Admin Panel → Local File System (CLEANADMIN/data/games.json)
Public Site → GitHub Repository
Manual sync required ❌
```

### After (Shared Data Source)
```
Admin Panel → GitHub API → GitHub Repository
Public Site → GitHub API → GitHub Repository
Automatic sync ✅
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify GITHUB_TOKEN is set correctly
3. Check GitHub token has proper scopes
4. Ensure GitHub repository exists and is accessible
