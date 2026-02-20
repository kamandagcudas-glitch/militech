
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sword, Shield, User, Bot, Trophy, Crosshair, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickmanFighterProps {
  onExit: () => void;
  onWin?: () => void;
}

type GameMode = 'PvP' | 'PvBot';
type WeaponType = 'none' | 'sword' | 'spear' | 'gun';

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
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;

    const bob = Math.sin(this.frame * 0.1) * 2;
    const headBob = Math.sin(this.frame * 0.15) * 1;

    const headX = this.x + this.width / 2;
    const headY = this.y + 15 + bob + headBob;
    const headRadius = 12;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(headX, GROUND_Y, 20, 5, 0, 0, Math.PI * 2);
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
    const eyeOffset = 4 * this.direction;
    if (this.hitFlash > 0) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX + eyeOffset - 2, headY - 2);
        ctx.lineTo(headX + eyeOffset + 2, headY + 2);
        ctx.moveTo(headX + eyeOffset + 2, headY - 2);
        ctx.lineTo(headX + eyeOffset - 2, headY + 2);
        ctx.stroke();
    } else if (this.isAttacking) {
        ctx.fillRect(headX + eyeOffset - 1, headY - 2, 6 * this.direction, 2);
    } else {
        ctx.fillRect(headX + eyeOffset, headY - 1, 2, 2);
    }

    ctx.shadowBlur = 0;

    // Arms & Weapon
    const armY = headY + 20;
    let leftArmX = headX - 20;
    let rightArmX = headX + 20;
    let leftArmY = armY + 10;
    let rightArmY = armY + 10;

    if (this.isAttacking) {
      if (this.attackType === 'punch' || this.attackType === 'shoot') {
        if (this.direction === 1) {
            rightArmX = headX + 45;
            rightArmY = armY;
        } else {
            leftArmX = headX - 45;
            leftArmY = armY;
        }
      }
    }

    if (this.isBlocking) {
      leftArmX = headX - 10;
      rightArmX = headX + 10;
      leftArmY = headY + 10;
      rightArmY = headY + 10;
    }

    if (Math.abs(this.velocityX) > 0 && !this.isAttacking && !this.isBlocking) {
        const sway = Math.sin(this.frame * 0.2) * 15;
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
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    
    if (this.weapon === 'sword') {
        const weaponX = this.direction === 1 ? rightArmX : leftArmX;
        const weaponY = this.direction === 1 ? rightArmY : leftArmY;
        ctx.beginPath();
        ctx.moveTo(weaponX, weaponY);
        ctx.lineTo(weaponX + 30 * this.direction, weaponY - 20);
        ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    } else if (this.weapon === 'spear') {
        const weaponX = this.direction === 1 ? rightArmX : leftArmX;
        const weaponY = this.direction === 1 ? rightArmY : leftArmY;
        ctx.beginPath();
        ctx.moveTo(weaponX - 15 * this.direction, weaponY + 15);
        ctx.lineTo(weaponX + 50 * this.direction, weaponY - 30);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(weaponX + 50 * this.direction, weaponY - 30, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (this.weapon === 'gun') {
        const weaponX = this.direction === 1 ? rightArmX : leftArmX;
        const weaponY = this.direction === 1 ? rightArmY : leftArmY;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(weaponX, weaponY);
        ctx.lineTo(weaponX + 15 * this.direction, weaponY);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.lineTo(weaponX + 15 * this.direction, weaponY + 8);
        ctx.stroke();
    }
    ctx.restore();

    // Legs
    const legY = headY + 50 - bob;
    let leftLegEnd = legY + 25;
    let rightLegEnd = legY + 25;
    let leftLegX = headX - 15;
    let rightLegX = headX + 15;

    if (Math.abs(this.velocityX) > 0 && !this.isJumping) {
        const walkCycle = Math.sin(this.frame * 0.2);
        leftLegX = headX + (walkCycle * 20);
        rightLegX = headX - (walkCycle * 20);
        leftLegEnd = legY + 25 - (Math.abs(walkCycle) * 5);
        rightLegEnd = legY + 25 - (Math.abs(walkCycle) * 5);
    }

    if (this.isAttacking && this.attackType === 'kick') {
      if (this.direction === 1) {
          rightLegX = headX + 50;
          rightLegEnd = legY;
      } else {
          leftLegX = headX - 50;
          leftLegEnd = legY;
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
    ctx.font = 'bold 10px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, headX, this.y - 20);
  }

  update(CANVAS_WIDTH: number, GROUND_Y: number) {
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.y + this.height < GROUND_Y) {
      this.velocityY += 0.6;
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
          this.attackCooldown = 40;
          bulletsRef.current.push({
              x: this.x + (this.direction === 1 ? 60 : -20),
              y: this.y + 35,
              vx: 12 * this.direction,
              ownerName: this.name,
              color: this.color
          });
      } else {
          this.attackCooldown = 25;
      }

      setTimeout(() => {
        this.isAttacking = false;
        this.attackType = null;
      }, 150);
    }
  }
}

export default function StickmanFighter({ onExit, onWin }: StickmanFighterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
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
      for (let i = 0; i < 10; i++) {
          particlesRef.current.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
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
        ctx.globalAlpha = 0.4;
        ctx.drawImage(bgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1.0;
    } else {
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    // Grid floor
    ctx.strokeStyle = 'rgba(48, 0, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_Y);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
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
        const dx = p1.x - p2.x;
        p2.velocityX = 0;
        if (Math.abs(dx) > (p2.weapon === 'gun' ? 300 : 70)) {
          p2.velocityX = dx > 0 ? 3.5 : -3.5;
          p2.direction = dx > 0 ? 1 : -1;
        } else {
          p2.direction = dx > 0 ? 1 : -1;
          if (p2.weapon === 'gun') {
              if (Math.random() < 0.03) p2.attack('shoot', bulletsRef);
          } else {
              if (Math.random() < 0.06) p2.attack(Math.random() > 0.4 ? 'punch' : 'kick', bulletsRef);
          }
          p2.isBlocking = p1.isAttacking && Math.random() < 0.8;
        }
        if (p1.isJumping && Math.random() < 0.02) p2.velocityY = -12;
      }

      p1.update(CANVAS_WIDTH, GROUND_Y);
      p2.update(CANVAS_WIDTH, GROUND_Y);

      // Combat Check
      const checkHit = (attacker: Fighter, defender: Fighter) => {
        if (attacker.isAttacking && !defender.isBlocking) {
          let range = 55;
          if (attacker.weapon === 'sword' && attacker.attackType === 'punch') range = 75;
          if (attacker.weapon === 'spear' && attacker.attackType === 'punch') range = 100;
          if (attacker.attackType === 'kick') range = 75;

          const dist = Math.abs((attacker.x + attacker.width/2) - (defender.x + defender.width/2));
          if (dist < range && Math.abs(attacker.y - defender.y) < 60) {
            const damage = attacker.attackType === 'punch' ? (attacker.weapon === 'gun' ? 2 : 8) : 12;
            defender.health -= damage;
            defender.hitFlash = 5;
            spawnParticles(defender.x + defender.width/2, defender.y + 40, attacker.color);
            setShake(damage);
            attacker.isAttacking = false;
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
          const dist = Math.abs(bullet.x - (target.x + target.width/2));
          if (dist < 30 && Math.abs(bullet.y - (target.y + 40)) < 40) {
              if (!target.isBlocking) {
                  target.health -= 10;
                  target.hitFlash = 5;
                  spawnParticles(bullet.x, bullet.y, bullet.color);
                  setShake(5);
                  if (target.health <= 0) {
                      target.health = 0;
                      setWinner(bullet.ownerName);
                  }
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, 8, 3);
        ctx.shadowBlur = 0;
    });

    // Particles
    particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    ctx.globalAlpha = 1.0;

    p1.draw(ctx, GROUND_Y);
    p2.draw(ctx, GROUND_Y);

    const drawHP = (fighter: Fighter, x: number, align: 'left' | 'right') => {
      const w = 300;
      const h = 15;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x, 30, w, h);
      const healthW = (fighter.health / 100) * w;
      const barX = align === 'left' ? x : x + (w - healthW);
      const grad = ctx.createLinearGradient(barX, 30, barX + healthW, 30);
      grad.addColorStop(0, fighter.color);
      grad.addColorStop(1, '#fff');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, 30, healthW, h);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 30, w, h);
    };

    drawHP(p1, 20, 'left');
    drawHP(p2, CANVAS_WIDTH - 320, 'right');

    if (winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.shadowBlur = 20;
      ctx.shadowColor = winner === p1.name ? p1.color : p2.color;
      ctx.fillStyle = winner === p1.name ? p1.color : p2.color;
      ctx.font = 'bold 48px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(`${winner} DOMINATES`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = '16px Orbitron';
      ctx.fillText('PRESS SPACE TO REINITIALIZE SIMULATION', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 60);
    }

    ctx.restore();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameMode, winner, onWin, shake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;
      if (p1) {
          if (e.key === 'j') p1.attack(p1.weapon === 'gun' ? 'shoot' : 'punch', bulletsRef);
          if (e.key === 'k') p1.attack('kick', bulletsRef);
      }
      if (gameMode === 'PvP' && p2) {
        if (e.key === '1') p2.attack(p2.weapon === 'gun' ? 'shoot' : 'punch', bulletsRef);
        if (e.key === '2') p2.attack('kick', bulletsRef);
      }
      if (winner && e.code === 'Space') {
        if(p1) { p1.health = 100; p1.x = 100; p1.y = 200; }
        if(p2) { p2.health = 100; p2.x = 660; p2.y = 200; }
        setWinner(null);
        bulletsRef.current = [];
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
      if (gameMode && p1Weapon && p2Weapon) {
          p1Ref.current = new Fighter(100, 200, '#00f6ff', 1, 'AGENT_01', p1Weapon);
          const p2Wep = gameMode === 'PvBot' ? (['sword', 'spear', 'gun'][Math.floor(Math.random()*3)] as WeaponType) : p2Weapon;
          p2Ref.current = new Fighter(660, 200, '#ff0080', -1, gameMode === 'PvBot' ? 'AI_UNIT' : 'AGENT_02', p2Wep);
      }
  }, [gameMode, p1Weapon, p2Weapon]);

  const resetSelection = () => {
      setGameMode(null);
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
                {gameMode === 'PvBot' ? `AI_UNIT (${p2Ref.current?.weapon || 'RND'})` : `AGENT_02 (${p2Weapon})`}
            </span>
            <span>{gameMode === 'PvBot' ? 'AUTONOMOUS' : `ARROWS: MOVE | 1: ${p2Weapon === 'gun' ? 'FIRE' : 'ATTACK'} | 2: KICK`}</span>
        </div>
      </div>
    </div>
  );
}
