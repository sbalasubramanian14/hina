# Hot Reload Guide for HINA

## What is Hot Reload?

Expo provides **Fast Refresh** (hot reload) that automatically reloads your app when you save code changes. This makes development much faster!

## How to Use Hot Reload

### 🔥 Automatic Reload (Default)
When you make changes to your code and save the file:
- Changes appear **automatically** in ~1-2 seconds
- App state is preserved (mostly)
- You don't need to do anything!

### ⌨️ Manual Reload Options

If automatic reload didn't work or you want to force a full reload:

**In Terminal (where `npm start` is running)**:
- Press `r` → Reload app
- Press `R` → Reload app and clear cache
- Press `m` → Toggle developer menu
- Press `?` → Show all commands

**On Your Phone**:
- **Android**: Shake device → Tap "Reload"
- **iOS**: Shake device → Tap "Reload"

Or use two-finger tap on device for quick reload

### 🆕 When to Force Full Reload

Use manual reload (`r` or shake device) when you:
- Install new dependencies
- Change `app.json` configuration
- Add new assets/images
- Experience weird behavior

### 🧹 Clear Cache & Reload

If you're seeing old code or experiencing issues:
1. Press `R` in terminal (reload with cache clear)
2. Or run: `npx expo start --clear`

##Tips

- **Save often** - Changes apply on save
- **Keep terminal visible** - Watch for errors
- **Yellow box warnings** - Tap to dismiss or fix
- **Red screens** - Shows errors, reload after fixing

## Current Status

✅ Hot reload is **ENABLED** and running
🔄 Just save your files and changes appear automatically!

---

**Pro Tip**: Leave the terminal running while you develop. It shows helpful logs and errors!
