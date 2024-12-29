import React from 'react';
import { Circle, X } from 'lucide-react';

interface GameBoardProps {
  board: (string | null)[];
  onMove: (index: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onMove }) => {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {board.map((cell, index) => (
        <button
          key={index}
          className={`
            w-20 h-20 flex items-center justify-center
            bg-gray-50 rounded-lg border-2 border-gray-200
            hover:bg-gray-100 transition-colors
            ${cell ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => onMove(index)}
          disabled={!!cell}
        >
          {cell === 'O' && <Circle className="w-8 h-8 text-blue-500" />}
          {cell === 'X' && <X className="w-8 h-8 text-red-500" />}
        </button>
      ))}
    </div>
  );
};

export default GameBoard;
