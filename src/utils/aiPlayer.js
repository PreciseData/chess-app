/**
 * AI player for chess game
 * Implements a simple minimax algorithm with alpha-beta pruning
 * Enhanced with AI personalities and adaptive difficulty
 */

import { isValidMove, wouldBeInCheck, isCheckmate, isStalemate, isSquareAttacked } from './chessRules';
import { AI_PERSONALITIES } from './aiPersonalities';

// Default piece values for evaluation
const DEFAULT_PIECE_VALUES = {
  pawn: 10,
  knight: 30,
  bishop: 30,
  rook: 50,
  queen: 90,
  king: 900
};

// Position bonuses to encourage good piece positioning
const POSITION_BONUSES = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  knight: [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
  ],
  bishop: [
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
    [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2]
  ],
  rook: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 1, 1, 1, 1, 1, 1, 0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [0, 0, 0, 0.5, 0.5, 0, 0, 0]
  ],
  queen: [
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-1, 0, 0.5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2]
  ],
  king: [
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2]
  ]
};

// Evaluate the board position from the perspective of the given color
export const evaluateBoard = (board, color, personality = 'standard') => {
  // Get the AI personality or use standard if not found
  const aiPersonality = AI_PERSONALITIES[personality] || AI_PERSONALITIES.standard;
  const pieceValues = aiPersonality.pieceValues || DEFAULT_PIECE_VALUES;
  
  let score = 0;
  
  // Count material and position value
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        // Material value based on personality
        const materialValue = pieceValues[piece.type] || DEFAULT_PIECE_VALUES[piece.type];
        
        // Position bonus
        let positionBonus = 0;
        if (POSITION_BONUSES[piece.type]) {
          // For black pieces, we need to flip the position matrix
          const positionRow = piece.color === 'white' ? row : 7 - row;
          positionBonus = POSITION_BONUSES[piece.type][positionRow][col];
        }
        
        // Add or subtract based on piece color
        const value = materialValue + positionBonus;
        if (piece.color === color) {
          score += value;
        } else {
          score -= value;
        }
      }
    }
  }
  
  // Apply personality-specific evaluation modifier
  if (aiPersonality.evaluationModifier) {
    score = aiPersonality.evaluationModifier(board, color, score);
  }
  
  return score;
};

// Get all valid moves for a given color
export const getAllValidMoves = (board, color, castlingRights, lastMove) => {
  const moves = [];
  
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            // Check if the move is valid according to piece rules
            if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
              // Check if the move would not put the king in check
              if (!wouldBeInCheck(board, fromRow, fromCol, toRow, toCol, color)) {
                // Check if this is a capture move
                const capturedPiece = board[toRow][toCol];
                
                moves.push({
                  fromRow,
                  fromCol,
                  toRow,
                  toCol,
                  piece,
                  capturedPiece
                });
              }
            }
          }
        }
      }
    }
  }
  
  return moves;
};

// Make a move on a copy of the board
export const makeMove = (board, move) => {
  const newBoard = board.map(row => [...row]);
  newBoard[move.toRow][move.toCol] = newBoard[move.fromRow][move.fromCol];
  newBoard[move.fromRow][move.fromCol] = null;
  return newBoard;
};

// Minimax algorithm with alpha-beta pruning
export const minimax = (board, depth, alpha, beta, maximizingPlayer, color, castlingRights, lastMove, personality = 'standard') => {
  // Base case: reached maximum depth or game over
  if (depth === 0) {
    return { score: evaluateBoard(board, color, personality) };
  }
  
  const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
  
  // Check for checkmate or stalemate
  if (isCheckmate(board, currentColor, castlingRights, lastMove)) {
    return { score: maximizingPlayer ? -10000 : 10000 };
  }
  
  if (isStalemate(board, currentColor, castlingRights, lastMove)) {
    return { score: 0 };
  }
  
  let moves = getAllValidMoves(board, currentColor, castlingRights, lastMove);
  
  // No valid moves
  if (moves.length === 0) {
    return { score: evaluateBoard(board, color, personality) };
  }
  
  // Apply personality-specific move preferences
  const aiPersonality = AI_PERSONALITIES[personality] || AI_PERSONALITIES.standard;
  if (aiPersonality.movePreference) {
    moves = aiPersonality.movePreference(moves);
  }
  
  let bestMove = null;
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalResult = minimax(newBoard, depth - 1, alpha, beta, false, color, castlingRights, move, personality);
      
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    
    return { move: bestMove, score: maxEval };
  } else {
    let minEval = Infinity;
    
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalResult = minimax(newBoard, depth - 1, alpha, beta, true, color, castlingRights, move, personality);
      
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    
    return { move: bestMove, score: minEval };
  }
};

// Get the best move for the AI
export const getBestMove = (board, color, castlingRights, lastMove, difficulty = 'medium', personality = 'standard') => {
  // Set depth based on difficulty
  let depth;
  switch (difficulty) {
    case 'easy':
      depth = 2;
      break;
    case 'medium':
      depth = 3;
      break;
    case 'hard':
      depth = 4;
      break;
    default:
      depth = 3;
  }
  
  // Apply personality difficulty multiplier
  const aiPersonality = AI_PERSONALITIES[personality] || AI_PERSONALITIES.standard;
  if (aiPersonality.difficultyMultiplier) {
    depth = Math.max(1, Math.round(depth * aiPersonality.difficultyMultiplier));
  }
  
  // Use minimax to find the best move
  const result = minimax(board, depth, -Infinity, Infinity, true, color, castlingRights, lastMove, personality);
  return result.move;
};