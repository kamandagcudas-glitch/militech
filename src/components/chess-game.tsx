'use client';

import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { Chess, Square } from 'chess.js';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Undo2, Trophy, Play, Signal, ShieldAlert, Cpu } from 'lucide-react';
import AnimatedGlitchText from './animated-glitch-text';
import { cn } from '@/lib/utils';
import { GameContext, GameContextType } from '@/context/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';

interface ChessGameProps {
  onExit: () => void;
  onWin?: () => void;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const PieceIcon = ({ type, color }: { type: string; color: string }) => {
  const isWhite = color === 'w';
  const stroke = isWhite ? '#00f6ff' : '#ff0080';
  const fill = isWhite ? 'rgba(0, 246, 255, 0.2)' : 'rgba(255, 0, 128, 0.2)';

  switch (type) {
    case 'p': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1.5 md:p-2 drop-shadow-lg">
        <path d="M12 2L9 7H15L12 2ZM12 7V17M8 22H16M9 17H15" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'r': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1.5 md:p-2 drop-shadow-lg">
        <path d="M4 2V6M8 2V6M12 2V6M16 2V6M20 2V6M4 6H20V10H4V6ZM6 10L5 20H19L18 10M4 22H20" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'n': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1.5 md:p-2 drop-shadow-lg">
        <path d="M8 22V17L11 14L7 10L10 2L17 6L15 12L18 15V22H8Z" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'b': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1.5 md:p-2 drop-shadow-lg">
        <path d="M12 2C10 2 8 4 8 7C8 9 9 11 12 14C15 11 16 9 16 7C16 4 14 2 12 2ZM12 14V22M8 22H16" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'q': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1.5 md:p-2 drop-shadow-lg">
        <path d="M12 2L8 6L4 2L6 14H18L20 2L16 6L12 2ZM6 14L8 22H16L18 14" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    case 'k': return (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1.5 md:p-2 drop-shadow-lg">
        <path d="M12 2V6M10 4H14M12 6L8 10L4 6L6 18H18L20 6L16 10L12 6ZM6 18L8 22H16L18 18" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    default: return null;
  }
};

const evaluateBoard = (game: Chess) => {
    const pieceValues: Record<string, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
    let score = 0;
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const val = pieceValues[piece.type];
                score += piece.color === 'w' ? val : -val;
            }
        }
    }
    return score;
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0 || game.isGameOver()) return evaluateBoard(game);

    const moves = game.moves();
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (const move of moves) {
            game.move(move);
            bestScore = Math.max(bestScore, minimax(game, depth - 1, alpha, beta, false));
            game.undo();
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break;
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            game.move(move);
            bestScore = Math.min(bestScore, minimax(game, depth - 1, alpha, beta, true));
            game.undo();
            beta = Math.min(beta, bestScore);
            if (beta <= alpha) break;
        }
        return bestScore;
    }
};

const getBestMove = (game: Chess, difficulty: Difficulty) => {
    const moves = game.moves();
    if (difficulty === 'Easy') return moves[Math.floor(Math.random() * moves.length)];
    
    let bestMove = '';
    let bestValue = Infinity;
    
    const depth = difficulty === 'Medium' ? 2 : 3;

    for (const move of moves) {
        game.move(move);
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, true);
        game.undo();
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove || moves[0];
};

export default function ChessGame({ onExit, onWin }: ChessGameProps) {
  const { accounts } = useContext(GameContext) as GameContextType;
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveMode, setMoveMode] = useState<'PvP' | 'PvBot'>('PvBot');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [boardHistory, setBoardHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (!isStarted) return null;
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
  }, [game, isStarted]);

  const handleSquareClick = (square: Square) => {
    if (!isStarted || game.isGameOver()) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (selectedSquare) {
      const move = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (move) {
        setSelectedSquare(null);
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  useEffect(() => {
    if (isStarted && moveMode === 'PvBot' && game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(game, difficulty);
        if (bestMove) {
          const gameCopy = new Chess(game.fen());
          gameCopy.move(bestMove);
          setGame(gameCopy);
          setBoardHistory(prev => [...prev, game.fen()]);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game, moveMode, difficulty, isStarted]);

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
    setIsStarted(false);
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

  const topAgents = useMemo(() => {
      return [...accounts].sort((a,b) => {
          const scoreA = Object.values(a.progress).reduce((acc, p) => acc + Object.values(p.scores).reduce((s,v) => s+v, 0), 0);
          const scoreB = Object.values(b.progress).reduce((acc, p) => acc + Object.values(p.scores).reduce((s,v) => s+v, 0), 0);
          return scoreB - scoreA;
      }).slice(0, 10);
  }, [accounts]);

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-4 md:p-8 rounded-xl border-2 border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(0,246,255,0.3)] w-full max-w-[1200px] min-h-[700px] overflow-x-hidden overflow-y-auto">
      <div className="w-full flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
        <div className="flex flex-col">
          <AnimatedGlitchText text="BRAGA MODE" className="text-xl md:text-3xl font-cyber text-cyan-400" />
          <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1 flex items-center gap-2">
            <Signal className="h-4 w-4 text-cyan-500 animate-pulse" /> Neural Link: Secure
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onExit} className="text-zinc-500 hover:text-cyan-400 h-10 w-10">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Leaderboard Panel */}
        <div className="lg:col-span-3 order-3 lg:order-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 h-full flex flex-col max-h-[300px] lg:max-h-none">
                <h3 className="text-xs font-cyber text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Top Agents
                </h3>
                <ScrollArea className="flex-grow">
                    <div className="space-y-4 pr-3">
                        {topAgents.map((agent, index) => (
                            <div key={agent.player.uid} className="flex items-center gap-4 p-3 rounded bg-zinc-800/30 border border-white/5 group hover:border-cyan-500/30 transition-colors">
                                <span className="text-xs font-mono text-zinc-500">{index + 1}</span>
                                <GamifiedAvatar account={agent} imageClassName="w-8 h-8" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-white truncate">{agent.player.displayName}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">LVL {(Object.values(agent.progress).reduce((acc, p) => acc + p.completedSteps.length, 0))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>

        {/* Board Section */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center gap-8">
          <div className="relative aspect-square w-full max-w-[550px] border-4 md:border-8 border-zinc-800 rounded shadow-2xl bg-zinc-900 overflow-hidden ring-4 md:ring-8 ring-cyan-500/10">
            {!isStarted && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center gap-8">
                    <Cpu className="h-12 w-12 md:h-16 md:w-16 text-cyan-400 animate-pulse" />
                    <div>
                        <h4 className="text-lg md:text-2xl font-cyber text-white uppercase tracking-widest">Simulation Idle</h4>
                        <p className="text-xs md:text-sm text-zinc-500 mt-2">Initialize neural interface to begin combat.</p>
                    </div>
                    <Button variant="cyber" size="lg" className="px-12 h-12 md:h-14 uppercase text-xs md:text-sm tracking-widest" onClick={() => setIsStarted(true)}>
                        <Play className="mr-2 h-5 w-5" /> Start Sim
                    </Button>
                </div>
            )}
            
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
                      isSelected && "bg-cyan-500/40 ring-inset ring-2 md:ring-4 ring-cyan-400",
                      isLastMove && "bg-yellow-500/10",
                      isCheck && "bg-red-500/40 animate-pulse"
                    )}
                  >
                    {isPossible && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={cn(
                          "rounded-full bg-cyan-400/30",
                          game.get(square) ? "w-full h-full border-2 border-cyan-400/50" : "w-3 h-3 md:w-4 md:h-4"
                        )} />
                      </div>
                    )}
                    {j === 0 && <span className="absolute top-1 left-1 text-[8px] md:text-[10px] text-zinc-600 font-mono">{8 - i}</span>}
                    {i === 7 && <span className="absolute bottom-1 right-1 text-[8px] md:text-[10px] text-zinc-600 font-mono">{String.fromCharCode(97 + j)}</span>}
                  </div>
                );
              }))}
            </div>

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
        <div className="lg:col-span-3 order-2 lg:order-3 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
            <h3 className="text-xs font-cyber text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="h-4 w-4" /> System Logic
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-2">
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => { setMoveMode('PvBot'); resetGame(); }}
                    className={cn("flex-1 text-[10px] h-10", moveMode !== 'PvBot' && "opacity-50 grayscale")}
                  >
                    AI Unit
                  </Button>
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => { setMoveMode('PvP'); resetGame(); }}
                    className={cn("flex-1 text-[10px] h-10", moveMode !== 'PvP' && "opacity-50 grayscale")}
                  >
                    Link
                  </Button>
              </div>
              
              {moveMode === 'PvBot' && (
                  <div className="space-y-3 mt-2">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Difficulty</p>
                      <div className="grid grid-cols-3 gap-2">
                          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                              <Button
                                key={d}
                                variant="cyber"
                                size="sm"
                                onClick={() => setDifficulty(d)}
                                className={cn("text-[10px] h-9 px-0", difficulty !== d && "opacity-50 grayscale")}
                              >
                                {d}
                              </Button>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6 flex-grow flex flex-col">
            <h3 className="text-xs font-cyber text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Mission State
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 uppercase">Turn:</span>
                <span className={cn(
                  "font-bold",
                  game.turn() === 'w' ? "text-cyan-400" : "text-pink-500"
                )}>
                  {game.turn() === 'w' ? 'Agent' : moveMode === 'PvBot' ? 'CPU' : 'Peer'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 uppercase">Status:</span>
                <span className="text-white uppercase flex items-center gap-1 text-[10px]">
                  {game.isGameOver() ? <ShieldAlert className="h-4 w-4 text-destructive" /> : null}
                  {game.isGameOver() ? 'Halted' : game.inCheck() ? 'Check' : 'Stable'}
                </span>
              </div>
            </div>

            {game.isGameOver() && (
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded text-center animate-in fade-in zoom-in-95 duration-500">
                <p className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-widest">Terminated</p>
                <p className="text-[10px] text-white font-mono leading-relaxed">
                  {game.isCheckmate() ? `Checkmate` : 
                   game.isDraw() ? 'Stalemate' : 'Ended'}
                </p>
              </div>
            )}

            <div className="mt-auto space-y-3 pt-6">
              <Button variant="cyber" className="w-full justify-start gap-3 h-10 text-[10px] uppercase tracking-widest" onClick={undoMove} disabled={boardHistory.length === 0}>
                <Undo2 className="h-4 w-4" /> Undo
              </Button>
              <Button variant="cyber" className="w-full justify-start gap-3 h-10 text-[10px] uppercase tracking-widest" onClick={resetGame}>
                <RotateCcw className="h-4 w-4" /> Reboot
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
