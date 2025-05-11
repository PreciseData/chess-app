/**
 * AI Personalities for Chess
 * Different AI playing styles with unique evaluation functions and move preferences
 */

// Base evaluation weights used by all personalities
const BASE_PIECE_VALUES = {
  pawn: 10,
  knight: 30,
  bishop: 30,
  rook: 50,
  queen: 90,
  king: 900
};

// AI Personality definitions
export const AI_PERSONALITIES = {
  // Standard balanced AI (default)
  standard: {
    name: "Standard",
    description: "A balanced AI that plays conventional chess",
    pieceValues: { ...BASE_PIECE_VALUES },
    // Standard personality doesn't modify the base evaluation
    evaluationModifier: (board, color, baseEvaluation) => baseEvaluation,
    // No move preference bias
    movePreference: (moves) => moves,
    difficultyMultiplier: 1.0
  },
  
  // Aggressive AI that prioritizes attacks and captures
  aggressive: {
    name: "Aggressive",
    description: "Prioritizes attacking and capturing opponent pieces",
    pieceValues: { 
      ...BASE_PIECE_VALUES,
      // Values attacking pieces more highly
      knight: 32,
      bishop: 32,
      rook: 55,
      queen: 95
    },
    // Rewards positions with more potential attacks
    evaluationModifier: (board, color, baseEvaluation) => {
      let attackBonus = 0;
      
      // Count attacks on opponent pieces
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.color !== color) {
            // Check if this opponent piece is under attack
            if (isSquareAttacked(board, row, col, piece.color)) {
              attackBonus += getPieceValue(piece.type) * 0.2;
            }
          }
        }
      }
      
      return baseEvaluation + attackBonus;
    },
    // Prefers capturing moves and moves that put pieces in attacking positions
    movePreference: (moves) => {
      return moves.sort((a, b) => {
        // Prioritize captures
        const aIsCapture = a.capturedPiece != null;
        const bIsCapture = b.capturedPiece != null;
        
        if (aIsCapture && !bIsCapture) return -1;
        if (!aIsCapture && bIsCapture) return 1;
        
        // If both are captures, prioritize higher value captures
        if (aIsCapture && bIsCapture) {
          const aValue = getPieceValue(a.capturedPiece.type);
          const bValue = getPieceValue(b.capturedPiece.type);
          return bValue - aValue; // Higher value first
        }
        
        return 0;
      });
    },
    difficultyMultiplier: 1.1 // Slightly more challenging
  },
  
  // Defensive AI that prioritizes protection and safety
  defensive: {
    name: "Defensive",
    description: "Focuses on protecting pieces and building a solid position",
    pieceValues: { 
      ...BASE_PIECE_VALUES,
      // Values defensive pieces more
      pawn: 12, // Pawns are important for defense
      bishop: 28,
      knight: 28,
      king: 950 // King safety is paramount
    },
    // Rewards positions with better piece protection
    evaluationModifier: (board, color, baseEvaluation) => {
      let defenseBonus = 0;
      
      // Reward protected pieces
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.color === color) {
            // Check if this piece is protected by another piece
            if (isSquareProtected(board, row, col, color)) {
              defenseBonus += getPieceValue(piece.type) * 0.1;
            }
            
            // Penalize exposed pieces
            if (isSquareAttacked(board, row, col, piece.color) && 
                !isSquareProtected(board, row, col, color)) {
              defenseBonus -= getPieceValue(piece.type) * 0.15;
            }
          }
        }
      }
      
      // Bonus for keeping the king protected
      const kingPosition = findKing(board, color);
      if (kingPosition) {
        const [kingRow, kingCol] = kingPosition;
        
        // Reward pawn shield in front of king
        const pawnDirection = color === 'white' ? -1 : 1;
        for (let offset = -1; offset <= 1; offset++) {
          const shieldCol = kingCol + offset;
          if (shieldCol >= 0 && shieldCol < 8) {
            const shieldRow = kingRow + pawnDirection;
            if (shieldRow >= 0 && shieldRow < 8 && 
                board[shieldRow][shieldCol] && 
                board[shieldRow][shieldCol].type === 'pawn' && 
                board[shieldRow][shieldCol].color === color) {
              defenseBonus += 5;
            }
          }
        }
      }
      
      return baseEvaluation + defenseBonus;
    },
    // Prefers moves that protect pieces or improve king safety
    movePreference: (moves) => {
      return moves.sort((a, b) => {
        // Avoid captures if possible (don't trade)
        const aIsCapture = a.capturedPiece != null;
        const bIsCapture = b.capturedPiece != null;
        
        if (!aIsCapture && bIsCapture) return -1;
        if (aIsCapture && !bIsCapture) return 1;
        
        return 0;
      });
    },
    difficultyMultiplier: 1.0
  },
  
  // Positional AI that focuses on board control and piece coordination
  positional: {
    name: "Positional",
    description: "Emphasizes board control and piece coordination",
    pieceValues: { ...BASE_PIECE_VALUES },
    // Rewards control of the center and good piece positioning
    evaluationModifier: (board, color, baseEvaluation) => {
      let positionBonus = 0;
      
      // Bonus for controlling center squares
      const centerSquares = [
        [3, 3], [3, 4], [4, 3], [4, 4]
      ];
      
      for (const [row, col] of centerSquares) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          positionBonus += 5;
        }
        
        // Also count attacks on center squares
        if (isSquareAttacked(board, row, col, color === 'white' ? 'black' : 'white')) {
          positionBonus += 2;
        }
      }
      
      // Bonus for developed pieces (not in starting position)
      const backRank = color === 'white' ? 7 : 0;
      for (let col = 0; col < 8; col++) {
        const piece = board[backRank][col];
        if (piece && piece.color === color && 
            (piece.type === 'knight' || piece.type === 'bishop')) {
          // Penalize undeveloped minor pieces
          positionBonus -= 5;
        }
      }
      
      return baseEvaluation + positionBonus;
    },
    // Prefers moves that develop pieces and control the center
    movePreference: (moves) => {
      return moves.sort((a, b) => {
        // Prefer moves toward the center
        const aCenterDistance = getCenterDistance(a.toRow, a.toCol);
        const bCenterDistance = getCenterDistance(b.toRow, b.toCol);
        
        return aCenterDistance - bCenterDistance; // Lower distance first
      });
    },
    difficultyMultiplier: 1.2 // More challenging
  },
  
  // Creative AI that makes unexpected moves
  creative: {
    name: "Creative",
    description: "Makes unexpected and surprising moves",
    pieceValues: { 
      ...BASE_PIECE_VALUES,
      knight: 33, // Values knights more for their unpredictable movement
      bishop: 29
    },
    // Occasionally introduces randomness to evaluation
    evaluationModifier: (board, color, baseEvaluation) => {
      // Add some controlled randomness to the evaluation
      const randomFactor = (Math.random() - 0.5) * 10;
      return baseEvaluation + randomFactor;
    },
    // Occasionally chooses a random move from the top moves
    movePreference: (moves) => {
      // 20% chance to pick a random move from the top half of moves
      if (Math.random() < 0.2 && moves.length > 1) {
        const midpoint = Math.floor(moves.length / 2);
        const topMoves = moves.slice(0, midpoint);
        const randomIndex = Math.floor(Math.random() * topMoves.length);
        
        // Move the randomly selected move to the front
        const randomMove = topMoves[randomIndex];
        moves.splice(moves.indexOf(randomMove), 1);
        moves.unshift(randomMove);
      }
      
      return moves;
    },
    difficultyMultiplier: 1.0
  },
  
  // Beginner-friendly AI that makes occasional mistakes
  beginner: {
    name: "Beginner",
    description: "Makes occasional mistakes, suitable for new players",
    pieceValues: { ...BASE_PIECE_VALUES },
    // Occasionally undervalues pieces
    evaluationModifier: (board, color, baseEvaluation) => {
      // 30% chance to miscalculate evaluation
      if (Math.random() < 0.3) {
        return baseEvaluation * (0.7 + Math.random() * 0.3); // 70-100% of actual value
      }
      return baseEvaluation;
    },
    // Occasionally makes suboptimal moves
    movePreference: (moves) => {
      // 25% chance to pick a suboptimal move
      if (Math.random() < 0.25 && moves.length > 3) {
        const midpoint = Math.floor(moves.length / 2);
        const suboptimalMoves = moves.slice(midpoint);
        const randomIndex = Math.floor(Math.random() * suboptimalMoves.length);
        
        // Move a suboptimal move to the front
        const randomMove = suboptimalMoves[randomIndex];
        moves.splice(moves.indexOf(randomMove), 1);
        moves.unshift(randomMove);
      }
      
      return moves;
    },
    difficultyMultiplier: 0.7 // Easier
  }
};

// Helper functions

// Get the value of a piece type
function getPieceValue(pieceType) {
  return BASE_PIECE_VALUES[pieceType] || 0;
}

// Check if a square is attacked by any piece of the given color
function isSquareAttacked(board, row, col, defendingColor) {
  // Implementation would be similar to the one in chessRules.js
  // This is a simplified placeholder
  return false;
}

// Check if a square is protected by any piece of the given color
function isSquareProtected(board, row, col, color) {
  // Implementation would be similar to isSquareAttacked but for friendly pieces
  // This is a simplified placeholder
  return false;
}

// Find the king of the given color
function findKing(board, color) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return [row, col];
      }
    }
  }
  return null;
}

// Calculate distance from a square to the center of the board
function getCenterDistance(row, col) {
  const centerRow = 3.5;
  const centerCol = 3.5;
  return Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
}