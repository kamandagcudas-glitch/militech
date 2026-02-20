
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sword, Shield, User, Bot, Trophy, Crosshair, Wand2, Zap, Skull, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickmanFighterProps {
  onExit: () => void;
  onWin?: () => void;
}

type GameMode = 'PvP' | 'PvBot';
type WeaponType = 'none' | 'sword' | 'spear' | 'gun';
type Difficulty = 'Easy' | 'Hard' | 'Hell';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  ownerName: string;
  color: string;
}

const WEAPONS: { type: WeaponType; icon: any; label: string; description: string }[] = [
    { type: 'sword', icon: Sword, label: 'Sword', description: 'Balanced speed & reach' },
    { type: 'spear', icon: Wand2, label: 'Spear', description: 'Maximum melee range' },
    { type: 'gun', icon: Crosshair, label: 'Railgun', description: 'Long-range projectiles' },
];

const DIFFICULTIES: { type: Difficulty; icon: any; label: string; description: string; color: string }[] = [
    { type: 'Easy', icon: Activity, label: 'EASY', description: 'Limited AI response', color: 'text-green-400' },
    { type: 'Hard', icon: Zap, label: 'HARD', description: 'Aggressive tactical bot', color: 'text-orange-400' },
    { type: 'Hell', icon: Skull, label: 'HELL', description: 'Absolute system dominance', color: 'text-destructive' },
];

const BATTLEFIELD_BG = "https://images.unsplash.com/photo-1515339760107-1952b7a08454?q=80&w=1200";

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
  attackType: 'punch' | 'kick' | 'shoot' | null = null;
  isBlocking: boolean = false;
  isJumping: boolean = false;
  direction: number; // 1 for right, -1 for left
  name: string;
  attackCooldown: number = 0;
  frame: number = 0;
  hitFlash: number = 0;
  weapon: WeaponType;

  constructor(x: number, y: number, color: string, direction: number, name: string, weapon: WeaponType) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.direction = direction;
    this.name = name;
    this.weapon = weapon;
  }

  draw(ctx: CanvasRenderingContext2D, GROUND_Y: number) {
    this.frame++;
    
    const drawColor = this.hitFlash > 0 ? '#ffffff' : this.color;
    if (this.hitFlash > 0) this.hitFlash--;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 5; // Thicker lines for visibility
    ctx.lineCap = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;

    const bob = Math.sin(this.frame * 0.1) * 3;
    const headBob = Math.sin(this.frame * 0.15) * 1.5;

    const headX = this.x + this.width / 2;
    const headY = this.y + 15 + bob + headBob;
    const headRadius = 14;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(headX, GROUND_Y, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Spine)
    ctx.beginPath();
    ctx.moveTo(headX, headY + headRadius);
    ctx.lineTo(headX, headY + 50);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = 'white';
    const eyeOffset = 5 * this.direction;
    if (this.hitFlash > 0) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX + eyeOffset - 3, headY - 3);
        ctx.lineTo(headX + eyeOffset + 3, headY + 3);
        ctx.moveTo(headX + eyeOffset + 3, headY - 3);
        ctx.lineTo(headX + eyeOffset - 3, headY + 3);
        ctx.stroke();
    } else if (this.isAttacking) {
        ctx.fillRect(headX + eyeOffset - 1, headY - 3, 8 * this.direction, 3);
    } else {
        ctx.fillRect(headX + eyeOffset, headY - 1, 3, 3);
    }

    ctx.shadowBlur = 0;

    // Arms & Weapon
    const armY = headY + 20;
    let leftArmX = headX - 20;
    let rightArmX = headX + 20;
    let leftArmY = armY + 15;
    let rightArmY = armY + 15;

    if (this.isAttacking) {
      if (this.attackType === 'punch' || this.attackType === 'shoot') {
        if (this.direction === 1) {
            rightArmX = headX + 50;
            rightArmY = armY;
        } else {
            leftArmX = headX - 50;
            leftArmY = armY;
        }
      }
    }

    if (this.isBlocking) {
      leftArmX = headX - 12;
      rightArmX = headX + 12;
      leftArmY = headY + 12;
      rightArmY = headY + 12;
    }

    if (Math.abs(this.velocityX) > 0 && !this.isAttacking && !this.isBlocking) {
        const sway = Math.sin(this.frame * 0.25) * 18;
        leftArmX -= sway;
        rightArmX += sway;
    }

    // Draw Arms
    ctx.beginPath();
    ctx.moveTo(headX, armY);
    ctx.lineTo(leftArmX, leftArmY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(headX, armY);
    ctx.lineTo(rightArmX, rightArmY);
    ctx.stroke();

    // DRAW WEAPONS
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    
    if (this.weapon === 'sword') {
        const weaponX = this.direction === 1 ? rightArmX : leftArmX;
        const weaponY = this.direction === 1 ? rightArmY : leftArmY;
        ctx.beginPath();
        ctx.moveTo(weaponX, weaponY);
        ctx.lineTo(weaponX + 35 * this.direction, weaponY - 25);
        ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    } else if (this.weapon === 'spear') {
        const weaponX = this.direction === 1 ? rightArmX : leftArmX;
        const weaponY = this.direction === 1 ? rightArmY : leftArmY;
        ctx.beginPath();
        ctx.moveTo(weaponX - 20 * this.direction, weaponY + 20);
        ctx.lineTo(weaponX + 60 * this.direction, weaponY - 40);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(weaponX + 60 * this.direction, weaponY - 40, 5, 0, Math.PI * 2);
        ctx.fill();
    } else if (this.weapon === 'gun') {
        const weaponX = this.direction === 1 ? rightArmX : leftArmX;
        const weaponY = this.direction === 1 ? rightArmY : leftArmY;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(weaponX, weaponY);
        ctx.lineTo(weaponX + 20 * this.direction, weaponY);
        ctx.stroke();
        ctx.lineWidth = 4;
        ctx.lineTo(weaponX + 20 * this.direction, weaponY + 10);
        ctx.stroke();
    }
    ctx.restore();

    // Legs
    const legY = headY + 50 - bob;
    let leftLegEnd = legY + 30;
    let rightLegEnd = legY + 30;
    let leftLegX = headX - 18;
    let rightLegX = headX + 18;

    if (Math.abs(this.velocityX) > 0 && !this.isJumping) {
        const walkCycle = Math.sin(this.frame * 0.25);
        leftLegX = headX + (walkCycle * 25);
        rightLegX = headX - (walkCycle * 25);
        leftLegEnd = legY + 30 - (Math.abs(walkCycle) * 8);
        rightLegEnd = legY + 30 - (Math.abs(walkCycle) * 8);
    }

    if (this.isAttacking && this.attackType === 'kick') {
      if (this.direction === 1) {
          rightLegX = headX + 60;
          rightLegEnd = legY + 10;
      } else {
          leftLegX = headX - 60;
          leftLegEnd = legY + 10;
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
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, headX, this.y - 25);
  }

  update(CANVAS_WIDTH: number, GROUND_Y: number) {
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.y + this.height < GROUND_Y) {
      this.velocityY += 0.7; // Slightly higher gravity
      this.isJumping = true;
    } else {
      this.velocityY = 0;
      this.y = GROUND_Y - this.height;
      this.isJumping = false;
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
  }

  attack(type: 'punch' | 'kick' | 'shoot', bulletsRef: React.MutableRefObject<Bullet[]>) {
    if (this.attackCooldown === 0) {
      this.isAttacking = true;
      this.attackType = type;
      
      if (type === 'shoot' && this.weapon === 'gun') {
          this.attackCooldown = 45;
          bulletsRef.current.push({
              x: this.x + (this.direction === 1 ? 65 : -25),
              y: this.y + 35,
              vx: 14 * this.direction,
              ownerName: this.name,
              color: this.color
          });
      } else {
          this.attackCooldown = 28;
      }

      setTimeout(() => {
        this.isAttacking = false;
        this.attackType = null;
      }, 180); // Longer window for collision
    }
  }
}

export default function StickmanFighter({ onExit, onWin }: StickmanFighterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [p1Weapon, setP1Weapon] = useState<WeaponType | null>(null);
  const [p2Weapon, setP2Weapon] = useState<WeaponType | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const requestRef = useRef<number>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const [shake, setShake] = useState(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GROUND_Y = 350;

  const p1Ref = useRef<Fighter | null>(null);
  const p2Ref = useRef<Fighter | null>(null);
  const keys = useRef<Set<string>>(new Set());

  // Load Background
  useEffect(() => {
    const img = new Image();
    img.src = BATTLEFIELD_BG;
    img.onload = () => { bgRef.current = img; };
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 15; i++) {
          particlesRef.current.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 1.0,
              color
          });
      }
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !p1Ref.current || !p2Ref.current) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let shakeX = 0;
    let shakeY = 0;
    if (shake > 0) {
        shakeX = (Math.random() - 0.5) * shake;
        shakeY = (Math.random() - 0.5) * shake;
        setShake(prev => Math.max(0, prev - 1));
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    // Draw Battlefield Background
    if (bgRef.current) {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(bgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1.0;
    } else {
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    // Grid floor
    ctx.strokeStyle = 'rgba(0, 246, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_Y);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#00f6ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    const p1 = p1Ref.current;
    const p2 = p2Ref.current;

    if (!winner) {
      // P1 Input
      p1.velocityX = 0;
      if (keys.current.has('a')) { p1.velocityX = -6; p1.direction = -1; }
      if (keys.current.has('d')) { p1.velocityX = 6; p1.direction = 1; }
      if (keys.current.has('w') && !p1.isJumping) p1.velocityY = -16;
      p1.isBlocking = keys.current.has('s');

      // P2 / Bot Input
      if (gameMode === 'PvP') {
        p2.velocityX = 0;
        if (keys.current.has('ArrowLeft')) { p2.velocityX = -6; p2.direction = -1; }
        if (keys.current.has('ArrowRight')) { p2.velocityX = 6; p2.direction = 1; }
        if (keys.current.has('ArrowUp') && !p2.isJumping) p2.velocityY = -16;
        p2.isBlocking = keys.current.has('ArrowDown');
      } else if (gameMode === 'PvBot' && difficulty) {
        const dx = p1.x - p2.x;
        p2.velocityX = 0;
        
        // Scaled AI Properties
        const aiSpeed = difficulty === 'Easy' ? 3.0 : difficulty === 'Hard' ? 5.5 : 7.5;
        const aiAttackFreq = difficulty === 'Easy' ? 0.02 : difficulty === 'Hard' ? 0.08 : 0.18;
        const aiBlockChance = difficulty === 'Easy' ? 0.3 : difficulty === 'Hard' ? 0.7 : 0.95;
        const aiJumpFreq = difficulty === 'Easy' ? 0.01 : difficulty === 'Hard' ? 0.04 : 0.1;

        if (Math.abs(dx) > (p2.weapon === 'gun' ? 350 : 80)) {
          p2.velocityX = dx > 0 ? aiSpeed : -aiSpeed;
          p2.direction = dx > 0 ? 1 : -1;
        } else {
          p2.direction = dx > 0 ? 1 : -1;
          if (p2.weapon === 'gun') {
              if (Math.random() < aiAttackFreq) p2.attack('shoot', bulletsRef);
          } else {
              if (Math.random() < aiAttackFreq) p2.attack(Math.random() > 0.4 ? 'punch' : 'kick', bulletsRef);
          }
          // AI Reactive Block
          if (p1.isAttacking && Math.random() < aiBlockChance) {
              p2.isBlocking = true;
          } else {
              p2.isBlocking = false;
          }
        }
        if (p1.isJumping && Math.random() < aiJumpFreq) p2.velocityY = -14;
      }

      p1.update(CANVAS_WIDTH, GROUND_Y);
      p2.update(CANVAS_WIDTH, GROUND_Y);

      // Combat Check
      const checkHit = (attacker: Fighter, defender: Fighter) => {
        if (attacker.isAttacking) {
          let range = 60;
          if (attacker.weapon === 'sword') range = 85;
          if (attacker.weapon === 'spear') range = 115;
          if (attacker.attackType === 'kick') range = 80;

          const dxToTarget = (defender.x + defender.width/2) - (attacker.x + attacker.width/2);
          const dist = Math.abs(dxToTarget);
          const isFacing = (dxToTarget > 0 && attacker.direction === 1) || (dxToTarget < 0 && attacker.direction === -1);

          if (isFacing && dist < range && Math.abs(attacker.y - defender.y) < 80) {
            let damage = attacker.attackType === 'punch' ? (attacker.weapon === 'gun' ? 3 : 10) : 15;
            
            // Damage Mitigation through blocking
            if (defender.isBlocking) {
                damage = Math.floor(damage * 0.15); // Chip damage exists
            }

            // Scaled Damage for AI
            if (attacker.name === 'AI_UNIT') {
                const multiplier = difficulty === 'Easy' ? 0.6 : difficulty === 'Hard' ? 1.3 : 2.5;
                damage = Math.floor(damage * multiplier);
            }

            if (damage > 0) {
                defender.health -= damage;
                defender.hitFlash = 6;
                spawnParticles(defender.x + defender.width/2, defender.y + 40, attacker.color);
                setShake(Math.min(damage, 15));
            }
            
            attacker.isAttacking = false; // consume the attack
            if (defender.health <= 0) {
              defender.health = 0;
              setWinner(attacker.name);
              if (attacker.name === 'AGENT_01') onWin?.();
            }
          }
        }
      };

      checkHit(p1, p2);
      checkHit(p2, p1);

      // Bullet logic
      bulletsRef.current.forEach((bullet, i) => {
          bullet.x += bullet.vx;
          
          const target = bullet.ownerName === p1.name ? p2 : p1;
          const distToTarget = Math.abs(bullet.x - (target.x + target.width/2));
          
          if (distToTarget < 35 && Math.abs(bullet.y - (target.y + 40)) < 50) {
              let damage = 12;
              if (target.isBlocking) {
                  damage = 2; // minor chip damage
              }
              if (bullet.ownerName === 'AI_UNIT') {
                  const multiplier = difficulty === 'Easy' ? 0.6 : difficulty === 'Hard' ? 1.3 : 2.5;
                  damage = Math.floor(damage * multiplier);
              }
              target.health -= damage;
              target.hitFlash = 6;
              spawnParticles(bullet.x, bullet.y, bullet.color);
              setShake(8);
              if (target.health <= 0) {
                  target.health = 0;
                  setWinner(bullet.ownerName);
                  if (bullet.ownerName === 'AGENT_01') onWin?.();
              }
              bulletsRef.current.splice(i, 1);
          }

          if (bullet.x < 0 || bullet.x > CANVAS_WIDTH) {
              bulletsRef.current.splice(i, 1);
          }
      });
    }

    // Draw Bullets
    bulletsRef.current.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, 10, 4);
        ctx.shadowBlur = 0;
    });

    // Particles
    particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.025;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    ctx.globalAlpha = 1.0;

    p1.draw(ctx, GROUND_Y);
    p2.draw(ctx, GROUND_Y);

    const drawHP = (fighter: Fighter, x: number, align: 'left' | 'right') => {
      const w = 320;
      const h = 20;
      ctx.fillStyle = '#111';
      ctx.fillRect(x, 30, w, h);
      const healthW = (fighter.health / 100) * w;
      const barX = align === 'left' ? x : x + (w - healthW);
      const grad = ctx.createLinearGradient(barX, 30, barX + healthW, 30);
      grad.addColorStop(0, fighter.color);
      grad.addColorStop(1, '#fff');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, 30, healthW, h);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 30, w, h);
    };

    drawHP(p1, 20, 'left');
    drawHP(p2, CANVAS_WIDTH - 340, 'right');

    if (winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.shadowBlur = 25;
      ctx.shadowColor = winner === p1.name ? p1.color : p2.color;
      ctx.fillStyle = winner === p1.name ? p1.color : p2.color;
      ctx.font = 'bold 54px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(`${winner} DOMINATES`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = '18px Orbitron';
      ctx.fillText('PRESS SPACE TO REINITIALIZE SIMULATION', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 70);
    }

    ctx.restore();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameMode, difficulty, winner, onWin, shake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;
      if (p1 && !winner) {
          if (e.key === 'j') p1.attack(p1.weapon === 'gun' ? 'shoot' : 'punch', bulletsRef);
          if (e.key === 'k') p1.attack('kick', bulletsRef);
      }
      if (gameMode === 'PvP' && p2 && !winner) {
        if (e.key === '1') p2.attack(p2.weapon === 'gun' ? 'shoot' : 'punch', bulletsRef);
        if (e.key === '2') p2.attack('kick', bulletsRef);
      }
      if (winner && e.code === 'Space') {
        if(p1) { p1.health = 100; p1.x = 100; p1.y = 200; p1.isAttacking = false; p1.attackCooldown = 0; }
        if(p2) { p2.health = 100; p2.x = 660; p2.y = 200; p2.isAttacking = false; p2.attackCooldown = 0; }
        setWinner(null);
        bulletsRef.current = [];
        particlesRef.current = [];
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

  // Handle Game Initialization
  useEffect(() => {
      if (gameMode && p1Weapon && p2Weapon && (gameMode === 'PvP' || difficulty)) {
          p1Ref.current = new Fighter(100, 200, '#00f6ff', 1, 'AGENT_01', p1Weapon);
          const p2Wep = gameMode === 'PvBot' ? (['sword', 'spear', 'gun'][Math.floor(Math.random()*3)] as WeaponType) : p2Weapon;
          p2Ref.current = new Fighter(660, 200, '#ff0080', -1, gameMode === 'PvBot' ? 'AI_UNIT' : 'AGENT_02', p2Wep);
      }
  }, [gameMode, difficulty, p1Weapon, p2Weapon]);

  const resetSelection = () => {
      setGameMode(null);
      setDifficulty(null);
      setP1Weapon(null);
      setP2Weapon(null);
      setWinner(null);
      p1Ref.current = null;
      p2Ref.current = null;
  };

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-[800px] bg-black text-white p-8 space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000')] bg-cover" />
        <h2 className="text-5xl font-cyber text-primary animate-pulse flex items-center gap-6 relative z-10">
          <Sword className="h-12 w-12" /> COMBAT INTRUSION <Shield className="h-12 w-12" />
        </h2>
        <div className="grid grid-cols-2 gap-8 w-full max-w-lg relative z-10">
          <Button variant="cyber" className="h-28 text-2xl group" onClick={() => setGameMode('PvBot')}>
            <Bot className="mr-3 h-8 w-8 transition-transform group-hover:scale-110" /> AGENT VS AI
          </Button>
          <Button variant="cyber" className="h-28 text-2xl group" onClick={() => setGameMode('PvP')}>
            <User className="mr-3 h-8 w-8 transition-transform group-hover:scale-110" /> LOCAL PVP
          </Button>
        </div>
        <Button variant="ghost" onClick={onExit} className="text-muted-foreground hover:text-primary z-10">
          Abort Simulation
        </Button>
      </div>
    );
  }

  if (gameMode === 'PvBot' && !difficulty) {
      return (
          <div className="flex flex-col items-center justify-center h-[400px] w-[800px] bg-black text-white p-8 relative overflow-hidden">
              <h3 className="text-3xl font-cyber text-primary mb-8">SELECT DIFFICULTY</h3>
              <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                  {DIFFICULTIES.map(d => (
                      <div 
                        key={d.type} 
                        className="bg-zinc-900 border border-primary/30 rounded-lg hover:border-primary transition-all cursor-pointer group p-6 flex flex-col items-center text-center gap-4"
                        onClick={() => setDifficulty(d.type)}
                      >
                          <d.icon className={cn("h-12 w-12 group-hover:scale-110 transition-transform", d.color)} />
                          <div>
                              <p className={cn("font-bold uppercase tracking-tighter", d.color)}>{d.label}</p>
                              <p className="text-[10px] text-zinc-500">{d.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
              <Button variant="link" className="mt-6 text-zinc-500" onClick={resetSelection}>Back to Modes</Button>
          </div>
      )
  }

  if (!p1Weapon || (gameMode === 'PvP' && !p2Weapon)) {
      const isSelectingP2 = p1Weapon !== null;
      return (
          <div className="flex flex-col items-center justify-center h-[400px] w-[800px] bg-black text-white p-8 relative overflow-hidden">
              <h3 className="text-3xl font-cyber text-accent mb-8">
                  SELECT ARMAMENT: {isSelectingP2 ? 'AGENT_02' : 'AGENT_01'}
              </h3>
              <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                  {WEAPONS.map(w => (
                      <div 
                        key={w.type} 
                        className="bg-zinc-900 border border-primary/30 rounded-lg hover:border-primary transition-all cursor-pointer group"
                        onClick={() => isSelectingP2 ? setP2Weapon(w.type) : (gameMode === 'PvBot' ? (setP1Weapon(w.type), setP2Weapon('none')) : setP1Weapon(w.type))}
                      >
                          <div className="p-6 flex flex-col items-center text-center gap-4">
                              <w.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                              <div>
                                  <p className="font-bold text-white uppercase tracking-tighter">{w.label}</p>
                                  <p className="text-[10px] text-zinc-500">{w.description}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
              <Button variant="link" className="mt-6 text-zinc-500" onClick={resetSelection}>Change Mode</Button>
          </div>
      )
  }

  return (
    <div className="relative group bg-black rounded-lg overflow-hidden border-2 border-primary/30">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="cursor-none"
      />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="destructive" size="icon" onClick={onExit} className="rounded-full shadow-lg shadow-black/50">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-8 text-[10px] font-mono text-white/40 pointer-events-none bg-black/40 backdrop-blur-sm p-2 rounded border border-white/10">
        <div className="flex flex-col">
            <span className="text-primary font-bold uppercase">AGENT_01 ({p1Weapon})</span>
            <span>WASD: MOVE | J: {p1Weapon === 'gun' ? 'FIRE' : 'ATTACK'} | K: KICK</span>
        </div>
        <div className="flex flex-col">
            <span className="text-pink-500 font-bold uppercase">
                {gameMode === 'PvBot' ? `AI_UNIT (${p2Ref.current?.weapon || 'RND'}) - ${difficulty}` : `AGENT_02 (${p2Weapon})`}
            </span>
            <span>{gameMode === 'PvBot' ? 'AUTONOMOUS' : `ARROWS: MOVE | 1: ${p2Weapon === 'gun' ? 'FIRE' : 'ATTACK'} | 2: KICK`}</span>
        </div>
      </div>
    </div>
  );
}
