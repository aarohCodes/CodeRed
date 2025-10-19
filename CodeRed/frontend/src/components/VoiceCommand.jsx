import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader, Volume2 } from 'lucide-react';

const VoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const porcupineRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Porcupine wake word detection
  useEffect(() => {
    const initializePorcupine = async () => {
      try {
        // Import Porcupine dynamically
        const { PorcupineWorker } = await import('@picovoice/porcupine-web');
        
        // Initialize Porcupine with custom "Hey Kitchen" wake word
        const porcupine = await PorcupineWorker.create(
          process.env.REACT_APP_PICOVOICE_ACCESS_KEY, // Access key from .env
          [{
            publicPath: '/Hey-Kitchen_en_wasm_v3_0_0.ppn',
            customWritePath: 'Hey-Kitchen_en_wasm_v3_0_0',
            forceWrite: true,
            sensitivity: 0.7
          }],
          (detectionIndex) => {
            console.log('Wake word "Hey Kitchen" detected!');
            setIsWakeWordActive(true);
            startSpeechRecognition();
          }
        );

        porcupineRef.current = porcupine;
        
        // Start listening for wake word
        await porcupine.start();
        setIsListening(true);
        console.log('Porcupine initialized and listening for wake word');
      } catch (err) {
        console.error('Error initializing Porcupine:', err);
        setError('Failed to initialize wake word detection. Make sure you have a valid access key.');
      }
    };

    initializePorcupine();

    return () => {
      // Cleanup on unmount
      if (porcupineRef.current) {
        porcupineRef.current.release();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize Web Speech API
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setTranscript('Listening...');
      setResponse('');
      setError('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // If we have a final transcript, send it to backend
      if (finalTranscript) {
        sendToBackend(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsWakeWordActive(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsWakeWordActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Send transcription to FastAPI backend with audio playback
  const sendToBackend = async (text) => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:8000/kitchen_converse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_query: text }), // Changed from 'message' to 'user_query'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Display text response
      setResponse(data.text || 'No response from server');
      
      // Play audio if available
      if (data.audio_base64) {
        playAudio(data.audio_base64);
      }
      
      console.log('Backend response:', data);
    } catch (err) {
      console.error('Error sending to backend:', err);
      setError(`Failed to communicate with backend: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio from base64
  const playAudio = (audioBase64) => {
    try {
      setIsPlayingAudio(true);
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        console.error('Error playing audio');
        setError('Failed to play audio response');
      };
      
      audio.play();
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlayingAudio(false);
      setError('Failed to play audio response');
    }
  };

  // Manual toggle for testing
  const toggleListening = () => {
    if (isWakeWordActive && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsWakeWordActive(false);
    } else {
      startSpeechRecognition();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Voice Button */}
      <button
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isWakeWordActive
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : isListening
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-500 hover:bg-gray-600'
        }`}
        title={isWakeWordActive ? 'Listening to command...' : isListening ? 'Wake word active - Say "Hey Kitchen"' : 'Voice command inactive'}
      >
        {isProcessing ? (
          <Loader className="w-8 h-8 text-white animate-spin" />
        ) : isWakeWordActive ? (
          <Mic className="w-8 h-8 text-white" />
        ) : (
          <MicOff className="w-8 h-8 text-white" />
        )}
      </button>

      {/* Status Indicator */}
      {(transcript || response || error) && (
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px] border-2 border-gray-200">
          {/* Transcript */}
          {transcript && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">You said:</p>
              <p className="text-sm text-gray-800">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-green-600">Assistant:</p>
                {isPlayingAudio && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    Playing...
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{response}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">Error:</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => {
              setTranscript('');
              setResponse('');
              setError('');
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Wake Word Indicator */}
      {isListening && !isWakeWordActive && (
        <div className="absolute bottom-20 right-0 bg-green-100 rounded-lg shadow-md px-4 py-2 border border-green-300">
          <p className="text-xs font-semibold text-green-700">
            🎤 Say "Hey Kitchen" to activate
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;
