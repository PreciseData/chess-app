# Chess App

A simple chess application built with React.

## Features

- Interactive chess board with piece movement
- Game state tracking
- Move history display
- Current player indicator
- Game status updates

## Project Structure

```
chess-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChessBoard.js
│   │   ├── ChessBoard.css
│   │   ├── ChessPiece.js
│   │   ├── ChessPiece.css
│   │   ├── GameInfo.js
│   │   └── GameInfo.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Getting Started

1. Install Node.js and npm if you haven't already
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## Future Improvements

- Add move validation
- Implement special moves (castling, en passant, promotion)
- Add check and checkmate detection
- Add timer functionality
- Add ability to play against AI
- Add online multiplayer functionality