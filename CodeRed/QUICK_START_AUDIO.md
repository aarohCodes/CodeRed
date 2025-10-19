# Quick Start - Test Audio Integration

## 🚀 Start Everything

### 1. Start Backend (Terminal 1)
```powershell
cd backend
python main.py
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

### 2. Start Frontend (Terminal 2)
```powershell
cd frontend
npm start
```
Wait for: `Compiled successfully!`

## 🧪 Test Methods

### Method 1: Manual Test Button (Easiest!)
1. Look for **"Test Kitchen Assistant 🧪"** in top-right corner
2. Click to expand
3. Type: "What can I cook with chicken?"
4. Click "Ask Kitchen Assistant"
5. Watch magic happen:
   - Modal opens
   - Loading spinner
   - Text response appears
   - 🔊 **Audio plays automatically!**

### Method 2: Voice Command
1. Green microphone button in bottom-right
2. Say: **"Hey Kitchen"**
3. Button turns red (listening)
4. Say: "What's for dinner tonight?"
5. See transcript + response + hear audio

## ✅ What Should Happen

```
You ask: "How do I cook salmon?"
    ↓
Backend processes (3-5 seconds)
    ↓
Text appears: "Here's how to cook salmon perfectly..."
    ↓
🔊 Voice speaks the response (ElevenLabs voice)
    ↓
"Playing..." indicator shows during audio
    ↓
Complete! ✨
```

## 🎯 Quick Test Commands

1. **"What can I make with eggs?"**
2. **"Quick breakfast ideas"**
3. **"How to cook pasta"**
4. **"What's in my pantry?"**

## 🐛 Quick Fixes

### No audio plays?
- Click anywhere on page first (browsers need user interaction)
- Check browser console (F12) for errors
- Verify backend shows ElevenLabs API call

### Backend error?
- Check `.env` has ElevenLabs API key
- Verify `elevenlabs_utils.py` exists
- Check console logs in backend terminal

### Voice command not activating?
- Use manual test button instead
- Check microphone permissions
- Verify `.env` has Picovoice key

## 🎊 Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can click "Test Kitchen Assistant" button
- [ ] Can type question and click "Ask"
- [ ] See loading spinner
- [ ] See text response
- [ ] **HEAR audio response playing** 🔊
- [ ] See "Playing..." indicator

## 📝 What's New

**VoiceCommand.jsx:**
- ✅ Now plays audio automatically
- ✅ Shows "Playing..." indicator
- ✅ Uses `user_query` instead of `message`

**KitchenAssistant.jsx:**
- ✅ Complete React component
- ✅ Beautiful modal UI
- ✅ Audio playback integrated
- ✅ Quick suggestion buttons

**App.jsx:**
- ✅ Added collapsible test panel
- ✅ Easy access to manual testing

## 🎉 You're Done!

The complete voice-to-voice pipeline is ready:
1. Speech input → Porcupine + Web Speech API
2. Text processing → Gemini AI
3. Speech output → ElevenLabs TTS
4. Auto-play with visual feedback

**Try it now!** 🚀
