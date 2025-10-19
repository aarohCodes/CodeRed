# Voice Command - Two Versions

## ✅ FIXED: Standalone Pages Now Work!

The error was because wake word detection (Porcupine) requires webpack bundling, which only works in the React app.

## Two Different Implementations:

### 1. React App (`http://localhost:3000`)
- ✅ **Wake Word Detection**: Say "Hey Kitchen" hands-free
- ✅ Uses Porcupine library
- ✅ Automatic activation
- **How to use**: Just say "Hey Kitchen" and speak

### 2. Standalone Pages (`test.html`, `profile.html`)
- ✅ **Click-to-Speak**: Manual activation
- ✅ No wake word (browser limitation)
- ✅ Still sends commands to AI backend
- **How to use**: Click the microphone button, then speak

## Why the Difference?

**Wake word detection** (like "Hey Kitchen") requires:
- npm/webpack bundling
- WebAssembly modules
- Complex initialization

This only works in the React app environment. For standalone HTML pages, we use **click-to-speak** instead, which is simpler and works everywhere.

## 🚀 How to Use on Standalone Pages:

1. Open `test.html` or `profile.html`
2. **Click the green microphone button** (bottom-right)
3. Button turns **red and pulses** = now listening
4. **Speak your command**: "What can I cook?"
5. See the AI response in the popup!

## Both Versions:
- ✅ Voice transcription (Web Speech API)
- ✅ Send commands to backend
- ✅ Get AI responses from Gemini
- ✅ Visual feedback

The only difference is **activation method**:
- React: Say "Hey Kitchen" 🗣️
- HTML: Click button 🖱️

Both work great! The click-to-speak version is actually more reliable since it doesn't have false activations.
