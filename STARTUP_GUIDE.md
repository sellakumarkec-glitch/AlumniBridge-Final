# 🚀 Quick Startup Guide - Alumni Bridge

## ✅ How to Run (No Errors)

### **Option 1: Fresh Start (Recommended)**

```bash
# 1. Open PowerShell in project folder
cd c:\Users\Welcome\Downloads\project-bolt-sb1-5kf3cmb2\project

# 2. Install dependencies (first time only)
npm install

# 3. Start dev server
npm run dev
```

✅ Site opens at: **http://localhost:5173/**

---

### **Option 2: If Already Running**

Just go to `http://localhost:5173/` in browser  
(No need to restart if server is already running)

---

## ⚡ Fast Restart (If Something Breaks)

```bash
# Kill the server: Press Ctrl+C in terminal
# Then restart:
npm run dev
```

---

## 🛠️ Troubleshooting

### ❌ "Port 5173 already in use"
```bash
# Kill the process and restart
npm run dev
# Or use different port
```

### ❌ "Cannot find module"
```bash
# Reinstall dependencies
npm install
npm run dev
```

### ❌ Blank page / Error in browser console
✅ **Already fixed!** Our mock Supabase client handles this.
- Just refresh page: F5 or Ctrl+R

### ❌ Node/npm not found
```bash
# Check if Node.js is installed
node --version
npm --version

# If not, install from nodejs.org
```

---

## 📋 Pre-Pitch Checklist

- [ ] Download this project to your laptop **the night before**
- [ ] Run `npm install` once to download dependencies
- [ ] Test `npm run dev` to ensure it starts
- [ ] Visit `http://localhost:5173/` to verify loading
- [ ] Click through a few pages to ensure no errors
- [ ] Check browser console (F12) - should see no red errors
- [ ] Keep your laptop plugged in during pitch
- [ ] Have backup: Screenshot/video of demo saved

---

## 🎯 For Your Pitch Tomorrow

### **Before You Start**
1. Close all unnecessary programs (save RAM)
2. Open terminal in project folder
3. Run: `npm run dev`
4. Wait 5 seconds for "ready" message
5. Open browser: `http://localhost:5173/`

### **During Pitch**
- Don't pause/minimize terminal
- Use Chrome/Edge browser (tested & reliable)
- Internet not required (fully local)
- If something breaks, refresh page: F5
- Have phone backup ready with screenshots

### **Backup Plan**
If laptop fails:
- Have screenshots/video ready to show
- Have live link ready (if you deploy to Vercel later)

---

## ⏱️ Estimated Times

| Task | Time |
|------|------|
| npm install | 1-2 min |
| npm run dev startup | 5 sec |
| Page load | < 1 sec |
| Total from scratch | ~2 min |

---

## 🎉 Success Indicators

✅ Terminal shows: `VITE v5.4.21 ready in XXX ms`  
✅ No red errors in console  
✅ Landing page loads with beautiful UI  
✅ "Join the network" button works  
✅ Can navigate to different pages  

---

## 📞 If Issues Arise

**Common Fix: Restart Everything**
```bash
# 1. Press Ctrl+C in terminal (stop server)
# 2. Close browser tab
# 3. Clear browser cache (Ctrl+Shift+Delete)
# 4. Run: npm run dev
# 5. Open: http://localhost:5173/
```

---

## 💡 Pro Tips

- **Don't upgrade packages** before pitch - stick with current versions
- **Keep demo laptop clean** - close other apps
- **Test at different times** - verify it works consistently
- **Save session state** - bookmark localhost:5173 for quick access
- **Disable popup notifications** - might distract during demo

---

## 🎯 Final Check: Run This Now

```bash
# Navigate to project
cd c:\Users\Welcome\Downloads\project-bolt-sb1-5kf3cmb2\project

# Verify it's working
npm run dev

# In browser: http://localhost:5173/
# Should see landing page with:
# - AlumniBridge logo
# - "Bridge the gap..." heading
# - 4 stats boxes (12K+, 4.2K, 850+, 320+)
# - Feature cards below
```

If you see all this ✅ **You're ready for tomorrow!**

---

**Good luck! 🚀 You've got this!**
