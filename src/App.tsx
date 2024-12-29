import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Circle, X } from 'lucide-react'; 
import GameBoard from './components/GameBoard';
import JoinGame from './components/JoinGame';

const socket = io('http://localhost:3000');

function App() {
  const [gameId, setGameId] = useState<string>('');
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    socket.on('playerAssigned', ({ playerNumber, symbol }) => {
      setPlayerNumber(playerNumber);
      setPlayerSymbol(symbol);
    });

    socket.on('gameStart', ({ currentPlayer, board }) => {
      setGameStarted(true);
      setCurrentPlayer(currentPlayer);
      setBoard(board);
    });

    socket.on('gameUpdate', ({ board, currentPlayer }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
    });

    socket.on('gameOver', ({ winner }) => {
      setWinner(winner);
    });

    socket.on('playerDisconnected', () => {
      alert('Other player disconnected');
      window.location.reload();
    });

    socket.on('gameFull', () => {
      alert('Game is full');
    });

    return () => {
      socket.off('playerAssigned');
      socket.off('gameStart');
      socket.off('gameUpdate');
      socket.off('gameOver');
      socket.off('playerDisconnected');
      socket.off('gameFull');
    };
  }, []);

  const handleJoinGame = (id: string) => {
    setGameId(id);
    socket.emit('joinGame', id);
  };

  const handleMove = (index: number) => {
    if (!gameStarted || board[index] || winner || currentPlayer !== socket.id) {
      return;
    }

    socket.emit('makeMove', { gameId, index });
  };

  const isMyTurn = currentPlayer === socket.id;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {!gameStarted ? (
          <JoinGame onJoin={handleJoinGame} />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Tic Tac Toe</h1>
              <div className="flex items-center justify-center gap-2">
                <span>You are Player {playerNumber}</span>
                {playerSymbol === 'O' ? (
                  <Circle className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>
              {winner ? (
                <p className="text-lg font-semibold mt-2">
                  {winner === playerSymbol ? 'You won!' : 'You lost!'}
                </p>
              ) : (
                <p className="text-lg mt-2">
                  {isMyTurn ? "Your turn" : "Opponent's turn"}
                </p>
              )}
            </div>
            <GameBoard board={board} onMove={handleMove} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
