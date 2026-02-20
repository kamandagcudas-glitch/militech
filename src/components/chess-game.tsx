
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Undo2, User, Bot, Trophy } from 'lucide-react';
import AnimatedGlitchText from './animated-glitch-text';
import { cn } from '@/lib/utils';

interface ChessGameProps {
  onExit: () => void;
  onWin?: () => void;
}

// Custom Piece SVGs for a "alive" technical look
const PieceIcon = ({ type, color }: { type: string; color: string }) => {
  const isWhite = color === 'w';
  const stroke = isWhite ? '#00f6ff' : '#ff0080';
  const fill = isWhite ? 'rgba(0, 246, 255, 0.2)' : 'rgba(255, 0, 128, 0.2)';

  switch (type) {
    case 'p': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2 drop-shadow-lg">
        <path d="M12 2L9 7H15L12 2ZM12 7V17M8 22H16M9 17H15" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'r': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2 drop-shadow-lg">
        <path d="M4 2V6M8 2V6M12 2V6M16 2V6M20 2V6M4 6H20V10H4V6ZM6 10L5 20H19L18 10M4 22H20" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'n': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2 drop-shadow-lg">
        <path d="M8 22V17L11 14L7 10L10 2L17 6L15 12L18 15V22H8Z" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'b': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2 drop-shadow-lg">
        <path d="M12 2C10 2 8 4 8 7C8 9 9 11 12 14C15 11 16 9 16 7C16 4 14 2 12 2ZM12 14V22M8 22H16" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'q': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2 drop-shadow-lg">
        <path d="M12 2L8 6L4 2L6 14H18L20 2L16 6L12 2ZM6 14L8 22H16L18 14" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'k': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2 drop-shadow-lg">
        <path d="M12 2V6M10 4H14M12 6L8 10L4 6L6 18H18L20 6L16 10L12 6ZM6 18L8 22H16L18 18" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    default: return null;
  }
};

export default function ChessGame({ onExit, onWin }: ChessGameProps) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveMode, setMoveMode] = useState<'PvP' | 'PvBot'>('PvBot');
  const [boardHistory, setBoardHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setLastMove({ from: move.from, to: move.to });
        setBoardHistory(prev => [...prev, game.fen()]);
        return result;
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [game]);

  const handleSquareClick = (square: Square) => {
    if (game.isGameOver()) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If a square is already selected, try to move there
    if (selectedSquare) {
      const move = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (move) {
        setSelectedSquare(null);
        return;
      }
    }

    // Otherwise, select the square if it has a piece of the current turn's color
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  // Bot logic
  useEffect(() => {
    if (moveMode === 'PvBot' && game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(() => {
        const moves = game.moves();
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const gameCopy = new Chess(game.fen());
          gameCopy.move(randomMove);
          setGame(gameCopy);
          setBoardHistory(prev => [...prev, game.fen()]);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game, moveMode]);

  useEffect(() => {
    if (game.isCheckmate() && game.turn() === 'b' && onWin) {
      onWin();
    }
  }, [game, onWin]);

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setBoardHistory([]);
    setLastMove(null);
  };

  const undoMove = () => {
    if (boardHistory.length === 0) return;
    const previousFen = boardHistory[boardHistory.length - 1];
    setGame(new Chess(previousFen));
    setBoardHistory(prev => prev.slice(0, -1));
    setSelectedSquare(null);
    setLastMove(null);
  };

  const board = useMemo(() => {
    const rows = [];
    for (let i = 7; i >= 0; i--) {
      const row = [];
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (i + 1) as Square;
        row.push(square);
      }
      rows.push(row);
    }
    return rows;
  }, []);

  const possibleMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true }).map(m => m.to);
  }, [selectedSquare, game]);

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-xl border-2 border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(0,246,255,0.3)] max-w-[95vw]">
      <div className="w-full flex justify-between items-center mb-6 border-b border-cyan-500/20 pb-4">
        <div className="flex flex-col">
          <AnimatedGlitchText text="BRAGA MODE ACTIVATED" className="text-2xl font-cyber text-cyan-400" />
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">Neural Core Link: Operational</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onExit} className="text-zinc-500 hover:text-cyan-400">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        <div className="lg:col-span-3 flex justify-center">
          {/* Chessboard Container */}
          <div className="relative aspect-square w-full max-w-[500px] border-4 border-zinc-800 rounded shadow-2xl bg-zinc-900 overflow-hidden">
            {/* The Grid Layer */}
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {board.map((row, i) => row.map((square, j) => {
                const isDark = (i + j) % 2 === 1;
                const isSelected = selectedSquare === square;
                const isPossible = possibleMoves.includes(square);
                const isLastMove = lastMove?.from === square || lastMove?.to === square;
                const isCheck = game.inCheck() && game.get(square)?.type === 'k' && game.get(square)?.color === game.turn();

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={cn(
                      "relative cursor-pointer transition-colors duration-200",
                      isDark ? "bg-zinc-800/50" : "bg-zinc-700/30",
                      isSelected && "bg-cyan-500/40 ring-inset ring-2 ring-cyan-400",
                      isLastMove && "bg-yellow-500/20",
                      isCheck && "bg-red-500/40 animate-pulse"
                    )}
                  >
                    {isPossible && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={cn(
                          "rounded-full bg-cyan-400/30",
                          game.get(square) ? "w-10 h-10 border-2 border-cyan-400/50" : "w-3 h-3"
                        )} />
                      </div>
                    )}
                    {/* Rank/File Labels */}
                    {j === 0 && <span className="absolute top-0.5 left-0.5 text-[8px] text-zinc-600 font-mono">{8 - i}</span>}
                    {i === 7 && <span className="absolute bottom-0.5 right-0.5 text-[8px] text-zinc-600 font-mono">{String.fromCharCode(97 + j)}</span>}
                  </div>
                );
              }))}
            </div>

            {/* The Piece Layer (Absolute Positioned for Smooth Transitions) */}
            {game.board().map((row, i) => row.map((piece, j) => {
              if (!piece) return null;
              const square = String.fromCharCode(97 + j) + (8 - i);
              return (
                <div
                  key={`${piece.type}-${piece.color}-${square}`}
                  className="absolute transition-all duration-300 ease-in-out pointer-events-none"
                  style={{
                    width: '12.5%',
                    height: '12.5%',
                    left: `${j * 12.5}%`,
                    top: `${i * 12.5}%`,
                  }}
                >
                  <PieceIcon type={piece.type} color={piece.color} />
                </div>
              );
            }))}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-cyber text-zinc-400 uppercase tracking-tighter flex items-center gap-2">
              <Bot className="h-4 w-4" /> Game Configuration
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={moveMode === 'PvBot' ? 'cyber' : 'outline'}
                size="sm"
                onClick={() => { setMoveMode('PvBot'); resetGame(); }}
                className="text-[10px]"
              >
                AGENT VS AI
              </Button>
              <Button
                variant={moveMode === 'PvP' ? 'cyber' : 'outline'}
                size="sm"
                onClick={() => { setMoveMode('PvP'); resetGame(); }}
                className="text-[10px]"
              >
                LOCAL NEURAL
              </Button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4 flex-grow">
            <h3 className="text-sm font-cyber text-zinc-400 uppercase tracking-tighter flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Status Monitor
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">TURN:</span>
                <span className={cn(
                  "font-bold",
                  game.turn() === 'w' ? "text-cyan-400" : "text-pink-500"
                )}>
                  {game.turn() === 'w' ? 'WHITE (AGENT)' : 'BLACK (HOST)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">STATE:</span>
                <span className="text-white uppercase">
                  {game.isGameOver() ? 'Terminated' : game.inCheck() ? 'Alert: Check' : 'Stable'}
                </span>
              </div>
            </div>

            {game.isGameOver() && (
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-center">
                <p className="text-xs font-bold text-cyan-400 mb-2 uppercase">Session Terminated</p>
                <p className="text-[10px] text-white">
                  {game.isCheckmate() ? `CHECKMATE - ${game.turn() === 'w' ? 'BLACK' : 'WHITE'} DOMINATES` : 
                   game.isDraw() ? 'STALEMATE - DATA CORRUPTION' : 'GAME OVER'}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={undoMove} disabled={boardHistory.length === 0}>
                <Undo2 className="h-3 w-3" /> UNDO ACTION
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs text-destructive hover:text-destructive" onClick={resetGame}>
                <RotateCcw className="h-3 w-3" /> REBOOT CORE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
