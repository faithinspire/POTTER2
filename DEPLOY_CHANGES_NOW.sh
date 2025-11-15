#!/bin/bash
# Run these commands to deploy to Render

echo "🚀 Deploying changes to Render..."
echo ""

# Step 1: Add all changes
echo "📦 Adding files..."
git add .

# Step 2: Commit
echo "💾 Committing changes..."
git commit -m "Fix: Weekly payments clickable, loan tracker with calculations, customer registration"

# Step 3: Push to Git
echo "⬆️  Pushing to Git..."
git push origin main

echo ""
echo "✅ Done! Render will now deploy automatically."
echo "⏱️  Wait 5 minutes for deployment to complete."
echo "🌐 Then test on your Render URL"
echo ""
echo "After deployment:"
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "2. Hard refresh (Ctrl+F5)"
echo "3. Test the features"
