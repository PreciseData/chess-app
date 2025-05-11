import React from 'react';
import './ChessBoard.css';
import ChessPiece from './ChessPiece';

function ChessBoard({ board, selectedPiece, onSquareClick, lastMove, inCheck }) {
  const renderSquare = (row, col) => {
    const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
    const isLastMoveFrom = lastMove && lastMove.from.row === row && lastMove.from.col === col;
    const isLastMoveTo = lastMove && lastMove.to.row === row && lastMove.to.col === col;
    const isLight = (row + col) % 2 === 0;
    
    // Check if this square contains a king in check
    const isKingInCheck = inCheck && 
                          board[row][col] && 
                          board[row][col].type === 'king' && 
                          board[row][col].color === (lastMove ? 
                            (lastMove.color === 'white' ? 'black' : 'white') : 'black');
    
    const squareClass = `square ${isLight ? 'light' : 'dark'} 
                        ${isSelected ? 'selected' : ''} 
                        ${isLastMoveFrom ? 'last-move-from' : ''} 
                        ${isLastMoveTo ? 'last-move-to' : ''}
                        ${isKingInCheck ? 'king-in-check' : ''}`;
    
    return (
      <div 
        className={squareClass} 
        key={`${row}-${col}`}
        onClick={() => onSquareClick(row, col)}
      >
        {board[row][col] && (
          <ChessPiece 
            type={board[row][col].type} 
            color={board[row][col].color} 
          />
        )}
      </div>
    );
  };

  const renderRow = (row) => {
    return (
      <div className="board-row" key={row}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(col => renderSquare(row, col))}
      </div>
    );
  };

  const renderColumnLabels = () => {
    return (
      <div className="column-labels">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(label => (
          <div key={label} className="label">{label}</div>
        ))}
      </div>
    );
  };

  const renderRowLabels = () => {
    return (
      <div className="row-labels">
        {[8, 7, 6, 5, 4, 3, 2, 1].map(label => (
          <div key={label} className="label">{label}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="chess-board-container">
      {renderColumnLabels()}
      <div className="board-with-row-labels">
        {renderRowLabels()}
        <div className="chess-board">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(row => renderRow(row))}
        </div>
      </div>
      {renderColumnLabels()}
    </div>
  );
}

export default ChessBoard;