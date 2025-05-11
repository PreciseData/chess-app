import React from 'react';
import './GameInfo.css';

function GameInfo({ currentPlayer, gameStatus, moveHistory, opponent, playerColor }) {
  const renderMoveHistory = () => {
    return moveHistory.map((move, index) => {
      // Handle special moves like board clearing
      if (move.special) {
        return (
          <div key={index} className="move-entry special-move">
            <span className="move-number">{Math.floor(index / 2) + 1}.</span>
            <span className="move">
              {move.special}
            </span>
          </div>
        );
      }
      
      const moveNumber = Math.floor(index / 2) + 1;
      const isWhiteMove = move.color === 'white';
      const notation = `${move.piece} ${String.fromCharCode(97 + move.from.col)}${8 - move.from.row} → ${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}`;
      
      return (
        <div key={index} className="move-entry">
          {isWhiteMove && <span className="move-number">{moveNumber}.</span>}
          <span className={`move ${isWhiteMove ? 'white-move' : 'black-move'}`}>
            {notation}
          </span>
        </div>
      );
    });
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'check':
        return `${currentPlayer} is in check`;
      case 'checkmate':
        return `${currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate`;
      case 'stalemate':
        return 'Game drawn by stalemate';
      case 'timeout':
        return `${currentPlayer === 'white' ? 'Black' : 'White'} wins on time`;
      default:
        return 'active';
    }
  };

  const getPlayerInfo = () => {
    if (opponent === 'human') {
      return (
        <>
          <p>White: Human</p>
          <p>Black: Human</p>
        </>
      );
    } else {
      return (
        <>
          <p>You: {playerColor === 'white' ? 'White' : 'Black'}</p>
          <p>Computer: {playerColor === 'white' ? 'Black' : 'White'}</p>
        </>
      );
    }
  };

  return (
    <div className="game-info">
      <div className="status-section">
        <h2>Game Status</h2>
        <div className="status">
          <p>Current Player: <span className={`player-${currentPlayer}`}>{currentPlayer}</span></p>
          <p>Game Status: <span className={`status-${gameStatus}`}>{getStatusMessage()}</span></p>
          {getPlayerInfo()}
        </div>
      </div>
      
      <div className="history-section">
        <h2>Move History</h2>
        <div className="move-history">
          {moveHistory.length > 0 ? renderMoveHistory() : <p>No moves yet</p>}
        </div>
      </div>
    </div>
  );
}

export default GameInfo;