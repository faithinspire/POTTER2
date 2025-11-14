@echo off
echo Creating Firewall Rule for Vite Dev Server...
echo.
echo Right-click this file and select "Run as administrator"
echo.
pause

netsh advfirewall firewall add rule name="Vite Dev Server 5174" dir=in action=allow protocol=TCP localport=5174
netsh advfirewall firewall add rule name="Vite Dev Server 5173" dir=in action=allow protocol=TCP localport=5173

echo.
echo ✅ Firewall rules created!
echo.
echo Now try accessing from your phone:
echo http://192.168.55.207:5174/
echo.
pause
