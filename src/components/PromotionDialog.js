import React from 'react';
import './PromotionDialog.css';

function PromotionDialog({ color, onSelect, onCancel }) {
  const pieces = ['queen', 'rook', 'bishop', 'knight'];
  
  // Unicode chess pieces
  const pieceSymbols = {
    white: {
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘'
    },
    black: {
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞'
    }
  };
  
  return (
    <div className="promotion-overlay">
      <div className="promotion-dialog">
        <h3>Promote Pawn</h3>
        <div className="promotion-options">
          {pieces.map(piece => (
            <div 
              key={piece} 
              className="promotion-piece" 
              onClick={() => onSelect(piece)}
            >
              <span className={`piece-symbol ${color}`}>
                {pieceSymbols[color][piece]}
              </span>
              <span className="piece-name">{piece}</span>
            </div>
          ))}
        </div>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PromotionDialog;