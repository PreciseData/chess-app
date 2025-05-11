import React, { useState, useEffect } from 'react';
import './VoiceCommands.css';

function VoiceCommands({ onCommand, enabled }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';
    
    // Set up event handlers
    recognitionInstance.onstart = () => {
      setListening(true);
      setTranscript('');
      setError(null);
    };
    
    recognitionInstance.onresult = (event) => {
      const result = event.results[0][0].transcript.toLowerCase();
      setTranscript(result);
      processCommand(result);
    };
    
    recognitionInstance.onerror = (event) => {
      setError(`Error: ${event.error}`);
      setListening(false);
    };
    
    recognitionInstance.onend = () => {
      setListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    // Clean up
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
    };
  }, []);

  // Process voice commands
  const processCommand = (command) => {
    // Chess move commands (e.g., "move pawn to e4")
    const moveRegex = /move\s+([a-z]+)\s+(?:from\s+)?([a-h][1-8])?\s+to\s+([a-h][1-8])/i;
    const moveMatch = command.match(moveRegex);
    
    if (moveMatch) {
      const [_, piece, from, to] = moveMatch;
      onCommand({
        type: 'move',
        piece: piece.toLowerCase(),
        from: from ? from.toLowerCase() : null,
        to: to.toLowerCase()
      });
      return;
    }
    
    // Direct square notation (e.g., "e2 to e4")
    const directMoveRegex = /([a-h][1-8])\s+to\s+([a-h][1-8])/i;
    const directMatch = command.match(directMoveRegex);
    
    if (directMatch) {
      const [_, from, to] = directMatch;
      onCommand({
        type: 'move',
        from: from.toLowerCase(),
        to: to.toLowerCase()
      });
      return;
    }
    
    // Game control commands
    if (command.includes('reset board') || command.includes('new game')) {
      onCommand({ type: 'reset' });
      return;
    }
    
    if (command.includes('clear board')) {
      onCommand({ type: 'clear' });
      return;
    }
    
    if (command.includes('undo') || command.includes('take back')) {
      onCommand({ type: 'undo' });
      return;
    }
    
    // AI difficulty commands
    if (command.includes('easy mode') || command.includes('set difficulty to easy')) {
      onCommand({ type: 'difficulty', value: 'easy' });
      return;
    }
    
    if (command.includes('medium mode') || command.includes('set difficulty to medium')) {
      onCommand({ type: 'difficulty', value: 'medium' });
      return;
    }
    
    if (command.includes('hard mode') || command.includes('set difficulty to hard')) {
      onCommand({ type: 'difficulty', value: 'hard' });
      return;
    }
    
    // AI personality commands
    if (command.includes('aggressive') || command.includes('set personality to aggressive')) {
      onCommand({ type: 'personality', value: 'aggressive' });
      return;
    }
    
    if (command.includes('defensive') || command.includes('set personality to defensive')) {
      onCommand({ type: 'personality', value: 'defensive' });
      return;
    }
    
    if (command.includes('creative') || command.includes('set personality to creative')) {
      onCommand({ type: 'personality', value: 'creative' });
      return;
    }
    
    if (command.includes('standard') || command.includes('set personality to standard')) {
      onCommand({ type: 'personality', value: 'standard' });
      return;
    }
    
    // If no command matched
    onCommand({ type: 'unknown', command });
  };

  // Start listening for commands
  const startListening = () => {
    if (recognition && !listening && enabled) {
      try {
        recognition.start();
      } catch (err) {
        setError('Error starting voice recognition.');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition && listening) {
      recognition.stop();
    }
  };

  // If voice commands are disabled, don't render the component
  if (!enabled) {
    return null;
  }

  return (
    <div className="voice-commands">
      <button 
        className={`voice-button ${listening ? 'listening' : ''}`}
        onClick={listening ? stopListening : startListening}
        disabled={!!error && !listening}
        title={listening ? 'Stop listening' : 'Start voice command'}
      >
        {listening ? '🎤 Listening...' : '🎤'}
      </button>
      
      {transcript && (
        <div className="transcript">
          <p>"{transcript}"</p>
        </div>
      )}
      
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default VoiceCommands;