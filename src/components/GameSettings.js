import React, { useState } from 'react';
import './GameSettings.css';
import { AI_PERSONALITIES } from '../utils/aiPersonalities';

function GameSettings({ onStartGame, onCancel }) {
  const [settings, setSettings] = useState({
    playerColor: 'white',
    opponent: 'human',
    aiDifficulty: 'medium',
    aiPersonality: 'standard',
    timerEnabled: true,
    timeLimit: 10, // in minutes
    voiceCommandsEnabled: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onStartGame({
      ...settings,
      timeLimit: settings.timerEnabled ? settings.timeLimit * 60 : null // Convert to seconds
    });
  };
  
  return (
    <div className="settings-overlay">
      <div className="settings-dialog">
        <h2>Game Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Player Options</h3>
            
            <div className="form-group">
              <label>Play as:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="playerColor"
                    value="white"
                    checked={settings.playerColor === 'white'}
                    onChange={handleChange}
                  />
                  White
                </label>
                <label>
                  <input
                    type="radio"
                    name="playerColor"
                    value="black"
                    checked={settings.playerColor === 'black'}
                    onChange={handleChange}
                  />
                  Black
                </label>
                <label>
                  <input
                    type="radio"
                    name="playerColor"
                    value="random"
                    checked={settings.playerColor === 'random'}
                    onChange={handleChange}
                  />
                  Random
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Opponent:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="opponent"
                    value="human"
                    checked={settings.opponent === 'human'}
                    onChange={handleChange}
                  />
                  Human
                </label>
                <label>
                  <input
                    type="radio"
                    name="opponent"
                    value="ai"
                    checked={settings.opponent === 'ai'}
                    onChange={handleChange}
                  />
                  Computer
                </label>
              </div>
            </div>
            
            {settings.opponent === 'ai' && (
              <>
                <div className="form-group">
                  <label>AI Difficulty:</label>
                  <select 
                    name="aiDifficulty" 
                    value={settings.aiDifficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>AI Personality:</label>
                  <select 
                    name="aiPersonality" 
                    value={settings.aiPersonality}
                    onChange={handleChange}
                  >
                    {Object.keys(AI_PERSONALITIES).map(personality => (
                      <option key={personality} value={personality}>
                        {AI_PERSONALITIES[personality].name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          
          <div className="settings-section">
            <h3>Timer Settings</h3>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="timerEnabled"
                  checked={settings.timerEnabled}
                  onChange={handleChange}
                />
                Enable Timer
              </label>
            </div>
            
            {settings.timerEnabled && (
              <div className="form-group">
                <label>Time Limit (minutes):</label>
                <select 
                  name="timeLimit" 
                  value={settings.timeLimit}
                  onChange={handleChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="settings-section">
            <h3>Advanced Features</h3>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="voiceCommandsEnabled"
                  checked={settings.voiceCommandsEnabled}
                  onChange={handleChange}
                />
                Enable Voice Commands
              </label>
              <div className="help-text">
                Use voice to move pieces and control the game
              </div>
            </div>
          </div>
          
          <div className="settings-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="start-button">
              Start Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GameSettings;