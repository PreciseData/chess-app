import React from 'react';
import './AIPersonalitySelector.css';
import { AI_PERSONALITIES } from '../utils/aiPersonalities';

function AIPersonalitySelector({ currentPersonality, onSelectPersonality }) {
  // Get available personalities
  const personalities = Object.keys(AI_PERSONALITIES);
  
  return (
    <div className="ai-personality-selector">
      <h3>AI Personality</h3>
      <div className="personality-options">
        {personalities.map(personality => {
          const personalityInfo = AI_PERSONALITIES[personality];
          return (
            <div 
              key={personality}
              className={`personality-option ${currentPersonality === personality ? 'selected' : ''}`}
              onClick={() => onSelectPersonality(personality)}
            >
              <div className="personality-name">{personalityInfo.name}</div>
              <div className="personality-description">{personalityInfo.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIPersonalitySelector;