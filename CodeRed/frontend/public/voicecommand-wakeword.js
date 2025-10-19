// Voice Command with Wake Word Detection - Always listening for "Hey Kitchen"
// Continuous conversation mode with speech-to-text and text-to-speech

class VoiceCommandWakeWord {
  constructor() {
    this.isListening = false;
    this.isRecording = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.wakeWordRecognition = null;
    this.currentAudio = null;
    this.conversationMode = false;  // Active conversation after wake word
    this.wakeWord = "hey kitchen";  // Wake word to activate
    this.isActivating = false;  // Prevent multiple activations
    this.restartTimeout = null;  // Track restart timeouts
    this.maxRestartAttempts = 3;  // Limit restart attempts
    this.restartAttempts = 0;
    this.audioUnlocked = false;  // Track if audio is unlocked
    
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
      console.log('✅ Voice command ready - Listening for "Hey Kitchen"');
      
      // Show instruction with audio unlock prompt
      this.showWakeIndicator();
      
      // Setup audio unlock on any user interaction
      this.setupAudioUnlock();
      
      // Start listening for wake word immediately
      this.startWakeWordListening();
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
    button.onclick = () => this.handleButtonClick();
    
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
        background: transparent;
        color: transparent;
        font-size: 32px;
        cursor: pointer;
        box-shadow: none;
        z-index: 1000;
        transition: all 0.3s;
        opacity: 0;
      }
      .voice-command-btn:hover {
        opacity: 0;
      }
      .voice-command-btn.listening {
        background: transparent;
        animation: none;
        opacity: 0;
      }
      .voice-command-btn.speaking {
        background: transparent;
        animation: none;
        opacity: 0;
      }
      .voice-command-btn.active {
        background: transparent;
        animation: none;
        opacity: 0;
      }
      .voice-command-btn.waiting {
        background: transparent;
        animation: none;
        opacity: 0;
      }
      @keyframes pulse {
        0%, 100% { opacity: 0; transform: scale(1); }
        50% { opacity: 0; transform: scale(0.95); }
      }
      @keyframes pulse-slow {
        0%, 100% { opacity: 0; }
        50% { opacity: 0; }
      }
      @keyframes breathe {
        0%, 100% { opacity: 0; }
        50% { opacity: 0; }
      }
      .voice-command-popup {
        position: fixed;
        bottom: 100px;
        right: 24px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
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
        display: none;
      }
      .stop-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 12px;
        width: 100%;
      }
      .stop-btn:hover {
        background: #dc2626;
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
    } else if (this.conversationMode && this.isRecording) {
      btn.innerHTML = '🎤';  // Recording in conversation
      btn.className += ' listening';
    } else if (this.conversationMode) {
      btn.innerHTML = '💬';  // Conversation active
      btn.className += ' active';
    } else {
      btn.innerHTML = '👂';  // Waiting for wake word
      btn.className += ' waiting';
    }
  }

  showWakeIndicator() {
    let indicator = document.getElementById('wakeIndicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'wakeIndicator';
      indicator.className = 'wake-indicator';
      indicator.innerHTML = `
        <div>👂 <strong>Say "Hey Kitchen"</strong></div>
        <div style="font-size: 12px; margin-top: 4px;">I'm always listening for you!</div>
        ${!this.audioUnlocked ? '<div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">💡 Click anywhere to enable audio</div>' : ''}
      `;
      document.body.appendChild(indicator);
    }
  }

  setupAudioUnlock() {
    const unlockAudio = async () => {
      if (this.audioUnlocked) return;
      
      try {
        // Create and play a silent audio to unlock
        const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4RgAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
        silentAudio.volume = 0.01;
        await silentAudio.play();
        this.audioUnlocked = true;
        console.log('🔊 Audio unlocked successfully');
        
        // Update wake indicator
        const indicator = document.getElementById('wakeIndicator');
        if (indicator && !this.conversationMode) {
          indicator.innerHTML = `
            <div>👂 <strong>Say "Hey Kitchen"</strong></div>
            <div style="font-size: 12px; margin-top: 4px;">I'm always listening for you!</div>
          `;
        }
        
        // Remove listeners after unlock
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      } catch (err) {
        console.warn('⚠️ Could not unlock audio yet:', err.message);
      }
    };
    
    // Listen for any user interaction
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
  }

  hideWakeIndicator() {
    const indicator = document.getElementById('wakeIndicator');
    if (indicator) indicator.remove();
  }

  startWakeWordListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showError('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.wakeWordRecognition = new SpeechRecognition();
    this.wakeWordRecognition.continuous = true;  // Keep listening
    this.wakeWordRecognition.interimResults = true;
    this.wakeWordRecognition.lang = 'en-US';

    this.wakeWordRecognition.onstart = () => {
      console.log('👂 Listening for wake word "Hey Kitchen"...');
      this.updateUI();
    };

    this.wakeWordRecognition.onresult = (event) => {
      // Only check final results to avoid duplicate triggers
      if (!event.results[event.results.length - 1].isFinal) {
        return;
      }
      
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      transcript = transcript.toLowerCase().trim();
      console.log('👂 Wake word check:', transcript);
      
      // Check if wake word is detected and not already activating
      if (transcript.includes(this.wakeWord) && !this.isActivating && !this.conversationMode) {
        console.log('🎉 Wake word detected! Starting conversation mode...');
        this.activateConversation();
      }
    };

    this.wakeWordRecognition.onerror = (event) => {
      console.error('❌ Wake word recognition error:', event.error);
      // Restart wake word listening after error
      if (!this.conversationMode) {
        setTimeout(() => {
          if (!this.conversationMode) {
            this.startWakeWordListening();
          }
        }, 1000);
      }
    };

    this.wakeWordRecognition.onend = () => {
      console.log('🛑 Wake word recognition ended');
      // Restart if not in conversation mode
      if (!this.conversationMode) {
        setTimeout(() => {
          if (!this.conversationMode) {
            this.startWakeWordListening();
          }
        }, 500);
      }
    };

    this.wakeWordRecognition.start();
  }

  activateConversation() {
    // Prevent multiple activations
    if (this.isActivating || this.conversationMode) {
      return;
    }
    
    this.isActivating = true;
    
    // Stop wake word listening
    if (this.wakeWordRecognition) {
      this.wakeWordRecognition.stop();
      this.wakeWordRecognition = null;
    }
    
    // Start conversation mode
    this.conversationMode = true;
    this.restartAttempts = 0;  // Reset restart attempts
    this.hideWakeIndicator();
    this.updateUI();
    
    this.showStatus('💬 Conversation Active', 'Listening for your command...', '');
    
    // Play a confirmation sound or just start listening
    setTimeout(() => {
      this.isActivating = false;
      this.startSpeechRecognition();
    }, 500);
  }

  startSpeechRecognition() {
    // Don't start if already recording or if we've hit restart limit
    if (this.isRecording) {
      console.log('⚠️ Already recording, skipping start');
      return;
    }
    
    if (this.restartAttempts >= this.maxRestartAttempts) {
      console.log('⚠️ Max restart attempts reached, exiting conversation');
      this.exitConversation();
      return;
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showError('Speech recognition not supported');
      return;
    }

    // Stop any existing recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore errors
      }
      this.recognition = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      this.isRecording = true;
      this.restartAttempts = 0;  // Reset on successful start
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
      this.isRecording = false;
      this.updateUI();
      
      // Don't show error for 'aborted' - it's usually intentional
      if (event.error !== 'aborted') {
        this.showError(`Error: ${event.error}`);
        this.restartAttempts++;
      }
    };

    this.recognition.onend = () => {
      console.log('🛑 Speech recognition ended');
      this.isRecording = false;
      this.updateUI();
      
      // Clear any existing restart timeout
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }
      
      // DON'T restart if AI is speaking - wait for audio to finish
      // Only restart if in conversation mode AND AI is NOT speaking
      if (this.conversationMode && !this.isSpeaking && !this.isActivating) {
        console.log('🔄 Restarting listening in conversation mode...');
        this.restartAttempts++;
        
        this.restartTimeout = setTimeout(() => {
          // Double-check AI is still not speaking before restarting
          if (this.conversationMode && !this.isSpeaking && !this.isRecording) {
            this.startSpeechRecognition();
          } else {
            console.log('⏸️ AI is speaking, skipping restart');
          }
        }, 1500);  // Increased delay to prevent rapid restarts
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error('❌ Failed to start recognition:', e);
      this.isRecording = false;
      this.updateUI();
      this.restartAttempts++;
    }
  }

  async sendToBackend(text) {
    try {
      // Reset restart attempts on successful command
      this.restartAttempts = 0;
      
      // Stop any active speech recognition while waiting for response
      if (this.recognition && this.isRecording) {
        console.log('⏸️ Stopping speech recognition while AI responds');
        try {
          this.recognition.stop();
        } catch (e) {
          // Ignore errors
        }
      }
      
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
      
      // Display text response in popup
      this.showStatus('📤 You said:', text, `🤖 Assistant: ${data.text || data.response || 'No response'}`);
      
      // Display response in Recipe Assistant card
      this.displayInRecipeCard(text, data.text || data.response);
      
      // Play audio if available
      if (data.audio_base64) {
        console.log('🔊 Playing audio response...');
        try {
          await this.playAudio(data.audio_base64);
          // Audio playback will handle restarting recognition when it finishes
        } catch (audioErr) {
          console.warn('⚠️ Audio playback failed, but text is still displayed');
          // Even if audio fails, restart listening so conversation can continue
          if (this.conversationMode) {
            setTimeout(() => {
              if (this.conversationMode && !this.isSpeaking && !this.isRecording) {
                console.log('🔄 Continuing conversation (text-only mode)...');
                this.startSpeechRecognition();
              }
            }, 2000);
          }
        }
      } else {
        console.warn('⚠️ No audio in response');
        // If in conversation mode and no audio, restart listening after delay
        if (this.conversationMode) {
          setTimeout(() => {
            if (this.conversationMode && !this.isSpeaking && !this.isRecording) {
              console.log('🔄 No audio response, restarting listening...');
              this.startSpeechRecognition();
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error('❌ Backend error:', err);
      
      // Don't show audio error as backend error
      if (err.name === 'NotAllowedError') {
        console.log('💡 Audio blocked by browser - text response is still available');
        // Continue conversation in text-only mode
        if (this.conversationMode) {
          setTimeout(() => {
            if (this.conversationMode && !this.isSpeaking && !this.isRecording) {
              this.startSpeechRecognition();
            }
          }, 2000);
        }
      } else {
        this.showError(`Failed to connect to backend: ${err.message}. Make sure the server is running on port 8000.`);
        
        // Exit conversation mode and return to wake word listening
        setTimeout(() => {
          this.exitConversation();
        }, 3000);
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
          
          console.log('✅ Audio playback finished - Now you can speak');
          
          // IMPORTANT: Only restart listening AFTER audio completely finishes
          if (this.conversationMode) {
            console.log('🔄 Audio done, restarting listening...');
            // Add a brief pause so user knows they can speak now
            setTimeout(() => {
              if (this.conversationMode && !this.isSpeaking && !this.isRecording) {
                console.log('🎤 Ready for your next command');
                this.startSpeechRecognition();
              }
            }, 800);  // Slightly longer delay to ensure clean transition
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
          
          // Show user-friendly error message
          if (err.name === 'NotAllowedError') {
            this.showError('Please click anywhere on the page to enable audio, then try again.');
            console.log('💡 Tip: Audio needs user interaction. Click the page and say "Hey Kitchen" again.');
          } else {
            this.showError('Audio playback failed: ' + err.message);
          }
          
          // Restart listening since we couldn't play audio
          if (this.conversationMode) {
            setTimeout(() => {
              if (this.conversationMode && !this.isSpeaking && !this.isRecording) {
                console.log('🔄 Restarting listening after audio error...');
                this.startSpeechRecognition();
              }
            }, 2000);
          }
          
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

  exitConversation() {
    console.log('🛑 Exiting conversation mode');
    this.conversationMode = false;
    this.isActivating = false;
    this.restartAttempts = 0;
    
    // Clear any pending restart timeouts
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    // Stop current recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore errors
      }
      this.recognition = null;
    }
    
    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    this.isRecording = false;
    this.isSpeaking = false;
    this.updateUI();
    this.showWakeIndicator();
    
    // Restart wake word listening
    setTimeout(() => {
      this.startWakeWordListening();
    }, 1000);
  }

  handleButtonClick() {
    if (this.conversationMode) {
      // Stop conversation
      this.exitConversation();
    } else {
      // Show status
      this.showStatusPopup();
    }
  }

  showStatusPopup() {
    const popup = document.getElementById('voiceCommandPopup');
    if (popup.classList.contains('hidden')) {
      popup.classList.remove('hidden');
      
      if (this.conversationMode) {
        this.showStatus('💬 Conversation Mode', 'Active - Listening for commands', 'Click the button to stop');
      } else {
        this.showStatus('👂 Wake Word Mode', 'Listening for "Hey Kitchen"', 'Say "Hey Kitchen" to start a conversation');
      }
    } else {
      popup.classList.add('hidden');
    }
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
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      popup.classList.add('hidden');
    }, 5000);
  }

  displayInRecipeCard(userQuery, aiResponse) {
    // Find the Recipe Assistant card elements
    const container = document.getElementById('aiResponseContainer');
    const responseDiv = document.getElementById('aiResponseText');
    
    if (!container || !responseDiv) {
      console.warn('⚠️ Recipe Assistant card not found on this page');
      return;
    }
    
    // Hide placeholder, show response
    container.style.display = 'none';
    responseDiv.style.display = 'block';
    
    // Format the response with proper styling
    const formattedResponse = this.formatAIResponse(aiResponse);
    
    responseDiv.innerHTML = `
      <div class="user-query">
        <div class="user-query-label">You asked:</div>
        <div class="user-query-text">${this.escapeHtml(userQuery)}</div>
      </div>
      <div class="ai-response-header">
        <i class="fas fa-robot"></i>
        <span>Kitchen Assistant</span>
      </div>
      <div class="ai-response-content">
        ${formattedResponse}
      </div>
    `;
    
    // Setup clear button
    const clearBtn = document.getElementById('clearRecipeBtn');
    if (clearBtn) {
      clearBtn.onclick = () => this.clearRecipeCard();
    }
    
    // Scroll to Recipe Assistant card
    const recipeCard = responseDiv.closest('.dashboard-card');
    if (recipeCard) {
      recipeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  formatAIResponse(text) {
    // Escape HTML first
    text = this.escapeHtml(text);
    
    // Convert markdown-style formatting to HTML
    // Bold text: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic text: *text* or _text_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Line breaks
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    
    // Wrap in paragraph
    text = '<p>' + text + '</p>';
    
    // Convert numbered lists
    text = text.replace(/(\d+\.\s.*?)(?=<br>|<\/p>)/g, '<li>$1</li>');
    if (text.includes('<li>')) {
      text = text.replace(/(<li>.*?<\/li>)/s, '<ol>$1</ol>');
    }
    
    // Convert bullet lists
    text = text.replace(/([-•]\s.*?)(?=<br>|<\/p>)/g, '<li>$1</li>');
    if (text.includes('<li>-') || text.includes('<li>•')) {
      text = text.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    }
    
    return text;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  clearRecipeCard() {
    const container = document.getElementById('aiResponseContainer');
    const responseDiv = document.getElementById('aiResponseText');
    
    if (container && responseDiv) {
      container.style.display = 'block';
      responseDiv.style.display = 'none';
      responseDiv.innerHTML = '';
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VoiceCommandWakeWord();
  });
} else {
  new VoiceCommandWakeWord();
}
