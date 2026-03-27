'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, ChevronDown } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  L: [[1, 0], [1, 0], [1, 1]],
  J: [[0, 1], [0, 1], [1, 1]],
  O: [[1, 1], [1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[1, 1, 1], [0, 1, 0]],
};

const COLORS = ['#f43f5e', '#fbbf24', '#10b981', '#6366f1', '#8b5cf6', '#0ea5e9', '#f97316'];

export const TetrisGame = () => {
  const [grid, setGrid] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [activePiece, setActivePiece] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef(null);

  const spawnPiece = useCallback(() => {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    const shape = SHAPES[type];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const piece = {
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
      shape,
      color,
    };

    if (checkCollision(piece.pos, piece.shape, grid)) {
      setGameOver(true);
      return null;
    }
    return piece;
  }, [grid]);

  const checkCollision = (pos, shape, currentGrid) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && currentGrid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (shape) => {
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
  };

  const movePiece = (dx, dy) => {
    if (!activePiece || gameOver) return;
    const newPos = { x: activePiece.pos.x + dx, y: activePiece.pos.y + dy };
    if (!checkCollision(newPos, activePiece.shape, grid)) {
      setActivePiece({ ...activePiece, pos: newPos });
    } else if (dy > 0) {
      lockPiece();
    }
  };

  const lockPiece = () => {
    const newGrid = grid.map(row => [...row]);
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = activePiece.pos.y + y;
          const gridX = activePiece.pos.x + x;
          if (gridY >= 0) newGrid[gridY][gridX] = activePiece.color;
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(0));
    }

    setGrid(filteredGrid);
    setScore(prev => prev + (linesCleared * 100));
    setActivePiece(spawnPiece());
  };

  const handleRotate = () => {
    if (!activePiece || gameOver) return;
    const newShape = rotate(activePiece.shape);
    if (!checkCollision(activePiece.pos, newShape, grid)) {
      setActivePiece({ ...activePiece, shape: newShape });
    }
  };

  useEffect(() => {
    if (!activePiece && !gameOver) {
      setActivePiece(spawnPiece());
    }
  }, [activePiece, gameOver, spawnPiece]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') movePiece(-1, 0);
      if (e.key === 'ArrowRight') movePiece(1, 0);
      if (e.key === 'ArrowDown') movePiece(0, 1);
      if (e.key === 'ArrowUp') handleRotate();
      if (e.key === ' ') {
        let newY = activePiece.pos.y;
        while (!checkCollision({ x: activePiece.pos.x, y: newY + 1 }, activePiece.shape, grid)) {
          newY++;
        }
        setActivePiece({ ...activePiece, pos: { ...activePiece.pos, y: newY } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePiece, grid, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    gameLoopRef.current = setInterval(() => {
      movePiece(0, 1);
    }, 800);
    return () => clearInterval(gameLoopRef.current);
  }, [activePiece, grid, gameOver]);

  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
              displayGrid[gridY][gridX] = activePiece.color;
            }
          }
        });
      });
    }
    return displayGrid;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full px-4">
        <div className="text-[10px] font-display uppercase tracking-widest text-white/40">Score: {score}</div>
        {gameOver && <div className="text-[10px] font-display uppercase tracking-widest text-red-500">Game Over</div>}
      </div>

      <div 
        className="grid bg-black/60 border border-white/10 rounded-lg overflow-hidden"
        style={{ 
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          width: COLS * BLOCK_SIZE,
          height: ROWS * BLOCK_SIZE
        }}
      >
        {renderGrid().map((row, y) => 
          row.map((cell, x) => (
            <div 
              key={`${y}-${x}`}
              className="border-[0.5px] border-white/5"
              style={{ backgroundColor: cell || 'transparent' }}
            />
          ))
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] mt-4">
        <div />
        <button onClick={handleRotate} className="p-4 bg-white/5 rounded-xl flex justify-center"><RotateCw className="w-5 h-5" /></button>
        <div />
        <button onClick={() => movePiece(-1, 0)} className="p-4 bg-white/5 rounded-xl flex justify-center"><ArrowLeft className="w-5 h-5" /></button>
        <button onClick={() => movePiece(0, 1)} className="p-4 bg-white/5 rounded-xl flex justify-center"><ArrowDown className="w-5 h-5" /></button>
        <button onClick={() => movePiece(1, 0)} className="p-4 bg-white/5 rounded-xl flex justify-center"><ArrowRight className="w-5 h-5" /></button>
      </div>

      {gameOver && (
        <button 
          onClick={() => {
            setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
            setScore(0);
            setGameOver(false);
            setActivePiece(null);
          }}
          className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-display uppercase tracking-widest"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
