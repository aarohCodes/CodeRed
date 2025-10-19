import React, { useState } from 'react';
import { Mic, Volume2, X, Loader } from 'lucide-react';

const KitchenAssistant = () => {
  const [userQuery, setUserQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Call the endpoint and play audio
  async function askKitchenAssistant(query) {
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowModal(true);

    try {
      const response = await fetch('http://localhost:8000/kitchen_converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_query: query })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Show text
      displayRecipeText(data.text);
      
      // Play audio if available
      if (data.audio_base64) {
        playAudio(data.audio_base64);
      }
    } catch (err) {
      console.error('Error calling kitchen assistant:', err);
      setError(`Failed to get response: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function displayRecipeText(text) {
    setResponseText(text);
  }

  function playAudio(audioBase64) {
    try {
      setIsPlaying(true);
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Error playing audio');
      };
      
      audio.play();
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    askKitchenAssistant(userQuery);
  };

  const closeModal = () => {
    setShowModal(false);
    setResponseText('');
    setError('');
  };

  return (
    <div className="kitchen-assistant-container">
      {/* Input Form */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Mic className="w-6 h-6 text-green-500" />
            Kitchen Assistant
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Ask me anything about cooking!
              </label>
              <input
                id="query"
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g., What can I cook with chicken and rice?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Ask Kitchen Assistant
                </>
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What's for dinner tonight?",
                "Quick breakfast ideas",
                "How do I cook salmon?",
                "What's in my pantry?"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserQuery(suggestion)}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Volume2 className={`w-6 h-6 ${isPlaying ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                Kitchen Assistant Response
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Query */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-blue-700 mb-1">You asked:</p>
                <p className="text-gray-800">{userQuery}</p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-green-500 animate-spin" />
                  <span className="ml-3 text-gray-600">Getting your answer...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-semibold text-red-700 mb-1">Error:</p>
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Response Text */}
              {responseText && !isLoading && (
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-700">Response:</p>
                    {isPlaying && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        Playing audio...
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{responseText}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setUserQuery('');
                  closeModal();
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Ask Another Question
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenAssistant;
