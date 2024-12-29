import React, { useState } from 'react';

interface JoinGameProps {
  onJoin: (gameId: string) => void;
}

const JoinGame: React.FC<JoinGameProps> = ({ onJoin }) => {
  const [gameId, setGameId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      onJoin(gameId.trim());
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-6">Join Game</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter Game ID"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Join Game
        </button>
      </form>
    </div>
  );
};

export default JoinGame;