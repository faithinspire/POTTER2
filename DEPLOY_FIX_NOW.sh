#!/bin/bash

echo "🚀 Deploying Render Fix..."
echo ""

# Add all changes
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Fix blank page: update service worker and add Render config"

# Push
echo "🚀 Pushing to repository..."
git push origin main

echo ""
echo "✅ Done! Your fixes are deploying to Render."
echo ""
echo "⏱️  Wait 3-5 minutes for build to complete"
echo "🌐 Then open your Render URL in incognito mode"
echo "🔄 Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo ""
echo "📊 Monitor progress at: https://dashboard.render.com"
echo ""