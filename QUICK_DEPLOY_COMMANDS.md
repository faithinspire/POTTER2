# ⚡ QUICK DEPLOY COMMANDS

## Copy & Paste These Commands

### 1. Check Current Status
```bash
git status
```

### 2. Add All Changes
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "Fix loan tracker, payments, and customer registration - all features working"
```

### 4. Push to Git
```bash
git push origin main
```

**Note**: If your branch is `master` instead of `main`, use:
```bash
git push origin master
```

### 5. Check Push Succeeded
```bash
git log --oneline -1
```

## After Pushing

1. **Go to Render Dashboard**
2. **Wait 2-5 minutes** for automatic deployment
3. **Check "Events" tab** for deployment status
4. **Look for "Deploy succeeded"** message

## If Automatic Deployment Doesn't Start

1. Click "Manual Deploy" button
2. Select "Deploy latest commit"
3. Wait for build

## After Deployment Completes

1. **Open your Render URL**
2. **Clear browser cache**: `Ctrl+Shift+Delete`
3. **Hard refresh**: `Ctrl+F5`
4. **Test features**

## Verify Everything Works

```bash
# Test locally first (optional):
npm run build

# Should complete without errors
```

## Common Issues

### "Nothing to commit"
```bash
# Check if changes were saved
git status

# If files show as modified, add them:
git add .
git commit -m "Update"
git push
```

### "Permission denied"
```bash
# Check Git remote
git remote -v

# Should show your repository URL
```

### "Branch diverged"
```bash
# Pull latest changes first
git pull origin main

# Then push
git push origin main
```

## Environment Variables (if needed)

In Render Dashboard → Environment tab, ensure these are set:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Build Command (Render uses):
```bash
npm install && npm run build
```

## Start Command (Render uses):
```bash
npm run preview
```

---

**That's it!** Just run the commands above and your changes will deploy to Render.
