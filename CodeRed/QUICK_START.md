## 🎤 Quick Start Guide - "Hey Kitchen" Voice Assistant

### Step 1: Start Backend
```powershell
cd c:\Users\aaroh\CodeRed\backend
uvicorn main:app --reload
```
✅ Server should start on `http://localhost:8000`

### Step 2: Open Your Page
- Open `profile.html` or `analytics.html` in Chrome/Edge
- Grant microphone permission when asked

### Step 3: Use Voice Commands
1. **Say "Hey Kitchen"** - Activates the assistant
2. **Speak your command** - e.g., "What can I cook with chicken?"
3. **Listen to response** - AI responds with voice
4. **Continue conversation** - No need to say "Hey Kitchen" again
5. **Click button to stop** - Returns to wake word mode

### Visual Indicators
- 👂 **Green (breathing)** = Waiting for "Hey Kitchen"
- 🎤 **Red (pulsing)** = Listening to you
- 🔊 **Blue (pulsing)** = Speaking response
- 💬 **Solid green** = Active conversation

### Common Issues

**"Hey Kitchen" not responding?**
- Speak clearly and at normal volume
- Check console (F12) for errors
- Verify microphone permission

**Backend connection failed?**
- Make sure backend is running on port 8000
- Check `http://localhost:8000/docs` in browser
- Restart backend if needed

**No audio response?**
- Check ElevenLabs API key in `.env`
- Verify browser audio permissions
- Check backend terminal for errors

### What Changed?
✅ **Before**: Had to click mic button each time
✅ **Now**: Just say "Hey Kitchen" - mic is always listening!

### Files Changed:
- `voicecommand-wakeword.js` - New wake word script
- `main.py` - Fixed backend errors
- `profile.html` & `analytics.html` - Updated to use new script

---
Need help? Check `WAKE_WORD_FEATURE.md` for full documentation.
