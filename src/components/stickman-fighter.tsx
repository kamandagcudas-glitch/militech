
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sword, Shield, User, Bot, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickmanFighterProps {
  onExit: () => void;
  onWin?: () => void;
}

type GameMode = 'PvP' | 'PvBot';

export default function StickmanFighter({ onExit, onWin }: StickmanFighterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const requestRef = useRef<number>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GROUND_Y = 350;
  const GRAVITY = 0.6;

  class Fighter {
    x: number;
    y: number;
    width: number = 40;
    height: number = 80;
    velocityX: number = 0;
    velocityY: number = 0;
    health: number = 100;
    color: string;
    isAttacking: boolean = false;
    attackType: 'punch' | 'kick' | null = null;
    isBlocking: boolean = false;
    isJumping: boolean = false;
    direction: number; // 1 for right, -1 for left
    name: string;
    attackCooldown: number = 0;

    constructor(x: number, y: number, color: string, direction: number, name: string) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.direction = direction;
      this.name = name;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      const headX = this.x + this.width / 2;
      const headY = this.y + 15;
      const headRadius = 12;

      // Body (Spine)
      ctx.beginPath();
      ctx.moveTo(headX, headY + headRadius);
      ctx.lineTo(headX, headY + 50);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Arms
      const armY = headY + 20;
      let leftArmX = headX - 20;
      let rightArmX = headX + 20;

      if (this.isAttacking) {
        if (this.attackType === 'punch') {
          if (this.direction === 1) rightArmX = headX + 40;
          else leftArmX = headX - 40;
        }
      }

      if (this.isBlocking) {
        leftArmX = headX - 10;
        rightArmX = headX + 10;
      }

      ctx.beginPath();
      ctx.moveTo(headX, armY);
      ctx.lineTo(leftArmX, armY + 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX, armY);
      ctx.lineTo(rightArmX, armY + 10);
      ctx.stroke();

      // Legs
      const legY = headY + 50;
      let leftLegEnd = legY + 25;
      let rightLegEnd = legY + 25;
      let leftLegX = headX - 15;
      let rightLegX = headX + 15;

      if (this.isAttacking && this.attackType === 'kick') {
        if (this.direction === 1) {
            rightLegX = headX + 45;
            rightLegEnd = legY + 5;
        } else {
            leftLegX = headX - 45;
            leftLegEnd = legY + 5;
        }
      }

      ctx.beginPath();
      ctx.moveTo(headX, legY);
      ctx.lineTo(leftLegX, leftLegEnd);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX, legY);
      ctx.lineTo(rightLegX, rightLegEnd);
      ctx.stroke();
      
      // HP Bar local indicator
      ctx.fillStyle = 'white';
      ctx.font = '12px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, headX, this.y - 10);
    }

    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;

      if (this.y + this.height < GROUND_Y) {
        this.velocityY += GRAVITY;
        this.isJumping = true;
      } else {
        this.velocityY = 0;
        this.y = GROUND_Y - this.height;
        this.isJumping = false;
      }

      if (this.attackCooldown > 0) this.attackCooldown--;
      
      // Keep in bounds
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
    }

    attack(type: 'punch' | 'kick') {
      if (this.attackCooldown === 0) {
        this.isAttacking = true;
        this.attackType = type;
        this.attackCooldown = 30;
        setTimeout(() => {
          this.isAttacking = false;
          this.attackType = null;
        }, 200);
      }
    }
  }

  const p1Ref = useRef<Fighter>(new Fighter(100, 200, '#00f6ff', 1, 'AGENT'));
  const p2Ref = useRef<Fighter>(new Fighter(660, 200, '#ff0080', -1, 'TARGET'));
  const keys = useRef<Set<string>>(new Set());

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background
    ctx.fillStyle = '#0a0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = '#3000ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    const p1 = p1Ref.current;
    const p2 = p2Ref.current;

    if (!winner) {
      // P1 Input
      p1.velocityX = 0;
      if (keys.current.has('a')) { p1.velocityX = -5; p1.direction = -1; }
      if (keys.current.has('d')) { p1.velocityX = 5; p1.direction = 1; }
      if (keys.current.has('w') && !p1.isJumping) p1.velocityY = -15;
      p1.isBlocking = keys.current.has('s');

      // P2 / Bot Input
      if (gameMode === 'PvP') {
        p2.velocityX = 0;
        if (keys.current.has('ArrowLeft')) { p2.velocityX = -5; p2.direction = -1; }
        if (keys.current.has('ArrowRight')) { p2.velocityX = 5; p2.direction = 1; }
        if (keys.current.has('ArrowUp') && !p2.isJumping) p2.velocityY = -15;
        p2.isBlocking = keys.current.has('ArrowDown');
      } else if (gameMode === 'PvBot') {
        // Simple Bot AI
        const dx = p1.x - p2.x;
        p2.velocityX = 0;
        if (Math.abs(dx) > 60) {
          p2.velocityX = dx > 0 ? 3 : -3;
          p2.direction = dx > 0 ? 1 : -1;
        } else {
          p2.direction = dx > 0 ? 1 : -1;
          if (Math.random() < 0.05) p2.attack(Math.random() > 0.5 ? 'punch' : 'kick');
          p2.isBlocking = p1.isAttacking && Math.random() < 0.7;
        }
      }

      // Update
      p1.update();
      p2.update();

      // Combat Check
      const checkHit = (attacker: Fighter, defender: Fighter) => {
        if (attacker.isAttacking && !defender.isBlocking) {
          const range = attacker.attackType === 'punch' ? 50 : 70;
          const dist = Math.abs((attacker.x + attacker.width/2) - (defender.x + defender.width/2));
          if (dist < range && Math.abs(attacker.y - defender.y) < 50) {
            defender.health -= attacker.attackType === 'punch' ? 5 : 8;
            attacker.isAttacking = false; // Prevent multi-hit
            if (defender.health <= 0) {
              defender.health = 0;
              setWinner(attacker.name);
              if (attacker.name === 'AGENT') onWin?.();
            }
          }
        }
      };

      checkHit(p1, p2);
      checkHit(p2, p1);
    }

    // Draw
    p1.draw(ctx);
    p2.draw(ctx);

    // Global HUD
    const drawHP = (fighter: Fighter, x: number, align: 'left' | 'right') => {
      const w = 300;
      const h = 20;
      ctx.fillStyle = '#333';
      ctx.fillRect(x, 20, w, h);
      ctx.fillStyle = fighter.color;
      const healthW = (fighter.health / 100) * w;
      ctx.fillRect(align === 'left' ? x : x + (w - healthW), 20, healthW, h);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(x, 20, w, h);
    };

    drawHP(p1, 20, 'left');
    drawHP(p2, CANVAS_WIDTH - 320, 'right');

    if (winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = winner === p1.name ? p1.color : p2.color;
      ctx.font = '48px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(`${winner} WINS`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      ctx.font = '20px Orbitron';
      ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameMode, winner, onWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      if (e.key === 'j') p1Ref.current.attack('punch');
      if (e.key === 'k') p1Ref.current.attack('kick');
      if (gameMode === 'PvP') {
        if (e.key === '1') p2Ref.current.attack('punch');
        if (e.key === '2') p2Ref.current.attack('kick');
      }
      if (winner && e.code === 'Space') {
        p1Ref.current.health = 100;
        p1Ref.current.x = 100;
        p2Ref.current.health = 100;
        p2Ref.current.x = 660;
        setWinner(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop, gameMode, winner]);

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-[800px] bg-black text-white p-8 space-y-8">
        <h2 className="text-4xl font-cyber text-primary animate-pulse flex items-center gap-4">
          <Sword className="h-10 w-10" /> SYSTEM INTRUSION <Shield className="h-10 w-10" />
        </h2>
        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
          <Button variant="cyber" className="h-24 text-xl" onClick={() => setGameMode('PvBot')}>
            <Bot className="mr-2" /> AGENT VS BOT
          </Button>
          <Button variant="cyber" className="h-24 text-xl" onClick={() => setGameMode('PvP')}>
            <User className="mr-2" /> LOCAL PVP
          </Button>
        </div>
        <Button variant="ghost" onClick={onExit} className="text-muted-foreground">Abort Mission</Button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg shadow-2xl shadow-primary/20 cursor-none"
      />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="destructive" size="icon" onClick={onExit}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/30 pointer-events-none">
        P1: WASD + J/K | {gameMode === 'PvP' ? 'P2: ARROWS + 1/2' : 'BOT MODE'}
      </div>
    </div>
  );
}
