# 🔧 ANDROID STUDIO - FIND BUILD MENU

## 📍 YOU'RE HERE: Android Studio is open with your project

---

## 🎯 STEP-BY-STEP TO BUILD APK

### Step 1: Wait for Gradle Sync
**IMPORTANT:** Look at the bottom of Android Studio screen
- You should see: "Gradle sync in progress..." or "Build" tab
- **WAIT** until it says "BUILD SUCCESSFUL" or "Gradle sync finished"
- This can take 5-15 minutes the first time!

### Step 2: Find the Build Menu
Once Gradle sync is complete:

**Option A: Top Menu Bar**
1. Look at the very top of Android Studio
2. You'll see: File | Edit | View | Navigate | Code | Analyze | **Build** | Run | Tools
3. Click **"Build"**

**Option B: If Build Menu is Missing**
1. Click **"View"** in top menu
2. Select **"Appearance"**
3. Check **"Toolbar"** and **"Navigation Bar"**
4. The Build menu should appear

### Step 3: Build APK
1. Click **"Build"** menu
2. Select **"Build Bundle(s) / APK(s)"**
3. Click **"Build APK(s)"**
4. Wait for build to complete (2-5 minutes)

### Step 4: Find Your APK
1. When build completes, you'll see a notification
2. Click **"locate"** in the notification
3. OR manually go to: `android/app/build/outputs/apk/debug/`
4. Your APK file is: **`app-debug.apk`**

---

## 🚨 TROUBLESHOOTING

### Problem: "Build" Menu Not Visible
**Solution:**
1. Click **"View"** → **"Tool Windows"** → **"Build"**
2. OR press **Ctrl+F9** (Windows) to build directly

### Problem: Gradle Sync Failed
**Solution:**
1. Click **"File"** → **"Sync Project with Gradle Files"**
2. Wait for sync to complete
3. If still fails, click **"Build"** → **"Clean Project"**
4. Then **"Build"** → **"Rebuild Project"**

### Problem: Can't Find APK After Build
**Location:** Your APK is always here:
```
C:\Users\User\POTTERS\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## ⚡ QUICK KEYBOARD SHORTCUTS

- **Ctrl+F9** - Build project
- **Ctrl+Shift+F9** - Build APK directly
- **Ctrl+F5** - Sync with Gradle

---

## 📱 WHAT THE APK LOOKS LIKE

Your APK file will be named:
- **`app-debug.apk`** (about 10-50 MB)
- This is the file you send to your staff
- They install it on their phones

---

## 🎯 CURRENT STATUS CHECK

**Look at the bottom of Android Studio:**

✅ **"BUILD SUCCESSFUL"** - Ready to build APK
❌ **"Gradle sync in progress"** - Wait for this to finish
❌ **"Build failed"** - Check error messages

---

## 📞 IF STILL STUCK

**Alternative Method - Command Line:**
1. Open Command Prompt/PowerShell
2. Navigate to your project: `cd C:\Users\User\POTTERS`
3. Run: `cd android`
4. Run: `gradlew.bat assembleDebug`
5. APK will be in: `app\build\outputs\apk\debug\app-debug.apk`

---

## 🎉 SUCCESS INDICATORS

You'll know it worked when:
1. **Build completes** without errors
2. **Notification appears** saying "APK(s) generated successfully"
3. **APK file exists** in the debug folder
4. **File size** is reasonable (10-50 MB)

---

**The Build menu should be visible once Gradle sync completes!**

**Current step: Wait for Gradle sync, then look for Build menu at the top!**