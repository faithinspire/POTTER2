# 🔥 FIX: Phone Cannot Reach Site

## Problem
Your phone shows "Site cannot be reached" when accessing http://192.168.55.207:5174/

## Cause
Windows Firewall is blocking incoming connections on port 5174

---

## ✅ SOLUTION 1: Allow Node.js Through Firewall (RECOMMENDED)

### Step 1: Open Windows Firewall
1. Press `Windows + R`
2. Type: `firewall.cpl`
3. Press Enter

### Step 2: Allow Node.js
1. Click "Allow an app or feature through Windows Defender Firewall"
2. Click "Change settings" button
3. Click "Allow another app..."
4. Click "Browse..."
5. Navigate to: `C:\Program Files\nodejs\node.exe`
6. Click "Add"
7. Make sure BOTH "Private" and "Public" are checked
8. Click "OK"

### Step 3: Test
- On your phone, go to: http://192.168.55.207:5174/
- Should work now!

---

## ✅ SOLUTION 2: Create Firewall Rule (FASTER)

### Run this command as Administrator:

1. Right-click Start Menu
2. Click "Windows PowerShell (Admin)" or "Terminal (Admin)"
3. Run this command:

```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow
```

4. Test on your phone: http://192.168.55.207:5174/

---

## ✅ SOLUTION 3: Temporarily Disable Firewall (TESTING ONLY)

**WARNING: Only for testing! Re-enable after.**

1. Press `Windows + R`
2. Type: `firewall.cpl`
3. Click "Turn Windows Defender Firewall on or off"
4. Select "Turn off Windows Defender Firewall" for Private network
5. Click OK
6. Test on phone
7. **TURN IT BACK ON AFTER TESTING!**

---

## 🔍 VERIFY YOUR SETUP

### Check 1: Are you on the same WiFi?
- Computer and phone MUST be on same WiFi network
- Check WiFi name on both devices

### Check 2: Is the server running?
- Look at your terminal - should show:
  ```
  ➜  Network: http://192.168.55.207:5174/
  ```

### Check 3: Can you access on computer?
- Open http://localhost:5174/ on your computer
- If this doesn't work, server isn't running

---

## 📱 TESTING STEPS

1. **On Computer:** Make sure http://localhost:5174/ works
2. **Allow Firewall:** Use Solution 1 or 2 above
3. **On Phone:** 
   - Connect to SAME WiFi as computer
   - Open browser
   - Go to: http://192.168.55.207:5174/
4. **Should work!**

---

## 🚨 STILL NOT WORKING?

### Try Different Port
Sometimes port 5174 is blocked. Let's use port 3000:

1. Stop the server (Ctrl+C in terminal)
2. Edit `vite.config.ts` and change:
```typescript
server: {
  host: '0.0.0.0',
  port: 3000  // Changed from 5173
}
```
3. Run: `npm run dev`
4. Create firewall rule for port 3000:
```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```
5. Access: http://192.168.55.207:3000/

---

## 💡 QUICK TEST

Run this on your computer to test if port is accessible:

```powershell
Test-NetConnection -ComputerName 192.168.55.207 -Port 5174
```

If it says "TcpTestSucceeded : False" - firewall is blocking it.

---

## ✅ RECOMMENDED: Use Solution 2 (Firewall Rule)

It's the fastest and most secure option!
