# 🆘 Emergency Recovery Guide

**Use this ONLY if something breaks during your pitch!**

---

## 🔴 Critical Issues & Fixes

### Issue 1: Server Won't Start

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Option A: Kill the process
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Option B: Use different port
npm run dev -- --port 5174
```

---

### Issue 2: Module Not Found

**Error:** `Cannot find module '@supabase/...'`

**Solution:**
```bash
# Clear node_modules and reinstall
rmdir /s /q node_modules
npm install
npm run dev
```

---

### Issue 3: Blank Page / No Content

**Error:** Page loads but nothing shows

**Solution:**
1. Open Developer Tools: **F12**
2. Go to **Console** tab
3. Look for red errors
4. If you see errors, **refresh page**: **Ctrl+R**
5. If still blank, **hard refresh**: **Ctrl+Shift+R**

---

### Issue 4: Page Takes Too Long to Load

**Error:** Spinning/loading forever

**Solution:**
1. Wait up to 10 seconds (Vite is compiling)
2. If still stuck, check terminal for errors
3. If terminal shows `[vite] error`, restart:
   ```bash
   # Press Ctrl+C to stop
   # Wait 2 seconds
   npm run dev
   ```

---

### Issue 5: Navigation Not Working

**Error:** Links don't respond / page doesn't change

**Solution:**
1. Check browser console: **F12**
2. If no errors, try **full page refresh**: **Ctrl+Shift+R**
3. If specific page breaks, try other pages first
4. Report the page name and screenshot error

---

## 🎯 60-Second Fixes (During Pitch)

| Problem | Quick Fix | Time |
|---------|-----------|------|
| Blank page | Ctrl+Shift+R | 2 sec |
| Slow load | Wait + F5 | 5 sec |
| Dead link | Click back button | 1 sec |
| Server down | Ctrl+C then npm run dev | 10 sec |
| Port taken | Use port 5174 | 15 sec |

---

## 🚨 If All Else Fails

### Plan B: Show Screenshots

Have these ready on your laptop:
- Landing page screenshot
- Dashboard screenshot
- Jobs page screenshot
- Alumni directory screenshot

```bash
# Take screenshots now
# Print them as PDF
# Save to desktop
```

### Plan C: Deploy to Vercel (Optional)

If you want online backup (do tonight):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Get live URL to share
```

---

## 🔧 Full System Reset (Last Resort)

```bash
# 1. Stop everything (Ctrl+C in terminal)

# 2. Clean build
npm run build

# 3. Delete cache
rmdir /s /q .vite
rmdir /s /q node_modules
npm cache clean --force

# 4. Fresh install
npm install

# 5. Start fresh
npm run dev
```

**Note:** This takes ~3 minutes, so only do before pitch!

---

## 📱 Mobile Backup

If your laptop completely fails:
- Connect phone to projector
- Show localhost screenshots on phone
- Demo using browser history

---

## 👨‍💼 What to Tell Judges If Demo Breaks

**Stay calm and say:**

*"Let me restart the server - this happens with local development sometimes. While that loads, let me walk you through the architecture..."*

Then show:
- Code structure
- Tech stack screenshot
- Pitch notes documentation
- Screenshots/video backup

---

## ✅ Before You Leave Today

**Test these NOW:**
- [ ] npm run dev starts without errors
- [ ] http://localhost:5173 loads
- [ ] Can click links and navigate
- [ ] Screenshots taken as backup
- [ ] Pitch notes ready to present
- [ ] Browser console shows no red errors

**If all ✅ — You're golden! 🎉**

---

## 💬 Remember

- Judges understand tech demos can be finicky
- Your **knowledge** matters more than perfect demo
- Have **plan B & C** ready
- **Practice** the pitch without the demo
- **Confidence** is your best tool

---

**You've got this! 💪🚀**
