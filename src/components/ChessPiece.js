import React from 'react';
import './ChessPiece.css';

function ChessPiece({ type, color }) {
  // Unicode chess pieces
  const pieces = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };

  return (
    <div className={`chess-piece ${color}`}>
      {pieces[color][type]}
    </div>
  );
}

export default ChessPiece;