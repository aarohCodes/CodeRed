# Voice Command Setup Guide

## Overview
This guide explains how to set up the voice command feature with Porcupine wake word detection and Web Speech API integration.

## Prerequisites

1. **Picovoice Access Key**
   - Sign up for a free account at [Picovoice Console](https://console.picovoice.ai/)
   - Get your Access Key from the dashboard
   - Free tier includes up to 3 wake words

2. **Browser Compatibility**
   - Chrome/Edge (recommended) - Full support for Web Speech API
   - Firefox - Limited support
   - Safari - Partial support

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install @picovoice/porcupine-web
```

### 2. Configure Porcupine Access Key

Edit `src/components/VoiceCommand.jsx` and replace `YOUR_ACCESS_KEY_HERE` with your actual Picovoice access key:

```javascript
const porcupine = await PorcupineWorker.create(
  'YOUR_PICOVOICE_ACCESS_KEY', // Replace this
  [{ builtin: 'Hey Google' }],
  // ...
);
```

### 3. Choose Wake Word

**Option A: Use Built-in Wake Words**
```javascript
[{ builtin: 'Hey Google' }]  // or 'Alexa', 'Computer', 'Hey Siri', 'Jarvis', etc.
```

**Option B: Create Custom Wake Word**
1. Go to [Picovoice Console](https://console.picovoice.ai/)
2. Navigate to "Porcupine" section
3. Click "Train Custom Wake Word"
4. Train your custom phrase (e.g., "Hey Kitchen")
5. Download the `.ppn` file
6. Place it in `public/` folder
7. Update the code:
```javascript
[{
  custom: '/your-custom-wake-word.ppn',
  sensitivity: 0.5
}]
```

### 4. Configure Backend Endpoint

The backend endpoint is already set up at `http://localhost:8000/kitchen_converse`. Make sure your FastAPI server is running:

```bash
cd backend
uvicorn main:app --reload
```

### 5. Start the Application

```bash
cd frontend
npm start
```

## How It Works

### 1. Wake Word Detection (Porcupine)
- Porcupine continuously listens for the wake word in the background
- When "Hey Kitchen" (or your chosen wake word) is detected, it triggers the voice command mode
- This runs entirely locally - no audio is sent to servers

### 2. Voice Transcription (Web Speech API)
- After wake word detection, Web Speech API starts listening for your command
- Your speech is transcribed to text in real-time
- You'll see interim results as you speak

### 3. AI Processing (Gemini via FastAPI)
- The transcribed text is sent to your FastAPI backend at `/kitchen_converse`
- Gemini AI processes the command with context about your kitchen inventory
- The response is returned and displayed

## Usage

1. **Look for the microphone button** in the bottom-right corner of the screen
2. **Green button** = Wake word detection is active
3. **Say "Hey Kitchen"** (or your custom wake word)
4. **Red pulsing button** = Now listening for your command
5. **Speak your command** naturally, e.g.:
   - "What can I cook with eggs and cheese?"
   - "Give me a recipe for chicken"
   - "What's expiring soon?"
6. **View the response** in the popup box

## Customization

### Change Wake Word Sensitivity
```javascript
[{
  builtin: 'Hey Google',
  sensitivity: 0.7  // 0.0 to 1.0, higher = more sensitive
}]
```

### Modify Speech Recognition Language
```javascript
recognition.lang = 'en-US';  // Change to 'es-ES', 'fr-FR', etc.
```

### Customize Backend Response
Edit `backend/main.py` in the `/kitchen_converse` endpoint to modify how Gemini responds to commands.

## Troubleshooting

### Wake Word Not Detecting
- Check browser console for errors
- Verify your Picovoice access key is correct
- Try increasing sensitivity: `sensitivity: 0.8`
- Ensure microphone permissions are granted

### Speech Recognition Not Working
- Check if your browser supports Web Speech API
- Verify microphone permissions
- Try speaking more clearly and slowly
- Check for HTTPS requirement (may need HTTPS in production)

### Backend Connection Failed
- Ensure FastAPI server is running on port 8000
- Check CORS configuration in `backend/main.py`
- Verify the backend URL in VoiceCommand.jsx

### No Response from Gemini
- Check if Gemini API key is configured in backend
- Look at backend terminal for error messages
- Verify `gemini_utils.py` is working correctly

## Production Deployment

### Security Considerations
1. **Never commit your Picovoice access key** to version control
   - Use environment variables: `process.env.REACT_APP_PICOVOICE_KEY`
   
2. **HTTPS Required**
   - Web Speech API requires HTTPS in production
   - Deploy frontend to Vercel/Netlify with HTTPS

3. **Backend Authentication**
   - Add authentication to `/kitchen_converse` endpoint
   - Implement rate limiting

### Performance Optimization
1. **Lazy Load Porcupine**
   - Only initialize when user enables voice commands
   
2. **Debounce Requests**
   - Prevent spam by adding cooldown between commands

## Example Commands

Try these voice commands:
- "What recipes can I make?"
- "What's in my pantry?"
- "Give me a quick breakfast idea"
- "How do I cook salmon?"
- "What ingredients are expiring soon?"
- "Suggest a dinner recipe"

## Resources

- [Picovoice Documentation](https://picovoice.ai/docs/)
- [Web Speech API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Gemini API Documentation](https://ai.google.dev/docs)

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all setup steps are complete
3. Test with simpler commands first
4. Check backend logs for API errors
