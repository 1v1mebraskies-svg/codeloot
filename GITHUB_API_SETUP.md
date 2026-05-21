# GitHub API Integration Setup Guide

This guide explains how to configure your CodeLoot admin panel to use GitHub API for all file operations instead of local filesystem.

## Overview

The admin panel now commits directly to GitHub via the GitHub REST API. When you save changes:
1. Data is committed to `data/games.json` in your GitHub repo
2. Images are uploaded to `assets/img/` in your GitHub repo
3. GitHub Pages automatically redeploys your site
4. codeloot.codes updates automatically

## Prerequisites

- GitHub account with access to `1v1mebraskies-svg/CODELOOT` repository
- Vercel account with admin panel deployed
- Branch: `main`

## Step 1: Create GitHub Personal Access Token

### 1.1 Go to GitHub Settings

Navigate to: https://github.com/settings/tokens

### 1.2 Generate New Token

1. Click **"Generate new token"** (or "Generate new token (classic)")
2. Click **"Generate new token (classic)"** if prompted

### 1.3 Configure Token Settings

**Note (Classic):**
- **Name**: `CodeLoot Admin Panel`
- **Expiration**: Choose `No expiration` or a long duration (90+ days)
- **Scopes**: Check the following:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `repo:status` (Access commit status)
  - ✅ `repo_deployment` (Access deployment status)
  - ✅ `public_repo` (Access public repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

**Note (Fine-grained):**
- **Repository access**: Select `Only select repositories`
- **Select repositories**: Choose `1v1mebraskies-svg/CODELOOT`
- **Permissions**: 
  - ✅ `Contents` (Read and write)
  - ✅ `Commit statuses` (Read and write)
  - ✅ `Deployments` (Read and write)
  - ✅ `Workflows` (Read and write)

### 1.4 Generate and Copy Token

1. Click **"Generate token"** at the bottom
2. **IMPORTANT**: Copy the token immediately - you won't see it again
3. Store it securely (password manager, etc.)

## Step 2: Add GitHub Token to Vercel

### 2.1 Open Vercel Dashboard

Navigate to: https://vercel.com/dashboard

### 2.2 Select Your Project

Find and click on your CodeLoot admin project (admin.codeloot.codes)

### 2.3 Go to Settings

1. Click the **Settings** tab at the top
2. Click **Environment Variables** in the left sidebar

### 2.4 Add Environment Variable

1. Click **"Add New"**
2. Fill in the fields:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Paste your GitHub Personal Access Token
   - **Environment**: Select **All** (Production, Preview, Development)
3. Click **"Save"**

### 2.5 Redeploy (Optional but Recommended)

1. Go to the **Deployments** tab
2. Find the latest production deployment
3. Click the three dots (⋮) menu
4. Select **"Redeploy"**
5. This ensures the environment variable is active

## Step 3: Verify Setup

### 3.1 Test Admin Panel

1. Open: https://admin.codeloot.codes
2. Enter your admin password
3. You should see a green banner: **"GitHub API connected"**
4. If you see a yellow banner, the GitHub token is not configured correctly

### 3.2 Test Save Operation

1. Click **"Add Game"** button
2. Fill in a test game with minimal data
3. Upload a test image
4. Click **"Save Game"**
5. You should see: **"Published to disk!"** with success message

### 3.3 Verify GitHub Commit

1. Go to: https://github.com/1v1mebraskies-svg/CODELOOT/commits/main
2. You should see a new commit with message like: "Update games data (X active games)"
3. Click the commit to verify the files changed

### 3.4 Verify GitHub Pages Deployment

1. Go to: https://github.com/1v1mebraskies-svg/CODELOOT/actions
2. You should see a GitHub Pages workflow running
3. Wait for it to complete (usually 1-2 minutes)
4. Visit: https://codeloot.codes
5. Your changes should be live

## Step 4: Update Local Development (Optional)

If you run the admin panel locally:

### 4.1 Create .env.local File

In your project root, create `.env.local`:

```bash
GITHUB_TOKEN=your_actual_token_here
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Run Locally

```bash
npm run dev
```

## How It Works

### Save Flow

1. **Admin edits game** → User fills form in admin panel
2. **Image upload** → Image uploaded to GitHub repo (`assets/img/`)
3. **JSON update** → `data/games.json` updated via GitHub API
4. **Commit created** → GitHub creates commit with changes
5. **GitHub Pages trigger** → GitHub detects new commit
6. **Automatic deploy** → GitHub Pages rebuilds site
7. **Live update** → codeloot.codes reflects changes

### API Endpoints

- **GET /api/games** → Reads `data/games.json` from GitHub
- **PUT /api/games** → Commits `data/games.json` to GitHub
- **POST /api/upload-image** → Uploads image to GitHub repo
- **GET /api/cms-health** → Health check for GitHub API

### File Locations in GitHub

```
CODELOOT/
├── data/
│   └── games.json          # Game data (committed via API)
├── assets/
│   └── img/                # Game images (uploaded via API)
└── games/                  # Game HTML pages (static)
```

## Security Notes

### Token Security

- ✅ Token is stored in Vercel environment variables (encrypted)
- ✅ Never committed to git
- ✅ Only accessible to your Vercel project
- ✅ Can be rotated if compromised

### Best Practices

1. **Use fine-grained tokens** (more secure than classic tokens)
2. **Set token expiration** (rotate periodically)
3. **Monitor token usage** in GitHub settings
4. **Revoke unused tokens** immediately
5. **Use repository-specific tokens** (not global)

### Access Control

- The token has full repository access
- Anyone with admin panel access can commit to your repo
- Keep your admin password secure
- Consider using GitHub branch protection rules

## Troubleshooting

### Issue: "GitHub API not connected" banner

**Cause**: GITHUB_TOKEN not configured in Vercel

**Solution**:
1. Check Vercel Environment Variables
2. Ensure `GITHUB_TOKEN` is set for all environments
3. Redeploy your Vercel project

### Issue: "Failed to save games data to GitHub"

**Cause**: Invalid or expired GitHub token

**Solution**:
1. Generate a new GitHub token
2. Update `GITHUB_TOKEN` in Vercel
3. Redeploy your Vercel project

### Issue: Image upload fails

**Cause**: Token doesn't have write permissions

**Solution**:
1. Verify token has `repo` scope (classic) or `Contents: Read and write` (fine-grained)
2. Regenerate token with correct permissions
3. Update in Vercel and redeploy

### Issue: Changes not appearing on codeloot.codes

**Cause**: GitHub Pages hasn't deployed yet

**Solution**:
1. Check GitHub Actions: https://github.com/1v1mebraskies-svg/CODELOOT/actions
2. Wait for GitHub Pages workflow to complete (1-2 minutes)
3. Check GitHub Pages settings: https://github.com/1v1mebraskies-svg/CODELOOT/settings/pages

### Issue: 403 Forbidden from GitHub API

**Cause**: Token permissions insufficient

**Solution**:
1. Verify token has correct scopes
2. Ensure token has access to the repository
3. Check if repository is private (requires `repo` scope)

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |

## Migration from Old System

### What Changed

**Before (Local Filesystem):**
- Admin panel saved to `/var/task/assets/img` (failed on Vercel)
- Required local Python server
- Manual git commits needed
- Images uploaded to Vercel Blob

**After (GitHub API):**
- Admin panel commits directly to GitHub
- No local server required
- Automatic commits on save
- Images uploaded to GitHub repo
- GitHub Pages auto-deploys

### Files Changed

- `lib/github-api.js` - New GitHub API utility module
- `api/games.js` - Updated to use GitHub API
- `api/upload-image.js` - Updated to use GitHub API
- `api/cms-health.js` - Updated health check
- `admin/admin.js` - Updated UI messages
- `package.json` - Removed Vercel Blob dependency
- `.env.example` - Updated for GitHub token

### Dependencies Removed

- `@vercel/blob` - No longer needed
- `chokidar` - No longer needed (no file watcher)

### Dependencies Kept

- `multer` - Still needed for multipart form parsing

## Support

If you encounter issues:

1. Check Vercel logs for error messages
2. Verify GitHub token is valid and has correct permissions
3. Check GitHub repository settings
4. Review GitHub Actions for deployment failures
5. Ensure GitHub Pages is enabled for the repository

## Additional Resources

- GitHub REST API: https://docs.github.com/en/rest
- GitHub Personal Access Tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- GitHub Pages: https://docs.github.com/en/pages
