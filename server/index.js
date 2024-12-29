import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const games = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinGame', (gameId) => {
    let game = games.get(gameId);
    
    if (!game) {
      game = {
        id: gameId,
        players: [],
        currentPlayer: 0,
        board: Array(9).fill(null)
      };
      games.set(gameId, game);
    }

    if (game.players.length >= 2) {
      socket.emit('gameFull');
      return;
    }

    game.players.push(socket.id);
    socket.join(gameId);
    
    const playerNumber = game.players.length;
    socket.emit('playerAssigned', {
      playerNumber,
      symbol: playerNumber === 1 ? 'O' : 'X'
    });

    if (game.players.length === 2) {
      io.to(gameId).emit('gameStart', {
        currentPlayer: game.players[0],
        board: game.board
      });
    }
  });

  socket.on('makeMove', ({ gameId, index }) => {
    const game = games.get(gameId);
    if (!game) return;

    const playerIndex = game.players.indexOf(socket.id);
    if (playerIndex === -1 || playerIndex !== game.currentPlayer) return;

    if (game.board[index] === null) {
      game.board[index] = playerIndex === 0 ? 'O' : 'X';
      game.currentPlayer = (game.currentPlayer + 1) % 2;

      io.to(gameId).emit('gameUpdate', {
        board: game.board,
        currentPlayer: game.players[game.currentPlayer]
      });

      const winner = checkWinner(game.board);
      if (winner || game.board.every(cell => cell !== null)) {
        io.to(gameId).emit('gameOver', { winner });
        games.delete(gameId);
      }
    }
  });

  socket.on('disconnect', () => {
    games.forEach((game, gameId) => {
      if (game.players.includes(socket.id)) {
        io.to(gameId).emit('playerDisconnected');
        games.delete(gameId);
      }
    });
  });
});

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});