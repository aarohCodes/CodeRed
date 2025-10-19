// Standalone Voice Command for non-React pages (test.html, profile.html)
// Continuous conversation mode with speech-to-text and text-to-speech

class VoiceCommandStandalone {
  constructor() {
    this.isListening = false;
    this.isRecording = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.currentAudio = null;
    this.conversationMode = false;  // Toggle for continuous conversation
    
    this.init();
  }

  async init() {
    try {
      // Create UI
      this.createUI();
      
      // Check for speech recognition support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        this.showError('Speech recognition not supported in this browser. Use Chrome or Edge.');
        return;
      }
      
      this.isListening = true;
      this.updateUI();
      console.log('✅ Voice command ready - Click to start conversation');
      
      // Show instruction
      this.showWakeIndicator();
    } catch (err) {
      console.error('Failed to initialize voice command:', err);
      this.showError(`Voice command unavailable: ${err.message}`);
    }
  }

  createUI() {
    // Create button
    const button = document.createElement('button');
    button.id = 'voiceCommandBtn';
    button.className = 'voice-command-btn';
    button.innerHTML = '🎤';
    button.onclick = () => this.toggleManual();
    
    // Create status popup
    const popup = document.createElement('div');
    popup.id = 'voiceCommandPopup';
    popup.className = 'voice-command-popup hidden';
    popup.innerHTML = `
      <button class="close-btn" onclick="document.getElementById('voiceCommandPopup').classList.add('hidden')">✕</button>
      <div id="voiceStatus"></div>
    `;
    
    // Add to page
    document.body.appendChild(button);
    document.body.appendChild(popup);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .voice-command-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: none;
        background: #4ade80;
        color: white;
        font-size: 32px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        transition: all 0.3s;
      }
      .voice-command-btn:hover {
        transform: scale(1.1);
      }
      .voice-command-btn.listening {
        background: #ef4444;
        animation: pulse 1s infinite;
      }
      .voice-command-btn.speaking {
        background: #3b82f6;
        animation: pulse 1s infinite;
      }
      .voice-command-btn.active {
        background: #10b981;
        animation: pulse-slow 2s infinite;
      }
      .voice-command-btn.inactive {
        background: #6b7280;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.95); }
      }
      @keyframes pulse-slow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      .voice-command-popup {
        position: fixed;
        bottom: 100px;
        right: 24px;
        background: white;
        border-radius: 12px;
        padding: 20px;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 1001;
      }
      .voice-command-popup.hidden {
        display: none;
      }
      .voice-command-popup .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #6b7280;
      }
      #voiceStatus {
        margin-top: 10px;
      }
      .status-label {
        font-size: 12px;
        font-weight: bold;
        color: #6b7280;
        margin-bottom: 4px;
      }
      .status-text {
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 12px;
      }
      .wake-indicator {
        position: fixed;
        bottom: 100px;
        right: 24px;
        background: #d1fae5;
        border: 2px solid #10b981;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        color: #065f46;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);
  }

  updateUI() {
    const btn = document.getElementById('voiceCommandBtn');
    if (!btn) return;

    btn.className = 'voice-command-btn';
    
    if (this.isSpeaking) {
      btn.innerHTML = '🔊';  // Speaking
      btn.className += ' speaking';
    } else if (this.isRecording) {
      btn.innerHTML = '🎤';  // Recording
      btn.className += ' listening';
    } else if (this.conversationMode) {
      btn.innerHTML = '💬';  // Conversation active
      btn.className += ' active';
    } else {
      btn.innerHTML = '🎤';  // Ready
      btn.className += ' inactive';
    }
  }

  showWakeIndicator() {
    let indicator = document.getElementById('wakeIndicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'wakeIndicator';
      indicator.className = 'wake-indicator';
      indicator.innerHTML = `
        <div>🎤 <strong>Click to Start Conversation</strong></div>
        <div style="font-size: 12px; margin-top: 4px;">I'll listen and respond with voice</div>
      `;
      document.body.appendChild(indicator);
    }
  }

  hideWakeIndicator() {
    const indicator = document.getElementById('wakeIndicator');
    if (indicator) indicator.remove();
  }

  startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showError('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      this.isRecording = true;
      this.updateUI();
      this.showStatus('🎤 Listening...', 'Speak now...', '');
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      console.log('📝 Interim transcript:', transcript);
      this.showStatus('🎤 You are saying:', transcript, '');
      
      if (event.results[event.results.length - 1].isFinal) {
        console.log('✅ Final transcript:', transcript);
        this.sendToBackend(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      this.showError(`Error: ${event.error}`);
      this.isRecording = false;
      this.updateUI();
    };

    this.recognition.onend = () => {
      console.log('🛑 Speech recognition ended');
      this.isRecording = false;
      this.updateUI();
      
      // If in conversation mode and not speaking, start listening again
      if (this.conversationMode && !this.isSpeaking) {
        console.log('🔄 Restarting listening in conversation mode...');
        setTimeout(() => {
          if (this.conversationMode && !this.isSpeaking) {
            this.startSpeechRecognition();
          }
        }, 1000);  // Brief pause before restarting
      }
    };

    this.recognition.start();
  }

  async sendToBackend(text) {
    try {
      this.showStatus('📤 You said:', text, '🤔 Thinking...');
      
      console.log('🚀 Sending to backend:', text);
      
      const response = await fetch('http://localhost:8000/kitchen_converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_query: text })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      // Display text response
      this.showStatus('📤 You said:', text, `🤖 Assistant: ${data.text || data.response || 'No response'}`);
      
      // Play audio if available
      if (data.audio_base64) {
        console.log('🔊 Playing audio response...');
        await this.playAudio(data.audio_base64);
      } else {
        console.warn('⚠️ No audio in response');
        // If in conversation mode and no audio, restart listening
        if (this.conversationMode) {
          setTimeout(() => {
            if (this.conversationMode && !this.isSpeaking) {
              this.startSpeechRecognition();
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error('❌ Backend error:', err);
      this.showError(`Failed to connect to backend: ${err.message}`);
      
      // Restart listening in conversation mode even on error
      if (this.conversationMode) {
        setTimeout(() => {
          if (this.conversationMode && !this.isSpeaking) {
            this.startSpeechRecognition();
          }
        }, 2000);
      }
    }
  }

  playAudio(audioBase64) {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = null;
        }
        
        this.isSpeaking = true;
        this.updateUI();
        
        // Decode base64 to binary
        const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        
        // Show playing indicator
        const status = document.getElementById('voiceStatus');
        const playingIndicator = document.createElement('div');
        playingIndicator.id = 'playingIndicator';
        playingIndicator.innerHTML = `
          <div class="status-label" style="color: #10b981; margin-top: 8px;">🔊 Speaking...</div>
        `;
        status.appendChild(playingIndicator);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.isSpeaking = false;
          this.currentAudio = null;
          this.updateUI();
          
          const indicator = document.getElementById('playingIndicator');
          if (indicator) indicator.remove();
          
          console.log('✅ Audio playback finished');
          
          // If in conversation mode, restart listening after audio finishes
          if (this.conversationMode) {
            console.log('🔄 Restarting listening after response...');
            setTimeout(() => {
              if (this.conversationMode && !this.isSpeaking) {
                this.startSpeechRecognition();
              }
            }, 500);  // Small delay before listening again
          }
          
          resolve();
        };
        
        audio.onerror = (e) => {
          console.error('❌ Audio playback error:', e);
          this.isSpeaking = false;
          this.currentAudio = null;
          this.updateUI();
          
          const indicator = document.getElementById('playingIndicator');
          if (indicator) indicator.remove();
          
          this.showError('Failed to play audio response');
          reject(e);
        };
        
        audio.play().catch(err => {
          console.error('❌ Audio play failed:', err);
          this.isSpeaking = false;
          this.currentAudio = null;
          this.updateUI();
          
          const indicator = document.getElementById('playingIndicator');
          if (indicator) indicator.remove();
          
          this.showError('Audio playback blocked - click the page first');
          reject(err);
        });
        
        console.log('🎵 Audio started playing');
      } catch (err) {
        console.error('❌ Error in playAudio:', err);
        this.isSpeaking = false;
        this.updateUI();
        this.showError('Failed to process audio');
        reject(err);
      }
    });
  }

  showStatus(label1, text1, text2) {
    const popup = document.getElementById('voiceCommandPopup');
    const status = document.getElementById('voiceStatus');
    
    popup.classList.remove('hidden');
    status.innerHTML = `
      ${label1 ? `<div class="status-label">${label1}</div>` : ''}
      ${text1 ? `<div class="status-text">${text1}</div>` : ''}
      ${text2 ? `
        <div class="status-label">Assistant:</div>
        <div class="status-text">${text2}</div>
      ` : ''}
    `;
  }

  showError(message) {
    const popup = document.getElementById('voiceCommandPopup');
    const status = document.getElementById('voiceStatus');
    
    popup.classList.remove('hidden');
    status.innerHTML = `
      <div class="status-label" style="color: #dc2626;">Error:</div>
      <div class="status-text" style="color: #dc2626;">${message}</div>
    `;
  }

  toggleManual() {
    if (this.conversationMode) {
      // Stop conversation mode
      console.log('🛑 Stopping conversation mode');
      this.conversationMode = false;
      
      // Stop current recognition
      if (this.recognition) {
        this.recognition.stop();
      }
      
      // Stop current audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      
      this.isRecording = false;
      this.isSpeaking = false;
      this.isListening = true;
      this.updateUI();
      this.showWakeIndicator();
      
      this.showStatus('💬 Conversation Mode', 'Stopped', '');
      setTimeout(() => {
        document.getElementById('voiceCommandPopup').classList.add('hidden');
      }, 2000);
    } else {
      // Start conversation mode
      console.log('🎯 Starting conversation mode');
      this.conversationMode = true;
      this.hideWakeIndicator();
      this.updateUI();
      
      this.showStatus('💬 Conversation Mode', 'Active - I\'m listening!', 'Ask me anything about cooking...');
      
      // Start listening
      setTimeout(() => {
        this.startSpeechRecognition();
      }, 500);
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VoiceCommandStandalone();
  });
} else {
  new VoiceCommandStandalone();
}
