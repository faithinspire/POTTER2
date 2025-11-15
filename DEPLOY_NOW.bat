@echo off
REM Windows batch file to deploy to Render

echo.
echo ========================================
echo   DEPLOYING TO RENDER
echo ========================================
echo.

echo Step 1: Adding files...
git add .

echo.
echo Step 2: Committing changes...
git commit -m "Fix: Weekly payments clickable, loan tracker, customer registration"

echo.
echo Step 3: Pushing to Git...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT STARTED!
echo ========================================
echo.
echo Render will now build and deploy automatically.
echo Wait 5 minutes, then:
echo   1. Clear browser cache (Ctrl+Shift+Delete)
echo   2. Hard refresh (Ctrl+F5)
echo   3. Test on your Render URL
echo.
pause
