import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';
import GameTimer from './components/GameTimer';
import PromotionDialog from './components/PromotionDialog';
import GameSettings from './components/GameSettings';
import ThemeToggle from './components/ThemeToggle';
import VoiceCommands from './components/VoiceCommands';
import AIPersonalitySelector from './components/AIPersonalitySelector';
import { ThemeContext } from './context/ThemeContext';
import { 
  isValidMove, 
  wouldBeInCheck, 
  isKingInCheck, 
  isCheckmate, 
  isStalemate,
  canPromotePawn,
  getCastlingMove,
  getEnPassantCapture,
  updateCastlingRights
} from './utils/chessRules';
import { getBestMove } from './utils/aiPlayer';

function App() {
  // Access theme context
  const { theme } = useContext(ThemeContext);
  
  // Game settings state
  const [showSettings, setShowSettings] = useState(true);
  const [gameSettings, setGameSettings] = useState({
    playerColor: 'white',
    opponent: 'human',
    aiDifficulty: 'medium',
    aiPersonality: 'standard',
    timerEnabled: true,
    timeLimit: 600, // 10 minutes in seconds
    voiceCommandsEnabled: false
  });

  // Game state
  const [gameState, setGameState] = useState({
    board: initializeBoard(),
    currentPlayer: 'white',
    selectedPiece: null,
    gameStatus: 'active', // active, check, checkmate, stalemate
    moveHistory: [],
    lastMove: null,
    castlingRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true
    },
    promotionPending: null
  });

  // Timer callbacks
  const handleTimeUp = (color) => {
    setGameState({
      ...gameState,
      gameStatus: 'timeout',
      moveHistory: [...gameState.moveHistory, {
        special: `${color} timeout`
      }]
    });
  };

  // Effect for AI moves
  useEffect(() => {
    // Make AI move if it's AI's turn
    if (gameSettings.opponent === 'ai' && 
        gameState.gameStatus === 'active' &&
        gameState.currentPlayer !== gameSettings.playerColor &&
        !gameState.promotionPending) {
      
      // Small delay to make AI move feel more natural
      const aiMoveTimeout = setTimeout(() => {
        const aiMove = getBestMove(
          gameState.board, 
          gameState.currentPlayer, 
          gameState.castlingRights, 
          gameState.lastMove, 
          gameSettings.aiDifficulty,
          gameSettings.aiPersonality
        );
        
        if (aiMove) {
          handleMove(aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol);
        }
      }, 500);
      
      return () => clearTimeout(aiMoveTimeout);
    }
  }, [gameState.currentPlayer, gameState.gameStatus, gameSettings.opponent]);

  function initializeBoard() {
    // Create an 8x8 board with initial chess positions
    const board = Array(8).fill().map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'pawn', color: 'black' };
      board[6][i] = { type: 'pawn', color: 'white' };
    }
    
    // Set up rooks
    board[0][0] = { type: 'rook', color: 'black' };
    board[0][7] = { type: 'rook', color: 'black' };
    board[7][0] = { type: 'rook', color: 'white' };
    board[7][7] = { type: 'rook', color: 'white' };
    
    // Set up knights
    board[0][1] = { type: 'knight', color: 'black' };
    board[0][6] = { type: 'knight', color: 'black' };
    board[7][1] = { type: 'knight', color: 'white' };
    board[7][6] = { type: 'knight', color: 'white' };
    
    // Set up bishops
    board[0][2] = { type: 'bishop', color: 'black' };
    board[0][5] = { type: 'bishop', color: 'black' };
    board[7][2] = { type: 'bishop', color: 'white' };
    board[7][5] = { type: 'bishop', color: 'white' };
    
    // Set up queens
    board[0][3] = { type: 'queen', color: 'black' };
    board[7][3] = { type: 'queen', color: 'white' };
    
    // Set up kings
    board[0][4] = { type: 'king', color: 'black' };
    board[7][4] = { type: 'king', color: 'white' };
    
    return board;
  }

  // Function to clear the board
  const clearBoard = () => {
    const emptyBoard = Array(8).fill().map(() => Array(8).fill(null));
    
    setGameState({
      ...gameState,
      board: emptyBoard,
      selectedPiece: null,
      moveHistory: [...gameState.moveHistory, {
        special: 'board-cleared'
      }]
    });
  };

  // Function to reset the board to initial position
  const resetBoard = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'white',
      selectedPiece: null,
      gameStatus: 'active',
      moveHistory: [],
      lastMove: null,
      castlingRights: {
        whiteKingside: true,
        whiteQueenside: true,
        blackKingside: true,
        blackQueenside: true
      },
      promotionPending: null
    });
  };

  // Handle promotion selection
  const handlePromotion = (pieceType) => {
    if (!gameState.promotionPending) return;
    
    const { row, col, color } = gameState.promotionPending;
    const newBoard = [...gameState.board.map(row => [...row])];
    
    // Replace the pawn with the selected piece
    newBoard[row][col] = { type: pieceType, color };
    
    // Update game state
    setGameState({
      ...gameState,
      board: newBoard,
      promotionPending: null,
      moveHistory: [...gameState.moveHistory, {
        special: `${color} pawn promoted to ${pieceType}`
      }]
    });
    
    // Check for checkmate or stalemate after promotion
    updateGameStatus(newBoard, gameState.currentPlayer);
  };

  // Cancel promotion
  const cancelPromotion = () => {
    // Revert the move
    const { fromRow, fromCol, toRow, toCol } = gameState.promotionPending;
    const newBoard = [...gameState.board.map(row => [...row])];
    
    // Move the pawn back
    newBoard[fromRow][fromCol] = { type: 'pawn', color: gameState.promotionPending.color };
    newBoard[toRow][toCol] = null;
    
    setGameState({
      ...gameState,
      board: newBoard,
      promotionPending: null
    });
  };

  // Handle game settings
  const handleStartGame = (settings) => {
    setGameSettings(settings);
    setShowSettings(false);
    
    // If player is black, rotate the board
    if (settings.playerColor === 'black') {
      // AI (white) makes the first move
      // This will be handled by the useEffect
    } else if (settings.playerColor === 'random') {
      // Randomly decide player color
      const colors = ['white', 'black'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setGameSettings({
        ...settings,
        playerColor: randomColor
      });
    }
  };

  // Update game status (check, checkmate, stalemate)
  const updateGameStatus = (board, currentPlayer) => {
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    // Check if the next player is in check
    if (isKingInCheck(board, nextPlayer)) {
      // Check if it's checkmate
      if (isCheckmate(board, nextPlayer, gameState.castlingRights, gameState.lastMove)) {
        setGameState(prevState => ({
          ...prevState,
          gameStatus: 'checkmate',
          moveHistory: [...prevState.moveHistory, {
            special: `${nextPlayer} is checkmated`
          }]
        }));
      } else {
        setGameState(prevState => ({
          ...prevState,
          gameStatus: 'check',
          moveHistory: [...prevState.moveHistory, {
            special: `${nextPlayer} is in check`
          }]
        }));
      }
    } 
    // Check for stalemate
    else if (isStalemate(board, nextPlayer, gameState.castlingRights, gameState.lastMove)) {
      setGameState(prevState => ({
        ...prevState,
        gameStatus: 'stalemate',
        moveHistory: [...prevState.moveHistory, {
          special: 'stalemate'
        }]
      }));
    }
  };

  // Handle move execution
  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    const { board, currentPlayer, castlingRights, lastMove } = gameState;
    const piece = board[fromRow][fromCol];
    
    if (!piece || piece.color !== currentPlayer) return;
    
    // Check if the move is valid
    if (!isValidMove(board, fromRow, fromCol, toRow, toCol)) return;
    
    // Check if the move would leave the king in check
    if (wouldBeInCheck(board, fromRow, fromCol, toRow, toCol, currentPlayer)) return;
    
    // Create a new board with the move
    const newBoard = [...board.map(row => [...row])];
    
    // Handle special moves
    
    // 1. Castling
    const castlingMove = getCastlingMove(board, fromRow, fromCol, toRow, toCol);
    if (castlingMove) {
      // Move the rook
      newBoard[castlingMove.rookToRow][castlingMove.rookToCol] = 
        newBoard[castlingMove.rookFromRow][castlingMove.rookFromCol];
      newBoard[castlingMove.rookFromRow][castlingMove.rookFromCol] = null;
    }
    
    // 2. En passant
    const enPassantCapture = getEnPassantCapture(board, fromRow, fromCol, toRow, toCol, lastMove);
    if (enPassantCapture) {
      // Remove the captured pawn
      newBoard[enPassantCapture.captureRow][enPassantCapture.captureCol] = null;
    }
    
    // Make the move
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    
    // 3. Pawn promotion
    if (canPromotePawn(piece, toRow)) {
      // Set promotion pending state
      setGameState({
        ...gameState,
        board: newBoard,
        promotionPending: {
          row: toRow,
          col: toCol,
          color: piece.color,
          fromRow,
          fromCol
        }
      });
      return;
    }
    
    // Update castling rights
    const newCastlingRights = updateCastlingRights(castlingRights, piece, fromRow, fromCol);
    
    // Record the move
    const newMove = {
      piece: piece.type,
      color: piece.color,
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol }
    };
    
    // Switch player
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    // Update game state
    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      lastMove: newMove,
      castlingRights: newCastlingRights,
      moveHistory: [...gameState.moveHistory, newMove]
    });
    
    // Check for check, checkmate, or stalemate
    setTimeout(() => {
      updateGameStatus(newBoard, currentPlayer);
    }, 0);
  };

  const handleSquareClick = (row, col) => {
    // Don't allow moves if game is over or promotion is pending
    if (gameState.gameStatus !== 'active' && gameState.gameStatus !== 'check') return;
    if (gameState.promotionPending) return;
    
    // In AI mode, only allow player to move their color
    if (gameSettings.opponent === 'ai' && gameState.currentPlayer !== gameSettings.playerColor) {
      return;
    }
    
    const { board, selectedPiece } = gameState;
    
    // If no piece is selected and the clicked square has a piece of the current player's color
    if (!selectedPiece && board[row][col] && board[row][col].color === gameState.currentPlayer) {
      setGameState({
        ...gameState,
        selectedPiece: { row, col }
      });
      return;
    }
    
    // If a piece is already selected
    if (selectedPiece) {
      // If clicking on the same piece, deselect it
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setGameState({
          ...gameState,
          selectedPiece: null
        });
        return;
      }
      
      // If clicking on another piece of the same color, select that piece instead
      if (board[row][col] && board[row][col].color === gameState.currentPlayer) {
        setGameState({
          ...gameState,
          selectedPiece: { row, col }
        });
        return;
      }
      
      // Attempt to move the selected piece to the clicked square
      handleMove(selectedPiece.row, selectedPiece.col, row, col);
    }
  };

  // Handle voice commands
  const handleVoiceCommand = (command) => {
    if (command.type === 'move') {
      // Handle move commands
      if (command.from && command.to) {
        // Convert algebraic notation to board coordinates
        const fromCol = command.from.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, etc.
        const fromRow = 8 - parseInt(command.from[1]);
        const toCol = command.to.charCodeAt(0) - 97;
        const toRow = 8 - parseInt(command.to[1]);
        
        // Check if coordinates are valid
        if (fromCol >= 0 && fromCol < 8 && fromRow >= 0 && fromRow < 8 &&
            toCol >= 0 && toCol < 8 && toRow >= 0 && toRow < 8) {
          
          // Check if there's a piece at the from position
          if (gameState.board[fromRow][fromCol] && 
              gameState.board[fromRow][fromCol].color === gameState.currentPlayer) {
            
            // Try to make the move
            handleMove(fromRow, fromCol, toRow, toCol);
          }
        }
      } else if (command.piece && command.to) {
        // Find pieces of the specified type that can move to the target square
        const pieceType = command.piece.toLowerCase();
        const toCol = command.to.charCodeAt(0) - 97;
        const toRow = 8 - parseInt(command.to[1]);
        
        // Check all pieces of the current player's color
        for (let fromRow = 0; fromRow < 8; fromRow++) {
          for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = gameState.board[fromRow][fromCol];
            if (piece && 
                piece.color === gameState.currentPlayer && 
                piece.type === pieceType) {
              
              // Check if this piece can make the move
              if (isValidMove(gameState.board, fromRow, fromCol, toRow, toCol) &&
                  !wouldBeInCheck(gameState.board, fromRow, fromCol, toRow, toCol, gameState.currentPlayer)) {
                
                // Make the move
                handleMove(fromRow, fromCol, toRow, toCol);
                return;
              }
            }
          }
        }
      }
    } else if (command.type === 'reset') {
      resetBoard();
    } else if (command.type === 'clear') {
      clearBoard();
    } else if (command.type === 'difficulty' && gameSettings.opponent === 'ai') {
      setGameSettings({
        ...gameSettings,
        aiDifficulty: command.value
      });
    } else if (command.type === 'personality' && gameSettings.opponent === 'ai') {
      setGameSettings({
        ...gameSettings,
        aiPersonality: command.value
      });
    }
  };

  // Handle AI personality change
  const handlePersonalityChange = (personality) => {
    setGameSettings({
      ...gameSettings,
      aiPersonality: personality
    });
  };

  return (
    <div className={`App ${theme}`}>
      <ThemeToggle />
      
      {gameSettings.voiceCommandsEnabled && (
        <VoiceCommands 
          onCommand={handleVoiceCommand} 
          enabled={gameSettings.voiceCommandsEnabled && !showSettings}
        />
      )}
      
      <h1>Chess App</h1>
      
      {showSettings ? (
        <GameSettings 
          onStartGame={handleStartGame} 
          onCancel={() => setShowSettings(false)} 
        />
      ) : (
        <>
          <div className="board-controls">
            <button className="control-button" onClick={resetBoard}>Reset Board</button>
            <button className="control-button clear-button" onClick={clearBoard}>Clear Board</button>
            <button className="control-button settings-button" onClick={() => setShowSettings(true)}>
              Game Settings
            </button>
          </div>
          
          <div className="game-container">
            <div className="board-and-timer">
              <ChessBoard 
                board={gameState.board} 
                selectedPiece={gameState.selectedPiece}
                onSquareClick={handleSquareClick}
                lastMove={gameState.lastMove}
                inCheck={gameState.gameStatus === 'check' || gameState.gameStatus === 'checkmate'}
              />
              
              {gameSettings.timerEnabled && (
                <GameTimer 
                  currentPlayer={gameState.currentPlayer}
                  gameStatus={gameState.gameStatus}
                  onTimeUp={handleTimeUp}
                  initialTime={gameSettings.timeLimit}
                />
              )}
            </div>
            
            <div className="game-sidebar">
              <GameInfo 
                currentPlayer={gameState.currentPlayer}
                gameStatus={gameState.gameStatus}
                moveHistory={gameState.moveHistory}
                opponent={gameSettings.opponent}
                playerColor={gameSettings.playerColor}
              />
              
              {gameSettings.opponent === 'ai' && (
                <AIPersonalitySelector 
                  currentPersonality={gameSettings.aiPersonality}
                  onSelectPersonality={handlePersonalityChange}
                />
              )}
            </div>
          </div>
          
          {gameState.promotionPending && (
            <PromotionDialog 
              color={gameState.promotionPending.color}
              onSelect={handlePromotion}
              onCancel={cancelPromotion}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;