/**
 * Chess rules utility functions
 * Handles move validation, special moves, and game state checks
 */

// Check if a move is valid based on piece type and chess rules
export const isValidMove = (board, fromRow, fromCol, toRow, toCol) => {
  const piece = board[fromRow][fromCol];
  if (!piece) return false;
  
  // Cannot capture own piece
  if (board[toRow][toCol] && board[toRow][toCol].color === piece.color) {
    return false;
  }
  
  // Check specific piece movement rules
  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(board, fromRow, fromCol, toRow, toCol);
    case 'rook':
      return isValidRookMove(board, fromRow, fromCol, toRow, toCol);
    case 'knight':
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);
    case 'bishop':
      return isValidBishopMove(board, fromRow, fromCol, toRow, toCol);
    case 'queen':
      return isValidQueenMove(board, fromRow, fromCol, toRow, toCol);
    case 'king':
      return isValidKingMove(board, fromRow, fromCol, toRow, toCol);
    default:
      return false;
  }
};

// Pawn movement validation including en passant
export const isValidPawnMove = (board, fromRow, fromCol, toRow, toCol, lastMove = null) => {
  const piece = board[fromRow][fromCol];
  const direction = piece.color === 'white' ? -1 : 1; // White moves up (-1), black moves down (+1)
  
  // Regular move forward
  if (fromCol === toCol && board[toRow][toCol] === null) {
    // Move one square forward
    if (toRow === fromRow + direction) {
      return true;
    }
    
    // Move two squares forward from starting position
    const startingRow = piece.color === 'white' ? 6 : 1;
    if (fromRow === startingRow && toRow === fromRow + 2 * direction && board[fromRow + direction][fromCol] === null) {
      return true;
    }
  }
  
  // Capture diagonally
  if (toRow === fromRow + direction && Math.abs(toCol - fromCol) === 1) {
    // Regular capture
    if (board[toRow][toCol] && board[toRow][toCol].color !== piece.color) {
      return true;
    }
    
    // En passant capture
    if (lastMove && 
        lastMove.piece.type === 'pawn' && 
        lastMove.to.row === fromRow && 
        lastMove.to.col === toCol && 
        Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
      return true;
    }
  }
  
  return false;
};

// Rook movement validation
export const isValidRookMove = (board, fromRow, fromCol, toRow, toCol) => {
  // Rook can only move horizontally or vertically
  if (fromRow !== toRow && fromCol !== toCol) {
    return false;
  }
  
  // Check if path is clear
  return isPathClear(board, fromRow, fromCol, toRow, toCol);
};

// Knight movement validation
export const isValidKnightMove = (fromRow, fromCol, toRow, toCol) => {
  // Knight moves in L-shape: 2 squares in one direction and 1 square perpendicular
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

// Bishop movement validation
export const isValidBishopMove = (board, fromRow, fromCol, toRow, toCol) => {
  // Bishop can only move diagonally
  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) {
    return false;
  }
  
  // Check if path is clear
  return isPathClear(board, fromRow, fromCol, toRow, toCol);
};

// Queen movement validation
export const isValidQueenMove = (board, fromRow, fromCol, toRow, toCol) => {
  // Queen can move like a rook or a bishop
  return isValidRookMove(board, fromRow, fromCol, toRow, toCol) || 
         isValidBishopMove(board, fromRow, fromCol, toRow, toCol);
};

// King movement validation including castling
export const isValidKingMove = (board, fromRow, fromCol, toRow, toCol, castlingRights = null, inCheck = false) => {
  // Regular king move (one square in any direction)
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  if (rowDiff <= 1 && colDiff <= 1) {
    return true;
  }
  
  // Castling
  if (castlingRights && !inCheck && rowDiff === 0 && colDiff === 2) {
    const piece = board[fromRow][fromCol];
    
    // Kingside castling
    if (toCol === fromCol + 2 && 
        ((piece.color === 'white' && castlingRights.whiteKingside) || 
         (piece.color === 'black' && castlingRights.blackKingside))) {
      // Check if path is clear
      return board[fromRow][fromCol + 1] === null && 
             board[fromRow][fromCol + 2] === null && 
             !isSquareAttacked(board, fromRow, fromCol + 1, piece.color) &&
             !isSquareAttacked(board, fromRow, fromCol + 2, piece.color);
    }
    
    // Queenside castling
    if (toCol === fromCol - 2 && 
        ((piece.color === 'white' && castlingRights.whiteQueenside) || 
         (piece.color === 'black' && castlingRights.blackQueenside))) {
      // Check if path is clear
      return board[fromRow][fromCol - 1] === null && 
             board[fromRow][fromCol - 2] === null && 
             board[fromRow][fromCol - 3] === null && 
             !isSquareAttacked(board, fromRow, fromCol - 1, piece.color) &&
             !isSquareAttacked(board, fromRow, fromCol - 2, piece.color);
    }
  }
  
  return false;
};

// Helper function to check if path between two positions is clear
export const isPathClear = (board, fromRow, fromCol, toRow, toCol) => {
  const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
  const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
  
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  
  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
};

// Check if a square is under attack by opponent pieces
export const isSquareAttacked = (board, row, col, defendingColor) => {
  const attackingColor = defendingColor === 'white' ? 'black' : 'white';
  
  // Check for attacks by pawns
  const pawnDirection = defendingColor === 'white' ? 1 : -1;
  if (row + pawnDirection >= 0 && row + pawnDirection < 8) {
    if (col - 1 >= 0 && 
        board[row + pawnDirection][col - 1] && 
        board[row + pawnDirection][col - 1].type === 'pawn' && 
        board[row + pawnDirection][col - 1].color === attackingColor) {
      return true;
    }
    if (col + 1 < 8 && 
        board[row + pawnDirection][col + 1] && 
        board[row + pawnDirection][col + 1].type === 'pawn' && 
        board[row + pawnDirection][col + 1].color === attackingColor) {
      return true;
    }
  }
  
  // Check for attacks by knights
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [rowOffset, colOffset] of knightMoves) {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && 
        board[newRow][newCol] && 
        board[newRow][newCol].type === 'knight' && 
        board[newRow][newCol].color === attackingColor) {
      return true;
    }
  }
  
  // Check for attacks by bishops, rooks, and queens
  const directions = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1],
    [0, 1], [1, -1], [1, 0], [1, 1]
  ];
  
  for (const [rowDir, colDir] of directions) {
    let newRow = row + rowDir;
    let newCol = col + colDir;
    
    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (board[newRow][newCol]) {
        if (board[newRow][newCol].color === attackingColor) {
          const pieceType = board[newRow][newCol].type;
          
          // Bishop attacks diagonally
          if ((pieceType === 'bishop' || pieceType === 'queen') && 
              Math.abs(rowDir) === Math.abs(colDir)) {
            return true;
          }
          
          // Rook attacks horizontally and vertically
          if ((pieceType === 'rook' || pieceType === 'queen') && 
              (rowDir === 0 || colDir === 0)) {
            return true;
          }
          
          // King attacks one square in any direction
          if (pieceType === 'king' && 
              Math.abs(newRow - row) <= 1 && 
              Math.abs(newCol - col) <= 1) {
            return true;
          }
        }
        break; // Stop checking in this direction if we hit any piece
      }
      
      newRow += rowDir;
      newCol += colDir;
    }
  }
  
  return false;
};

// Check if a king is in check
export const isKingInCheck = (board, kingColor) => {
  // Find the king's position
  let kingRow = -1;
  let kingCol = -1;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] && 
          board[row][col].type === 'king' && 
          board[row][col].color === kingColor) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== -1) break;
  }
  
  // Check if the king's square is under attack
  return isSquareAttacked(board, kingRow, kingCol, kingColor);
};

// Check if a move would put or leave the king in check
export const wouldBeInCheck = (board, fromRow, fromCol, toRow, toCol, kingColor) => {
  // Create a copy of the board to simulate the move
  const newBoard = board.map(row => [...row]);
  
  // Simulate the move
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  
  // Check if the king is in check after the move
  return isKingInCheck(newBoard, kingColor);
};

// Check if the game is in checkmate
export const isCheckmate = (board, kingColor, castlingRights, lastMove) => {
  // If the king is not in check, it's not checkmate
  if (!isKingInCheck(board, kingColor)) {
    return false;
  }
  
  // Check if any legal move can get the king out of check
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === kingColor) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            // Check if the move is valid according to piece rules
            if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
              // Check if the move would get the king out of check
              if (!wouldBeInCheck(board, fromRow, fromCol, toRow, toCol, kingColor)) {
                return false; // Found a legal move that escapes check
              }
            }
          }
        }
      }
    }
  }
  
  // No legal moves to escape check
  return true;
};

// Check if the game is in stalemate
export const isStalemate = (board, kingColor, castlingRights, lastMove) => {
  // If the king is in check, it's not stalemate
  if (isKingInCheck(board, kingColor)) {
    return false;
  }
  
  // Check if any legal move is available
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === kingColor) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            // Check if the move is valid according to piece rules
            if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
              // Check if the move would not put the king in check
              if (!wouldBeInCheck(board, fromRow, fromCol, toRow, toCol, kingColor)) {
                return false; // Found a legal move
              }
            }
          }
        }
      }
    }
  }
  
  // No legal moves available
  return true;
};

// Handle pawn promotion
export const canPromotePawn = (piece, toRow) => {
  if (piece.type !== 'pawn') return false;
  
  // Pawns promote when they reach the opposite end of the board
  return (piece.color === 'white' && toRow === 0) || 
         (piece.color === 'black' && toRow === 7);
};

// Handle castling
export const getCastlingMove = (board, fromRow, fromCol, toRow, toCol) => {
  // Check if it's a castling move
  if (board[fromRow][fromCol].type === 'king' && Math.abs(toCol - fromCol) === 2) {
    // Kingside castling
    if (toCol > fromCol) {
      return {
        rookFromRow: fromRow,
        rookFromCol: 7,
        rookToRow: fromRow,
        rookToCol: fromCol + 1
      };
    }
    // Queenside castling
    else {
      return {
        rookFromRow: fromRow,
        rookFromCol: 0,
        rookToRow: fromRow,
        rookToCol: fromCol - 1
      };
    }
  }
  
  return null;
};

// Handle en passant capture
export const getEnPassantCapture = (board, fromRow, fromCol, toRow, toCol, lastMove) => {
  const piece = board[fromRow][fromCol];
  
  if (piece.type === 'pawn' && 
      Math.abs(toCol - fromCol) === 1 && 
      board[toRow][toCol] === null) {
    // Check if it matches en passant conditions
    if (lastMove && 
        lastMove.piece.type === 'pawn' && 
        lastMove.to.row === fromRow && 
        lastMove.to.col === toCol && 
        Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
      return { captureRow: fromRow, captureCol: toCol };
    }
  }
  
  return null;
};

// Update castling rights after a move
export const updateCastlingRights = (castlingRights, piece, fromRow, fromCol) => {
  if (!castlingRights) return castlingRights;
  
  const newRights = { ...castlingRights };
  
  // If king moves, remove both castling rights for that color
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      newRights.whiteKingside = false;
      newRights.whiteQueenside = false;
    } else {
      newRights.blackKingside = false;
      newRights.blackQueenside = false;
    }
  }
  
  // If rook moves, remove the corresponding castling right
  if (piece.type === 'rook') {
    if (piece.color === 'white') {
      if (fromRow === 7 && fromCol === 0) newRights.whiteQueenside = false;
      if (fromRow === 7 && fromCol === 7) newRights.whiteKingside = false;
    } else {
      if (fromRow === 0 && fromCol === 0) newRights.blackQueenside = false;
      if (fromRow === 0 && fromCol === 7) newRights.blackKingside = false;
    }
  }
  
  return newRights;
};