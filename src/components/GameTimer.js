import React, { useState, useEffect } from 'react';
import './GameTimer.css';

function GameTimer({ currentPlayer, gameStatus, onTimeUp, initialTime = 600 }) {
  // Initialize timers (in seconds)
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(true);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Timer effect
  useEffect(() => {
    // Don't run timer if game is over
    if (gameStatus !== 'active') {
      setIsRunning(false);
      return;
    }
    
    // Start the timer
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (currentPlayer === 'white') {
          setWhiteTime(prevTime => {
            if (prevTime <= 1) {
              clearInterval(interval);
              onTimeUp('white');
              return 0;
            }
            return prevTime - 1;
          });
        } else {
          setBlackTime(prevTime => {
            if (prevTime <= 1) {
              clearInterval(interval);
              onTimeUp('black');
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    }
    
    // Clean up interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPlayer, gameStatus, isRunning, onTimeUp]);
  
  // Pause/resume timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  // Reset timers
  const resetTimers = () => {
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setIsRunning(true);
  };
  
  return (
    <div className="game-timer">
      <h2>Game Timer</h2>
      
      <div className="timer-display">
        <div className={`player-timer ${currentPlayer === 'white' ? 'active' : ''}`}>
          <span className="player-label">White:</span>
          <span className="time">{formatTime(whiteTime)}</span>
        </div>
        
        <div className={`player-timer ${currentPlayer === 'black' ? 'active' : ''}`}>
          <span className="player-label">Black:</span>
          <span className="time">{formatTime(blackTime)}</span>
        </div>
      </div>
      
      <div className="timer-controls">
        <button onClick={toggleTimer} disabled={gameStatus !== 'active'}>
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button onClick={resetTimers} disabled={gameStatus === 'active' && isRunning}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default GameTimer;