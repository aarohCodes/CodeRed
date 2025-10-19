# Troubleshooting Guide - Wake Word System

## Quick Fixes

### Problem: Still seeing jittery behavior
**Solution**: 
1. Hard refresh the page: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Make sure you're using the latest `voicecommand-wakeword.js`

### Problem: Wake word not detecting
**Solution**:
1. Check microphone permission (browser should ask)
2. Speak clearly: "Hey Kitchen" (not too fast, not too slow)
3. Check console for errors (F12)
4. Try saying it a bit louder

### Problem: Still getting "aborted" errors
**Solution**:
1. Check if backend is running: `http://localhost:8000/docs`
2. Look for this in console: "🛑 Exiting conversation mode" (system will auto-recover)
3. The system will automatically return to wake word mode after 3 failed attempts

### Problem: "Unexpected token '<'" error
**Solution**:
1. Make sure you're loading the script correctly:
   ```html
   <script type="module" src="voicecommand-wakeword.js"></script>
   ```
2. Check that the file exists in the same directory as your HTML

### Problem: Backend connection failed
**Solution**:
1. Start backend server:
   ```powershell
   cd backend
   uvicorn main:app --reload
   ```
2. Verify it's running on port 8000
3. Check browser console for the exact error

## Console Error Guide

### ❌ "Speech recognition error: aborted"
**Meaning**: Recognition was stopped before finishing (usually intentional)
**Action**: Normal behavior, system will auto-restart (max 3 times)

### ❌ "Speech recognition error: no-speech"
**Meaning**: No speech detected in time
**Action**: Normal, just speak after the mic activates

### ❌ "Speech recognition error: audio-capture"
**Meaning**: Microphone not accessible
**Action**: 
1. Check microphone permissions
2. Make sure microphone is not used by another app
3. Try a different browser

### ❌ "Speech recognition error: not-allowed"
**Meaning**: User denied microphone permission
**Action**: 
1. Click the lock icon in address bar
2. Allow microphone access
3. Refresh page

### ❌ "Failed to connect to backend"
**Meaning**: Backend server not running or wrong URL
**Action**:
1. Start backend: `uvicorn main:app --reload`
2. Check URL is `http://localhost:8000`
3. Verify CORS is properly configured

### ❌ "ERR_NAME_NOT_RESOLVED" or "80:1 Failed to load"
**Meaning**: Trying to load something from invalid URL
**Action**: Check for typos in script src or fetch URLs

## State Check Commands

Open browser console (F12) and run these:

### Check current state
```javascript
// See if conversation is active
console.log('Conversation mode:', window.voiceCommand?.conversationMode);
console.log('Is recording:', window.voiceCommand?.isRecording);
console.log('Is speaking:', window.voiceCommand?.isSpeaking);
```

### Force reset
```javascript
// Manually exit conversation
if (window.voiceCommand) {
  window.voiceCommand.exitConversation();
}
```

### Check restart attempts
```javascript
// See how many restart attempts made
console.log('Restart attempts:', window.voiceCommand?.restartAttempts);
console.log('Max attempts:', window.voiceCommand?.maxRestartAttempts);
```

## Best Practices

### ✅ DO:
- Speak clearly and at normal volume
- Wait for audio response to finish before speaking again
- Click button to manually stop if needed
- Let system auto-recover from errors (it will!)
- Check console for helpful log messages

### ❌ DON'T:
- Don't say wake word multiple times rapidly
- Don't spam the button during operation
- Don't interrupt audio playback (or click button first)
- Don't restart page immediately if error occurs (wait for auto-recovery)

## Performance Tips

### If detection is too sensitive:
Edit `voicecommand-wakeword.js`, change:
```javascript
this.wakeWord = "hey kitchen";
// To something more unique:
this.wakeWord = "hey kitchen assistant";
```

### If restart is too aggressive:
Edit restart delay:
```javascript
// Line ~340
setTimeout(() => {
  this.startSpeechRecognition();
}, 1500);  // Increase to 2000 or 3000
```

### If max attempts too strict:
Edit max attempts:
```javascript
// Line ~12
this.maxRestartAttempts = 3;  // Increase to 5 or 10
```

## Testing Your Setup

### 1. Test Wake Word
```
1. Open page
2. Look for green breathing button (👂)
3. Say "Hey Kitchen"
4. Button should turn red (🎤)
Console: "🎉 Wake word detected!"
```

### 2. Test Command
```
1. After wake word activated
2. Say "What can I cook?"
3. Wait for response
Console: "✅ Final transcript: what can i cook"
Console: "🚀 Sending to backend..."
```

### 3. Test Audio Response
```
1. After command sent
2. Button turns blue (🔊)
3. Hear voice response
4. Button turns back to red (🎤)
Console: "✅ Audio playback finished"
```

### 4. Test Auto-Restart
```
1. After audio finishes
2. System automatically restarts
3. Ready for next command
Console: "🔄 Restarting listening..."
Console: "🎤 Speech recognition started"
```

### 5. Test Manual Stop
```
1. During conversation
2. Click button
3. Returns to wake word mode
Console: "🛑 Exiting conversation mode"
Console: "👂 Listening for wake word..."
```

## Expected Console Output (Normal Flow)

```
✅ Voice command ready - Listening for "Hey Kitchen"
👂 Listening for wake word "Hey Kitchen"...

[User says "Hey Kitchen"]

👂 Wake word check: hey kitchen
🎉 Wake word detected! Starting conversation mode...
🛑 Wake word recognition ended
🎤 Speech recognition started

[User says command]

📝 Interim transcript: [partial]
✅ Final transcript: [full command]
🚀 Sending to backend: [command]
✅ Backend response: {...}
🔊 Playing audio response...
✅ Audio playback finished
🔄 Restarting listening after response...
🎤 Speech recognition started

[System ready for next command]
```

## When to Restart Page

Restart if:
- ✅ Wake word stops responding completely
- ✅ Console shows JavaScript errors (not just speech errors)
- ✅ Button is unresponsive
- ✅ After updating the script file

Don't restart if:
- ❌ Seeing "aborted" errors (system will auto-recover)
- ❌ Restart attempts counter increments (normal)
- ❌ Backend connection failed (fix backend first)
- ❌ Single speech recognition error (system handles it)

## Getting Help

If still having issues:

1. **Check browser**: Use Chrome or Edge (Firefox doesn't support Web Speech API)
2. **Check console**: Open F12, look for red errors
3. **Check backend**: Visit `http://localhost:8000/docs`
4. **Check files**: Make sure `voicecommand-wakeword.js` exists
5. **Check permissions**: Microphone must be allowed

### Share This Info When Reporting Issues:
```
Browser: [Chrome/Edge/etc]
Error message: [exact error from console]
Backend running: [Yes/No]
Wake word triggered: [Yes/No]
Conversation started: [Yes/No]
Where it fails: [specific step]
```

---

**Most issues resolve with**: Hard refresh (Ctrl+F5) + Backend restart! 🎉
