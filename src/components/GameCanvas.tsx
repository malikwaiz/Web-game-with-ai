/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Shield, Crosshair, HelpCircle, Navigation, Radio, Coins, AlertOctagon,
  Sparkles, RotateCcw, Volume2, Landmark, ShoppingBag, EyeOff, Wrench
} from 'lucide-react';
import { 
  Character, Vehicle, NPC, Bullet, Particle, Explosion, 
  District, DistrictType, Mission, WeaponType, GameConfig, VehicleType 
} from '../types';
import { SoundManager } from './SoundManager';

interface GameCanvasProps {
  gameConfig: GameConfig;
  setGameConfig: (cfg: GameConfig) => void;
  playerState: Character;
  setPlayerState: React.Dispatch<React.SetStateAction<Character>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  npcs: NPC[];
  setNpcs: React.Dispatch<React.SetStateAction<NPC[]>>;
  bullets: Bullet[];
  setBullets: React.Dispatch<React.SetStateAction<Bullet[]>>;
  explosions: Explosion[];
  setExplosions: React.Dispatch<React.SetStateAction<Explosion[]>>;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  activeMissionIndex: number | null;
  setActiveMissionIndex: (idx: number | null) => void;
  bankBalance: number;
  setBankBalance: React.Dispatch<React.SetStateAction<number>>;
  setFiringSignal: (f: boolean) => void;
  setDrivingSignal: (d: boolean) => void;
  setDamageSignal: (d: boolean) => void;
}

export default function GameCanvas({
  gameConfig,
  setGameConfig,
  playerState,
  setPlayerState,
  vehicles,
  setVehicles,
  npcs,
  setNpcs,
  bullets,
  setBullets,
  explosions,
  setExplosions,
  particles,
  setParticles,
  missions,
  setMissions,
  activeMissionIndex,
  setActiveMissionIndex,
  bankBalance,
  setBankBalance,
  setFiringSignal,
  setDrivingSignal,
  setDamageSignal
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Radio status
  const [activeRadio, setActiveRadio] = useState<'horizon' | 'grid' | 'dusty' | 'none'>('horizon');
  const [hudMessage, setHudMessage] = useState<string | null>("VeloCity Grid Active: Use WASD to Move, E to Enter Cars");
  const [showGarageMenu, setShowGarageMenu] = useState(false);
  const [showGunMenu, setShowGunMenu] = useState(false);
  const [showAtmMenu, setShowAtmMenu] = useState(false);

  // Keyboard mapping
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: 0, y: 0 });
  const isShootingRef = useRef(false);
  const lastShotTimeRef = useRef(0);

  // Map settings
  const mapSize = 4000;

  // Static Buildings data layout
  const staticBuildings = useRef([
    // Downtown Area Skyscrapers
    { x: 300, y: 400, w: 120, h: 160, color: '#1e293b', neonColor: '#06b6d4', district: 'downtown' },
    { x: 600, y: 300, w: 150, h: 200, color: '#1e293b', neonColor: '#ec4899', district: 'downtown' },
    { x: 1000, y: 500, w: 130, h: 250, color: '#1e293b', neonColor: '#a855f7', district: 'downtown' },
    { x: 500, y: 800, w: 180, h: 120, color: '#1e293b', neonColor: '#f59e0b', district: 'downtown' },
    
    // Suburban Houses
    { x: 400, y: 1500, w: 80, h: 80, color: '#27272a', neonColor: '#10b981', district: 'suburbs' },
    { x: 800, y: 1400, w: 90, h: 70, color: '#27272a', neonColor: '#3b82f6', district: 'suburbs' },
    { x: 600, y: 1800, w: 100, h: 85, color: '#27272a', neonColor: '#10b981', district: 'suburbs' },
    
    // Industrial Warehouses
    { x: 1600, y: 500, w: 200, h: 120, color: '#09090b', neonColor: '#f43f5e', district: 'industrial' },
    { x: 2000, y: 600, w: 150, h: 150, color: '#09090b', neonColor: '#ef4444', district: 'industrial' },
    { x: 1800, y: 900, w: 220, h: 100, color: '#09090b', neonColor: '#f43f5e', district: 'industrial' },

    // Desert structures
    { x: 2800, y: 1500, w: 70, h: 70, color: '#451a03', neonColor: '#eab308', district: 'desert' },
    { x: 3100, y: 1800, w: 120, h: 90, color: '#451a03', neonColor: '#f59e0b', district: 'desert' },

    // Military Fortresses
    { x: 3400, y: 3400, w: 220, h: 220, color: '#052e16', neonColor: '#ef4444', district: 'military' }
  ]);

  // Special Interactive Locations
  const locations = {
    garage: { x: 1800, y: 1200, r: 80, name: "Neon Spray Garage", desc: "Vehicle paints and repairs" },
    gunShop: { x: 1200, y: 1500, r: 80, name: "Aegis Weapon Store", desc: "Tactical firearm supplier" },
    safehouse: { x: 600, y: 800, r: 60, name: "Safehouse Sanctuary", desc: "Secure hideout" },
    atm: { x: 1000, y: 1000, r: 40, name: "Crypto ATM Terminal", desc: "Interact to Deposit cash" }
  };

  // Initialize Sound and Radio on mount
  useEffect(() => {
    SoundManager.init();
    SoundManager.selectRadio(activeRadio);
    return () => {
      SoundManager.selectRadio('none');
    };
  }, []);

  const handleRadioChange = (station: 'horizon' | 'grid' | 'dusty' | 'none') => {
    setActiveRadio(station);
    SoundManager.selectRadio(station);
    const names = { horizon: "Horizon Synthwave FM", grid: "The Techno Grid", dusty: "Dusty Road Country", none: "Radio Silent" };
    triggerHudMessage(`Radio Tuned: ${names[station]}`);
  };

  const triggerHudMessage = (msg: string) => {
    setHudMessage(msg);
    setTimeout(() => {
      setHudMessage(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // Handle spawn vehicle from PhoneUI
  useEffect(() => {
    (window as any).triggerSpawnVehicle = (type: VehicleType, name: string, cost: number) => {
      SoundManager.playCash();
      setPlayerState(prev => ({ ...prev, cash: Math.max(0, prev.cash - cost) }));
      
      const angle = playerState.angle;
      const spawnDist = 120;
      const vx = Math.cos(angle) * spawnDist;
      const vy = Math.sin(angle) * spawnDist;
      
      const newV: Vehicle = {
        id: Math.random().toString(),
        type,
        name,
        x: playerState.x + vx,
        y: playerState.y + vy,
        vx: 0,
        vy: 0,
        speed: 0,
        maxSpeed: type === 'supercar' ? 14 : type === 'sports' ? 11 : type === 'motorcycle' ? 12 : 7,
        acceleration: type === 'supercar' ? 0.35 : type === 'sports' ? 0.28 : type === 'motorcycle' ? 0.3 : 0.15,
        handling: type === 'motorcycle' ? 0.12 : type === 'supercar' ? 0.08 : 0.06,
        angle: playerState.angle,
        health: 100,
        maxHealth: 100,
        color: type === 'supercar' ? '#d946ef' : type === 'sports' ? '#ec4899' : '#10b981',
        hasPlayer: false,
        isPolice: false,
        cost,
        damageLevel: 0
      };

      setVehicles(prev => [...prev, newV]);
      triggerHudMessage(`${name} Prototype spawned near coordinates!`);
    };

    (window as any).triggerCheatCode = (code: string) => {
      if (code === 'NEONSOVERDRIVE') {
        SoundManager.playCash();
        setBankBalance(prev => prev + 100000);
        triggerHudMessage("OVERRIDE PROTOCOL: Added $100,000 to bank ledger!");
      } else if (code === 'LETHALPROTOCOL') {
        SoundManager.playCash();
        setPlayerState(prev => {
          const updatedWeapons = { ...prev.weapons };
          Object.keys(updatedWeapons).forEach((key) => {
            updatedWeapons[key as WeaponType].unlocked = true;
            updatedWeapons[key as WeaponType].ammo = updatedWeapons[key as WeaponType].maxAmmo;
          });
          return { ...prev, weapons: updatedWeapons };
        });
        triggerHudMessage("OVERRIDE PROTOCOL: Tactical armaments fully loaded!");
      } else if (code === 'SHADOWOPS') {
        setPlayerState(prev => ({ ...prev, wantedLevel: 0, wantedProgress: 0 }));
        triggerHudMessage("OVERRIDE PROTOCOL: Satellite wanted tracking purged!");
      } else if (code === 'AEGISTANK') {
        (window as any).triggerSpawnVehicle('tank', 'Aegis Demolisher', 0);
      } else {
        triggerHudMessage("UNKNOWN ENCRYPTED CODE");
      }
    };

    return () => {
      delete (window as any).triggerSpawnVehicle;
      delete (window as any).triggerCheatCode;
    };
  }, [playerState]);

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      keysRef.current[e.key] = true; // Match casing if needed
      
      // E: enter/exit car
      if (k === 'e') {
        handleCarInteraction();
      }
      // Q: swap weapons
      if (k === 'q') {
        cycleWeapon();
      }
      // Space override for default browser scroll
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerState, vehicles]);

  const handleCarInteraction = () => {
    if (playerState.inVehicleId) {
      // Exit vehicle
      const currentV = vehicles.find(v => v.id === playerState.inVehicleId);
      if (currentV) {
        setVehicles(prev => prev.map(v => v.id === currentV.id ? { ...v, hasPlayer: false, vx: 0, vy: 0, speed: 0 } : v));
        setPlayerState(prev => ({
          ...prev,
          inVehicleId: null,
          state: 'idle',
          // Offset player position slightly to the side of vehicle
          x: currentV.x + Math.sin(currentV.angle) * 35,
          y: currentV.y - Math.cos(currentV.angle) * 35
        }));
        SoundManager.updateEngine(0, false);
        setDrivingSignal(false);
        triggerHudMessage("Exited vehicle");
      }
    } else {
      // Find nearest vehicle within entry distance
      let nearestV: Vehicle | null = null;
      let minDist = 75;

      vehicles.forEach(v => {
        const dx = v.x - playerState.x;
        const dy = v.y - playerState.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearestV = v;
        }
      });

      if (nearestV && (nearestV as Vehicle).health > 0) {
        const targetV = nearestV as Vehicle;
        setVehicles(prev => prev.map(v => v.id === targetV.id ? { ...v, hasPlayer: true } : v));
        setPlayerState(prev => ({
          ...prev,
          inVehicleId: targetV.id,
          state: 'driving',
          x: targetV.x,
          y: targetV.y
        }));
        setDrivingSignal(true);
        triggerHudMessage(`Entered ${targetV.name}`);
      }
    }
  };

  const cycleWeapon = () => {
    const list: WeaponType[] = ['unarmed', 'pistol', 'smg', 'shotgun', 'rocket'];
    const currentIdx = list.indexOf(playerState.currentWeapon);
    let nextIdx = (currentIdx + 1) % list.length;
    
    // Cycle until find unlocked weapon
    for (let i = 0; i < list.length; i++) {
      const candidate = list[nextIdx];
      if (playerState.weapons[candidate].unlocked) {
        setPlayerState(prev => ({ ...prev, currentWeapon: candidate }));
        triggerHudMessage(`Equipped: ${playerState.weapons[candidate].name.toUpperCase()}`);
        return;
      }
      nextIdx = (nextIdx + 1) % list.length;
    }
  };

  // Canvas Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click to shoot
      isShootingRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isShootingRef.current = false;
    }
  };

  // Live Simulation Core Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      // 1. UPDATE STATES
      updatePhysics();
      updateAI();
      updateMissions();

      // 2. RENDER GRAPHICS
      renderGame(ctx, canvas);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [playerState, vehicles, npcs, bullets, explosions, particles, gameConfig]);

  // Core Physics Integrator
  const updatePhysics = () => {
    const now = Date.now();
    const frameSpeedMult = gameConfig.playerSpeed;

    // A. PLAYER VEHICLE OR CHARACTER MOVEMENT
    if (playerState.inVehicleId) {
      // Vehicle movement mode
      const activeV = vehicles.find(v => v.id === playerState.inVehicleId);
      if (activeV) {
        let speed = activeV.speed;
        let angle = activeV.angle;

        // Drive controls
        const isUp = keysRef.current['w'] || keysRef.current['arrowup'];
        const isDown = keysRef.current['s'] || keysRef.current['arrowdown'];
        const isLeft = keysRef.current['a'] || keysRef.current['arrowleft'];
        const isRight = keysRef.current['d'] || keysRef.current['arrowright'];

        if (isUp) {
          speed = Math.min(speed + activeV.acceleration, activeV.maxSpeed);
        } else if (isDown) {
          speed = Math.max(speed - activeV.acceleration, -activeV.maxSpeed * 0.4);
        } else {
          speed *= 0.96; // Friction decay
        }

        if (Math.abs(speed) > 0.5) {
          const turningDirection = speed > 0 ? 1 : -1;
          if (isLeft) angle -= activeV.handling * turningDirection;
          if (isRight) angle += activeV.handling * turningDirection;
        }

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Update Vehicle position
        let newX = activeV.x + vx;
        let newY = activeV.y + vy;

        // Wall collisions
        const collides = checkBuildingCollision(newX, newY, 24);
        if (collides) {
          speed = -speed * 0.4; // Bounce
          SoundManager.playHit();
          spawnCollisionParticles(activeV.x, activeV.y, '#f59e0b');
          // Deduct health on high impacts
          const crashDmg = Math.abs(activeV.speed) * 3;
          if (crashDmg > 10) {
            damageVehicle(activeV.id, crashDmg);
          }
        } else {
          activeV.x = Math.max(50, Math.min(mapSize - 50, newX));
          activeV.y = Math.max(50, Math.min(mapSize - 50, newY));
        }

        activeV.speed = speed;
        activeV.angle = angle;
        activeV.vx = vx;
        activeV.vy = vy;

        // Sync Player position
        setPlayerState(prev => ({
          ...prev,
          x: activeV.x,
          y: activeV.y,
          vx,
          vy,
          angle
        }));

        // Skid VFX and sound
        const isSkidding = (isLeft || isRight) && Math.abs(speed) > activeV.maxSpeed * 0.55;
        SoundManager.updateSkid(isSkidding ? 0.8 : 0);
        if (isSkidding && Math.random() < 0.4) {
          spawnParticle(activeV.x, activeV.y, '#1e293b', 4, 0.4);
        }

        // Engine sound modulation
        const rpm = Math.abs(speed) / activeV.maxSpeed;
        SoundManager.updateEngine(rpm, true);
      }
    } else {
      // Character Movement Mode
      let dx = 0;
      let dy = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) dy = -1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) dy = 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) dx = -1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) dx = 1;

      // Sprint logic
      const isShift = keysRef.current['shift'];
      const isSprinting = isShift && playerState.stamina > 5 && (dx !== 0 || dy !== 0);
      const currentMoveSpeed = isSprinting ? frameSpeedMult * 1.6 : frameSpeedMult;

      if (dx !== 0 || dy !== 0) {
        // Normalize vector
        const len = Math.sqrt(dx * dx + dy * dy);
        const vx = (dx / len) * currentMoveSpeed;
        const vy = (dy / len) * currentMoveSpeed;

        let newX = playerState.x + vx;
        let newY = playerState.y + vy;

        const collides = checkBuildingCollision(newX, newY, 14);
        if (!collides) {
          setPlayerState(prev => ({
            ...prev,
            x: Math.max(20, Math.min(mapSize - 20, newX)),
            y: Math.max(20, Math.min(mapSize - 20, newY)),
            vx,
            vy,
            stamina: isSprinting ? Math.max(0, prev.stamina - 0.4) : Math.min(prev.maxStamina, prev.stamina + 0.15),
            state: isSprinting ? 'sprinting' : 'walking'
          }));
        } else {
          setPlayerState(prev => ({ ...prev, vx: 0, vy: 0, state: 'idle' }));
        }
      } else {
        setPlayerState(prev => ({
          ...prev,
          vx: 0,
          vy: 0,
          stamina: Math.min(prev.maxStamina, prev.stamina + 0.25),
          state: 'idle'
        }));
      }

      // Rotate player to aim direction
      const canvas = canvasRef.current;
      if (canvas) {
        const pScreenX = canvas.width / 2;
        const pScreenY = canvas.height / 2;
        const lookAngle = Math.atan2(mouseRef.current.y - pScreenY, mouseRef.current.x - pScreenX);
        setPlayerState(prev => ({ ...prev, angle: lookAngle }));
      }
    }

    // B. BULLETS UPDATES & COLLISIONS
    setBullets(prev => prev.map(b => {
      const nextX = b.x + b.vx;
      const nextY = b.y + b.vy;
      const dist = b.distanceTraveled + Math.sqrt(b.vx * b.vx + b.vy * b.vy);

      // Collision with Buildings
      if (checkBuildingCollision(nextX, nextY, 4)) {
        spawnImpactParticles(nextX, nextY, '#f1f5f9');
        return null; // destroy bullet
      }

      // Hit Character Check (if bullet shot by NPC)
      if (b.ownerId !== 'player') {
        const pdx = nextX - playerState.x;
        const pdy = nextY - playerState.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < 15 && !playerState.inVehicleId) {
          damagePlayer(b.damage);
          return null;
        }
      } else {
        // Hit NPCs Check (if bullet shot by player)
        let hitNPCId: string | null = null;
        npcs.forEach(n => {
          if (n.state === 'dead') return;
          const ndx = nextX - n.x;
          const ndy = nextY - n.y;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (ndist < 16) {
            hitNPCId = n.id;
          }
        });

        if (hitNPCId) {
          damageNPC(hitNPCId, b.damage);
          return null;
        }

        // Hit Vehicles Check
        let hitVId: string | null = null;
        vehicles.forEach(v => {
          if (v.id === playerState.inVehicleId) return;
          const vdx = nextX - v.x;
          const vdy = nextY - v.y;
          const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
          if (vdist < 30) {
            hitVId = v.id;
          }
        });

        if (hitVId) {
          damageVehicle(hitVId, b.damage);
          return null;
        }
      }

      if (dist >= b.range) return null;

      return {
        ...b,
        x: nextX,
        y: nextY,
        distanceTraveled: dist
      };
    }).filter(b => b !== null) as Bullet[]);

    // C. WEAPON DISCHARGE FIRING (PLAYER)
    if (isShootingRef.current && !playerState.inVehicleId && playerState.currentWeapon !== 'unarmed') {
      const activeW = playerState.weapons[playerState.currentWeapon];
      if (now - lastShotTimeRef.current >= activeW.fireRate && activeW.ammo > 0) {
        firePlayerWeapon();
        lastShotTimeRef.current = now;
      }
    }

    // D. PARTICLES INTEGRATION
    setParticles(prev => prev.map(p => {
      const nextLife = p.life + 0.016;
      if (nextLife >= p.maxLife) return null;
      return {
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        alpha: 1 - (nextLife / p.maxLife),
        life: nextLife
      };
    }).filter(p => p !== null) as Particle[]);

    // E. EXPLOSIONS INTEGRATION
    setExplosions(prev => prev.map(exp => {
      const nextLife = exp.life + 0.016;
      const radiusRatio = nextLife / 0.45; // 0.45s explosion duration
      const currentRadius = exp.maxRadius * radiusRatio;
      
      if (nextLife >= 0.45) return null;

      // Collateral impact check
      // Check player inside blast radius
      if (!gameConfig.cheatMode) {
        const pdx = exp.x - playerState.x;
        const pdy = exp.y - playerState.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < currentRadius) {
          damagePlayer(exp.damage * (1 - radiusRatio));
        }
      }

      return {
        ...exp,
        radius: currentRadius,
        life: nextLife
      };
    }).filter(e => e !== null) as Explosion[]);

    // F. LOCATION TRIGGERS COLLISION CHECK
    checkLocationTriggers();
  };

  // AI Operations & Pathfinding behaviors
  const updateAI = () => {
    // Spawn civilian pedestrians & police if count low
    if (npcs.length < gameConfig.pedestrianDensity) {
      spawnRandomNPC('civilian');
    }
    
    // Manage Police AI spawning based on active Wanted Level
    if (playerState.wantedLevel > 0 && npcs.filter(n => n.type === 'cop' || n.type === 'swat').length < playerState.wantedLevel * 2 * gameConfig.copSpawnRate) {
      spawnRandomNPC(playerState.wantedLevel >= 4 ? 'swat' : 'cop');
    }

    // Simulate AI decision routines
    setNpcs(prev => prev.map(npc => {
      if (npc.state === 'dead') return npc;

      let vx = npc.vx;
      let vy = npc.vy;
      let angle = npc.angle;
      let state = npc.state;
      let shootCooldown = npc.shootCooldown;

      const dxToPlayer = playerState.x - npc.x;
      const dyToPlayer = playerState.y - npc.y;
      const distToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);

      // A. Civilian Behavior Routines
      if (npc.type === 'civilian') {
        if (playerState.state === 'shooting' && distToPlayer < 250) {
          state = 'panic';
          // Flee in opposite direction
          const fleeAngle = Math.atan2(-dyToPlayer, -dxToPlayer);
          angle = fleeAngle;
          vx = Math.cos(fleeAngle) * npc.speed * 1.5;
          vy = Math.sin(fleeAngle) * npc.speed * 1.5;
        } else {
          // Wander randomly
          if (npc.targetX === null || npc.pathTimer <= 0) {
            const wanderAngle = Math.random() * Math.PI * 2;
            const dist = 150 + Math.random() * 200;
            npc.targetX = npc.x + Math.cos(wanderAngle) * dist;
            npc.targetY = npc.y + Math.sin(wanderAngle) * dist;
            npc.pathTimer = 150 + Math.random() * 200;
            state = 'wander';
          } else {
            const adx = npc.targetX - npc.x;
            const ady = npc.targetY - npc.y;
            const adist = Math.sqrt(adx * adx + ady * ady);
            if (adist < 10) {
              npc.targetX = null;
            } else {
              const wanderAngle = Math.atan2(ady, adx);
              angle = wanderAngle;
              vx = Math.cos(wanderAngle) * npc.speed;
              vy = Math.sin(wanderAngle) * npc.speed;
            }
            npc.pathTimer--;
          }
        }
      } 
      // B. Police and SWAT Behavior Routines
      else if (npc.type === 'cop' || npc.type === 'swat') {
        if (playerState.wantedLevel > 0) {
          state = 'chase';
          angle = Math.atan2(dyToPlayer, dxToPlayer);
          
          if (distToPlayer > 180) {
            // Chase down player
            vx = Math.cos(angle) * npc.speed * 1.4;
            vy = Math.sin(angle) * npc.speed * 1.4;
          } else if (distToPlayer < 90) {
            // Keep tactical shootout distance
            vx = -Math.cos(angle) * npc.speed * 0.8;
            vy = -Math.sin(angle) * npc.speed * 0.8;
          } else {
            // Circle flanking
            vx = Math.cos(angle + Math.PI / 2) * npc.speed * 0.6;
            vy = Math.sin(angle + Math.PI / 2) * npc.speed * 0.6;
          }

          // Shoot routine
          if (shootCooldown <= 0) {
            fireNPCWeapon(npc);
            shootCooldown = npc.type === 'swat' ? 40 : 75; // Fire rates
          } else {
            shootCooldown--;
          }
        } else {
          // Patrol quietly
          state = 'wander';
          vx *= 0.9;
          vy *= 0.9;
        }
      }

      // Check Building Collisions for NPCs
      let nextX = npc.x + vx;
      let nextY = npc.y + vy;
      if (checkBuildingCollision(nextX, nextY, 14)) {
        vx = -vx * 0.5;
        vy = -vy * 0.5;
        npc.targetX = null; // force path recalculate
      } else {
        npc.x = Math.max(20, Math.min(mapSize - 20, nextX));
        npc.y = Math.max(20, Math.min(mapSize - 20, nextY));
      }

      return {
        ...npc,
        vx,
        vy,
        angle,
        state,
        shootCooldown
      };
    }));

    // Trigger siren sound effect if cop chasing
    const isSirenChase = playerState.wantedLevel > 0 && npcs.some(n => (n.type === 'cop' || n.type === 'swat') && n.state === 'chase');
    SoundManager.updateSiren(isSirenChase);
  };

  // Check interactive location overlap
  const checkLocationTriggers = () => {
    let nearAtm = false;
    let nearGun = false;
    let nearGarage = false;

    // Check ATM
    const dxAtm = playerState.x - locations.atm.x;
    const dyAtm = playerState.y - locations.atm.y;
    if (Math.sqrt(dxAtm * dxAtm + dyAtm * dyAtm) < locations.atm.r) {
      nearAtm = true;
    }

    // Check Weapon Store
    const dxGun = playerState.x - locations.gunShop.x;
    const dyGun = playerState.y - locations.gunShop.y;
    if (Math.sqrt(dxGun * dxGun + dyGun * dyGun) < locations.gunShop.r) {
      nearGun = true;
    }

    // Check Garage
    const dxGar = playerState.x - locations.garage.x;
    const dyGar = playerState.y - locations.garage.y;
    if (Math.sqrt(dxGar * dxGar + dyGar * dyGar) < locations.garage.r) {
      nearGarage = true;
    }

    // Safehouse health regen
    const dxSafe = playerState.x - locations.safehouse.x;
    const dySafe = playerState.y - locations.safehouse.y;
    if (Math.sqrt(dxSafe * dxSafe + dySafe * dySafe) < locations.safehouse.r) {
      if (playerState.health < playerState.maxHealth && Math.random() < 0.1) {
        setPlayerState(prev => ({ 
          ...prev, 
          health: Math.min(prev.maxHealth, prev.health + 1),
          armor: Math.min(prev.maxArmor, prev.armor + 1)
        }));
      }
    }

    if (nearAtm !== showAtmMenu) setShowAtmMenu(nearAtm);
    if (nearGun !== showGunMenu) setShowGunMenu(nearGun);
    if (nearGarage !== showGarageMenu) setShowGarageMenu(nearGarage);
  };

  const checkBuildingCollision = (x: number, y: number, radius: number): boolean => {
    for (let i = 0; i < staticBuildings.current.length; i++) {
      const b = staticBuildings.current[i];
      // AABB overlap check with padding
      if (x + radius > b.x && x - radius < b.x + b.w &&
          y + radius > b.y && y - radius < b.y + b.h) {
        return true;
      }
    }
    return false;
  };

  // Spawning Methods
  const spawnRandomNPC = (type: 'civilian' | 'cop' | 'swat') => {
    // Spawn off-camera but close
    const offsetAngle = Math.random() * Math.PI * 2;
    const spawnDist = 400 + Math.random() * 200;
    const x = playerState.x + Math.cos(offsetAngle) * spawnDist;
    const y = playerState.y + Math.sin(offsetAngle) * spawnDist;

    // Verify spawn coordinates inside map boundaries and not inside building
    if (x < 100 || x > mapSize - 100 || y < 100 || y > mapSize - 100 || checkBuildingCollision(x, y, 20)) {
      return;
    }

    const speed = type === 'swat' ? 2.5 : type === 'cop' ? 2.2 : 1.2;
    const maxHealth = type === 'swat' ? 120 : type === 'cop' ? 80 : 40;

    const newNPC: NPC = {
      id: Math.random().toString(),
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: Math.random() * Math.PI * 2,
      speed,
      health: maxHealth,
      maxHealth,
      state: 'wander',
      weapon: type === 'swat' ? 'smg' : type === 'cop' ? 'pistol' : 'unarmed',
      targetX: null,
      targetY: null,
      shootCooldown: 0,
      cooldownTimer: 0,
      pathTimer: 0
    };

    setNpcs(prev => [...prev, newNPC]);
  };

  const firePlayerWeapon = () => {
    setFiringSignal(true);
    setTimeout(() => setFiringSignal(false), 80);

    const activeW = playerState.weapons[playerState.currentWeapon];
    
    // Deduct ammo
    setPlayerState(prev => {
      const updatedWeapons = { ...prev.weapons };
      updatedWeapons[prev.currentWeapon].ammo--;
      return { ...prev, weapons: updatedWeapons };
    });

    if (playerState.currentWeapon !== 'unarmed') {
      SoundManager.playShoot(playerState.currentWeapon);
    }

    // Bullet direction vector with custom recoil spread
    const spread = (Math.random() - 0.5) * activeW.recoil;
    const angle = playerState.angle + spread;
    const bulletSpeedVal = gameConfig.bulletSpeed;

    const newB: Bullet = {
      id: Math.random().toString(),
      x: playerState.x + Math.cos(playerState.angle) * 20,
      y: playerState.y + Math.sin(playerState.angle) * 20,
      vx: Math.cos(angle) * bulletSpeedVal,
      vy: Math.sin(angle) * bulletSpeedVal,
      damage: activeW.damage,
      ownerId: 'player',
      type: playerState.currentWeapon,
      range: playerState.currentWeapon === 'shotgun' ? 220 : 550,
      distanceTraveled: 0
    };

    setBullets(prev => [...prev, newB]);

    // Accumulate Wanted progress if shooting in downtown/suburbs
    if (playerState.wantedLevel === 0 && Math.random() < 0.3) {
      increaseWantedLevel();
    }
  };

  const fireNPCWeapon = (npc: NPC) => {
    if (npc.weapon !== 'unarmed') {
      SoundManager.playShoot(npc.weapon);
    }
    const angle = npc.angle + (Math.random() - 0.5) * 0.15; // AI spread
    
    const newB: Bullet = {
      id: Math.random().toString(),
      x: npc.x + Math.cos(npc.angle) * 15,
      y: npc.y + Math.sin(npc.angle) * 15,
      vx: Math.cos(angle) * 10,
      vy: Math.sin(angle) * 10,
      damage: npc.type === 'swat' ? 12 : 6,
      ownerId: npc.id,
      type: npc.weapon,
      range: 400,
      distanceTraveled: 0
    };

    setBullets(prev => [...prev, newB]);
  };

  const damagePlayer = (amt: number) => {
    if (gameConfig.cheatMode) return;
    
    SoundManager.playHit();
    setDamageSignal(true);
    setTimeout(() => setDamageSignal(false), 150);

    setPlayerState(prev => {
      // Split damage to Armor first
      let currentArmor = prev.armor;
      let currentHealth = prev.health;

      if (currentArmor > 0) {
        currentArmor = Math.max(0, currentArmor - amt * 0.7);
        currentHealth = Math.max(0, currentHealth - amt * 0.3);
      } else {
        currentHealth = Math.max(0, currentHealth - amt);
      }

      if (currentHealth <= 0) {
        handlePlayerDeath();
      }

      return {
        ...prev,
        health: currentHealth,
        armor: currentArmor
      };
    });
  };

  const handlePlayerDeath = () => {
    SoundManager.playExplosion();
    triggerHudMessage("FATAL DESYNC: Respawning at Secure Safehouse. Wallet assets lost!");
    
    setPlayerState(prev => ({
      ...prev,
      health: prev.maxHealth,
      armor: 0,
      cash: 0, // Loose wallet cash on death
      wantedLevel: 0,
      wantedProgress: 0,
      inVehicleId: null,
      x: locations.safehouse.x,
      y: locations.safehouse.y,
      vx: 0,
      vy: 0,
      state: 'idle'
    }));
    
    setDrivingSignal(false);
    setNpcs([]); // clear hostile cops
  };

  const damageNPC = (id: string, amt: number) => {
    setNpcs(prev => prev.map(n => {
      if (n.id !== id) return n;
      const nextH = Math.max(0, n.health - amt);
      
      if (nextH <= 0) {
        spawnCollisionParticles(n.x, n.y, '#991b1b'); // Blood-like particle burst
        SoundManager.playHit();
        
        // Reward cash for neutralizing target
        const cashReward = n.type === 'swat' ? 150 : n.type === 'cop' ? 80 : 20;
        setPlayerState(p => ({ ...p, cash: p.cash + cashReward }));
        
        // Escalation towards Wanted levels
        increaseWantedLevel();

        return null; // neutralised
      }
      return { ...n, health: nextH, state: 'chase' as any };
    }).filter(n => n !== null) as NPC[]);
  };

  const damageVehicle = (id: string, amt: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== id) return v;
      const nextH = Math.max(0, v.health - amt);
      
      if (nextH <= 0) {
        // Trigger Explosion!
        triggerExplosion(v.x, v.y);
        return null; // Destroyed
      }
      return { ...v, health: nextH };
    }).filter(v => v !== null) as Vehicle[]);
  };

  const triggerExplosion = (x: number, y: number) => {
    SoundManager.playExplosion();
    const expId = Math.random().toString();
    const newExp: Explosion = {
      id: expId,
      x,
      y,
      radius: 10,
      maxRadius: 85,
      life: 0,
      damage: 100
    };

    setExplosions(prev => [...prev, newExp]);

    // Spawn massive fiery particles
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      spawnParticle(
        x, y, 
        ['#ef4444', '#f97316', '#fef08a', '#334155'][Math.floor(Math.random() * 4)], 
        4 + Math.random() * 6, 
        0.5 + Math.random() * 0.5,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  };

  const increaseWantedLevel = () => {
    setPlayerState(prev => {
      if (prev.wantedLevel >= 5) return prev;
      
      const nextProgress = prev.wantedProgress + 25;
      if (nextProgress >= 100) {
        triggerHudMessage(`WANTED LEVEL ESCALATED: Level ${prev.wantedLevel + 1}!`);
        return {
          ...prev,
          wantedLevel: prev.wantedLevel + 1,
          wantedProgress: 0
        };
      }
      return {
        ...prev,
        wantedProgress: nextProgress
      };
    });
  };

  // Particle spawning mechanics
  const spawnParticle = (
    x: number, y: number, color: string, size = 4, life = 0.5, 
    vx = (Math.random() - 0.5) * 3, vy = (Math.random() - 0.5) * 3
  ) => {
    const newP: Particle = {
      x,
      y,
      vx,
      vy,
      color,
      size,
      alpha: 1,
      life: 0,
      maxLife: life
    };
    setParticles(prev => [...prev, newP]);
  };

  const spawnCollisionParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      spawnParticle(x, y, color, 3 + Math.random() * 3, 0.35 + Math.random() * 0.2);
    }
  };

  const spawnImpactParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 4; i++) {
      spawnParticle(x, y, color, 2, 0.2);
    }
  };

  // Missions & Heist Progression engine
  const updateMissions = () => {
    if (activeMissionIndex === null) return;
    const activeM = missions[activeMissionIndex];
    const activeObjective = activeM.objectives[activeM.activeObjectiveIndex];

    if (!activeObjective || activeObjective.isCompleted) return;

    let success = false;

    // Check conditions based on type
    if (activeObjective.type === 'goto') {
      const dx = playerState.x - (activeObjective.targetX || 0);
      const dy = playerState.y - (activeObjective.targetY || 0);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 50) {
        success = true;
      }
    } 
    else if (activeObjective.type === 'survive') {
      // Survive active wanted level
      if (playerState.wantedLevel === 0) {
        success = true;
      }
    }
    else if (activeObjective.type === 'steal') {
      // Get inside a vehicle
      if (playerState.inVehicleId) {
        success = true;
      }
    }

    if (success) {
      // Update objective state
      const updatedMissions = [...missions];
      const targetM = updatedMissions[activeMissionIndex];
      targetM.objectives[targetM.activeObjectiveIndex].isCompleted = true;
      
      const nextObjIdx = targetM.activeObjectiveIndex + 1;
      if (nextObjIdx >= targetM.objectives.length) {
        // MISSION COMPLETION SUCCESS!
        targetM.status = 'completed';
        setPlayerState(prev => ({ ...prev, cash: prev.cash + targetM.rewardCash }));
        SoundManager.playCash();
        triggerHudMessage(`CONTRACT COMPLETE: ${targetM.title} (+$${targetM.rewardCash})`);
        
        // Unlock next mission in chain
        const nextMissionIdx = activeMissionIndex + 1;
        if (nextMissionIdx < updatedMissions.length) {
          updatedMissions[nextMissionIdx].status = 'available';
        }
        
        setActiveMissionIndex(null);
      } else {
        targetM.activeObjectiveIndex = nextObjIdx;
        triggerHudMessage(`OBJECTIVE UPDATE: ${targetM.objectives[nextObjIdx].description}`);
      }

      setMissions(updatedMissions);
    }
  };

  // CORE RENDER METHOD (CANVAS DRAW)
  const renderGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const width = canvas.width;
    const height = canvas.height;

    // A. Viewport center coordinates offset (Camera centers on player)
    const viewOffsetX = width / 2 - playerState.x;
    const viewOffsetY = height / 2 - playerState.y;

    // Clear and draw grid map backdrop
    ctx.fillStyle = '#090d16'; // deep dark blue-grey grid
    ctx.fillRect(0, 0, width, height);

    // Draw Grid borders
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1;
    for (let x = Math.max(0, playerState.x - width); x < Math.min(mapSize, playerState.x + width); x += 100) {
      ctx.beginPath();
      ctx.moveTo(x + viewOffsetX, 0);
      ctx.lineTo(x + viewOffsetX, height);
      ctx.stroke();
    }
    for (let y = Math.max(0, playerState.y - height); y < Math.min(mapSize, playerState.y + height); y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y + viewOffsetY);
      ctx.lineTo(width, y + viewOffsetY);
      ctx.stroke();
    }

    // Render sand / desert boundaries
    ctx.save();
    ctx.fillStyle = '#451a03'; // deep desert yellow/brown
    ctx.globalAlpha = 0.25;
    ctx.fillRect(2500 + viewOffsetX, 1200 + viewOffsetY, 1500, 2800);
    ctx.restore();

    // Render secure military hazard zone boundary
    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.rect(3200 + viewOffsetX, 3200 + viewOffsetY, 800, 800);
    ctx.stroke();
    ctx.restore();

    // DRAW ROADS
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 80;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Highway line
    ctx.beginPath();
    ctx.moveTo(100 + viewOffsetX, 1000 + viewOffsetY);
    ctx.lineTo(3900 + viewOffsetX, 1000 + viewOffsetY);
    ctx.moveTo(1500 + viewOffsetX, 100 + viewOffsetY);
    ctx.lineTo(1500 + viewOffsetX, 3900 + viewOffsetY);
    ctx.stroke();
    
    // Draw center yellow dashes
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 20]);
    ctx.beginPath();
    ctx.moveTo(100 + viewOffsetX, 1000 + viewOffsetY);
    ctx.lineTo(3900 + viewOffsetX, 1000 + viewOffsetY);
    ctx.moveTo(1500 + viewOffsetX, 100 + viewOffsetY);
    ctx.lineTo(1500 + viewOffsetX, 3900 + viewOffsetY);
    ctx.stroke();
    ctx.restore();

    // DRAW BUILDINGS
    staticBuildings.current.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.strokeStyle = b.neonColor;
      ctx.lineWidth = 3;

      // Draw shadow block
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(b.x + viewOffsetX + 8, b.y + viewOffsetY + 8, b.w, b.h);
      ctx.restore();

      ctx.fillRect(b.x + viewOffsetX, b.y + viewOffsetY, b.w, b.h);
      ctx.strokeRect(b.x + viewOffsetX, b.y + viewOffsetY, b.w, b.h);

      // Render inner neon windows grid lines
      ctx.save();
      ctx.strokeStyle = b.neonColor;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      for (let wx = b.x + 15; wx < b.x + b.w - 10; wx += 25) {
        ctx.moveTo(wx + viewOffsetX, b.y + viewOffsetY + 10);
        ctx.lineTo(wx + viewOffsetX, b.y + viewOffsetY + b.h - 10);
      }
      ctx.stroke();
      ctx.restore();
    });

    // DRAW SPECIAL LOCATIONS (AMMU-NATION, ATMS, GARAGES)
    Object.entries(locations).forEach(([key, loc]) => {
      ctx.save();
      ctx.strokeStyle = key === 'garage' ? '#ec4899' : key === 'gunShop' ? '#d946ef' : key === 'safehouse' ? '#10b981' : '#34d399';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      
      ctx.beginPath();
      ctx.arc(loc.x + viewOffsetX, loc.y + viewOffsetY, loc.r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner icon draw representer
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(loc.name.toUpperCase(), loc.x + viewOffsetX, loc.y + viewOffsetY - 5);
      ctx.restore();
    });

    // DRAW ACTIVE MISSION OBJECTIVE INDICATOR (CHEVRON WAYPOINT)
    if (activeMissionIndex !== null) {
      const activeObj = missions[activeMissionIndex].objectives[missions[activeMissionIndex].activeObjectiveIndex];
      if (activeObj && activeObj.targetX && activeObj.targetY) {
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(activeObj.targetX + viewOffsetX, activeObj.targetY + viewOffsetY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText("GPS", activeObj.targetX + viewOffsetX, activeObj.targetY + viewOffsetY + 3);
        ctx.restore();
      }
    }

    // DRAW VEHICLES
    vehicles.forEach(v => {
      ctx.save();
      ctx.translate(v.x + viewOffsetX, v.y + viewOffsetY);
      ctx.rotate(v.angle);

      // Chassis shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-22, -12, 50, 26);

      // Main chassis
      ctx.fillStyle = v.color;
      ctx.fillRect(-20, -10, 44, 20);

      // Windshield glass highlights
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -8, 12, 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(8, -8, 4, 16);

      // Wheels
      ctx.fillStyle = '#020617';
      ctx.fillRect(-14, -12, 8, 3);
      ctx.fillRect(10, -12, 8, 3);
      ctx.fillRect(-14, 9, 8, 3);
      ctx.fillRect(10, 9, 8, 3);

      ctx.restore();
    });

    // DRAW CIVILIAN AND COP NPCS
    npcs.forEach(n => {
      ctx.save();
      ctx.translate(n.x + viewOffsetX, n.y + viewOffsetY);
      ctx.rotate(n.angle);

      // Draw character body circle
      ctx.fillStyle = n.type === 'cop' ? '#1e3a8a' : n.type === 'swat' ? '#09090b' : '#3f3f46';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw shoulder arm points pointing to weapon direction
      ctx.fillStyle = '#e4e4e7';
      ctx.beginPath();
      ctx.arc(4, -6, 3, 0, Math.PI * 2);
      ctx.arc(4, 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // Weapon sprite line representer
      if (n.weapon !== 'unarmed') {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.lineTo(15, 4);
        ctx.stroke();
      }

      ctx.restore();
    });

    // DRAW BULLETS
    bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.type === 'rocket' ? '#f59e0b' : '#fef08a';
      ctx.shadowBlur = b.type === 'rocket' ? 10 : 3;
      ctx.shadowColor = ctx.fillStyle;

      ctx.beginPath();
      ctx.arc(b.x + viewOffsetX, b.y + viewOffsetY, b.type === 'rocket' ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // DRAW PARTICLES
    particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x + viewOffsetX, p.y + viewOffsetY, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // DRAW EXPLOSIONS
    explosions.forEach(exp => {
      ctx.save();
      const grad = ctx.createRadialGradient(
        exp.x + viewOffsetX, exp.y + viewOffsetY, exp.radius * 0.1,
        exp.x + viewOffsetX, exp.y + viewOffsetY, exp.radius
      );
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.3, '#f97316');
      grad.addColorStop(0.8, '#ef4444');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(exp.x + viewOffsetX, exp.y + viewOffsetY, exp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // DRAW PLAYER MODEL (ONLY IF NOT IN VEHICLE)
    if (!playerState.inVehicleId) {
      ctx.save();
      ctx.translate(playerState.x + viewOffsetX, playerState.y + viewOffsetY);
      ctx.rotate(playerState.angle);

      // Shadow block
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.arc(1, 1, 11, 0, Math.PI * 2);
      ctx.fill();

      // Main head body circle
      ctx.fillStyle = '#6366f1'; // futuristic neon-indigo operator suit
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Inner tactical helmet visor highlights
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(6, 0, 4, -Math.PI / 3, Math.PI / 3);
      ctx.fill();

      // Arms drawing holding weapons
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(5, -6, 3, 0, Math.PI * 2);
      ctx.arc(8, 5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw equipped weapon line
      if (playerState.currentWeapon !== 'unarmed') {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = playerState.currentWeapon === 'rocket' ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(2, 5);
        ctx.lineTo(20, 5);
        ctx.stroke();

        // Muzzle fire flash glow
        if (playerState.state === 'shooting' && Math.random() < 0.4) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(23, 5, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  };

  // Upgrades & Interactive Store operations
  const buyWeapon = (type: WeaponType, cost: number) => {
    if (playerState.cash >= cost) {
      SoundManager.playCash();
      setPlayerState(prev => {
        const updatedW = { ...prev.weapons };
        updatedW[type].unlocked = true;
        updatedW[type].ammo = updatedW[type].maxAmmo;
        return {
          ...prev,
          cash: prev.cash - cost,
          weapons: updatedW
        };
      });
      triggerHudMessage(`Weapon unlocked: ${playerState.weapons[type].name}`);
    } else {
      triggerHudMessage("INSUFFICIENT FUNDS ON PERSONS WALLET");
    }
  };

  const buyAmmo = (type: WeaponType, cost: number) => {
    if (playerState.cash >= cost) {
      SoundManager.playCash();
      setPlayerState(prev => {
        const updatedW = { ...prev.weapons };
        updatedW[type].ammo = Math.min(updatedW[type].maxAmmo, updatedW[type].ammo + Math.round(updatedW[type].maxAmmo * 0.5));
        return {
          ...prev,
          cash: prev.cash - cost,
          weapons: updatedW
        };
      });
      triggerHudMessage("Ammunition Refilled!");
    } else {
      triggerHudMessage("INSUFFICIENT FUNDS");
    }
  };

  const repairActiveVehicle = () => {
    if (playerState.inVehicleId) {
      const activeV = vehicles.find(v => v.id === playerState.inVehicleId);
      if (activeV && playerState.cash >= 150) {
        SoundManager.playCash();
        setPlayerState(prev => ({ ...prev, cash: prev.cash - 150 }));
        setVehicles(prev => prev.map(v => v.id === activeV.id ? { ...v, health: 100 } : v));
        triggerHudMessage("Vehicle armor integrity fully restored at garage!");
      } else {
        triggerHudMessage("Requires $150 cash inside active vehicle");
      }
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      
      {/* 2D Canvas Renderer */}
      <canvas 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        width={700}
        height={450}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Floating HUD Panel overlays */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-wrap justify-between items-start gap-3 z-10">
        
        {/* Stat Meters */}
        <div className="bg-black/80 border-l-4 border-cyan-500 border border-slate-800/80 p-3 px-4 flex items-center space-x-4 shadow-2xl backdrop-blur-md pointer-events-auto rounded-none">
          {/* Health & Armor & Stamina */}
          <div className="space-y-1 w-[150px]">
            <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase tracking-wider text-cyan-400">
              <span>INTEGRITY HP</span>
              <span>{Math.round(playerState.health)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 border border-slate-900 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full transition-all" style={{ width: `${playerState.health}%` }} />
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase tracking-wider text-sky-400 pt-0.5">
              <span>AEGIS ARMOR</span>
              <span>{Math.round(playerState.armor)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 border border-slate-900 overflow-hidden">
              <div className="bg-sky-400 h-full transition-all" style={{ width: `${playerState.armor}%` }} />
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase tracking-wider text-yellow-500 pt-0.5">
              <span>STAMINA CORE</span>
              <span>{Math.round(playerState.stamina)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 border border-slate-900 overflow-hidden">
              <div className="bg-yellow-500 h-full transition-all" style={{ width: `${playerState.stamina}%` }} />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-[1px] h-14 bg-slate-800" />

          {/* Ammo & Wallet stats */}
          <div>
            <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-mono font-bold">Weapon Loadout</span>
            <div className="text-xs font-bold font-mono text-white uppercase mt-0.5 tracking-tight">
              {playerState.weapons[playerState.currentWeapon].name}
            </div>
            {playerState.currentWeapon !== 'unarmed' && (
              <div className="text-[9px] font-mono text-cyan-400 mt-0.5 font-bold">
                AMMO: {playerState.weapons[playerState.currentWeapon].ammo} <span className="text-slate-500">/ {playerState.weapons[playerState.currentWeapon].maxAmmo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Wanted Level flashing stars */}
        <div className="flex flex-col items-end space-y-1.5">
          <div className="bg-black/80 border border-slate-800/80 p-2.5 px-4 flex items-center space-x-1.5 shadow-2xl backdrop-blur-md pointer-events-auto rounded-none">
            <span className="text-[9px] font-mono font-black text-slate-400 mr-2 uppercase tracking-[0.15em]">SATELLITE TRACING</span>
            {[1, 2, 3, 4, 5].map((starVal) => {
              const active = playerState.wantedLevel >= starVal;
              return (
                <div 
                  key={starVal}
                  className={`w-3.5 h-3.5 flex items-center justify-center font-bold border text-[9px] transition-all duration-300 rounded-none ${
                    active 
                      ? 'bg-yellow-500 border-yellow-400 text-slate-950 animate-pulse rotate-45' 
                      : 'bg-slate-950/50 border-slate-900 text-slate-750'
                  }`}
                >
                  <span className={active ? '-rotate-45 font-black' : ''}>★</span>
                </div>
              );
            })}
          </div>

          {/* Quick instructions indicator */}
          <div className="bg-black/80 border border-slate-800/80 px-3 py-1.5 text-[8.5px] font-mono text-cyan-400 shadow-lg tracking-wider rounded-none">
            Q - Swap Weapon | E - Vehicle | WASD - Move
          </div>
        </div>
      </div>

      {/* Floating HUD Status Message toast */}
      {hudMessage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 border border-slate-800/80 px-5 py-2.5 shadow-2xl flex items-center space-x-2.5 z-20 font-sans backdrop-blur-md text-xs font-semibold text-slate-200 rounded-none">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="uppercase font-mono tracking-wider">{hudMessage}</span>
        </div>
      )}

      {/* INTERACTIVE HUD RADIO TUNER PANEL (BOTTOM OVERLAYS) */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 z-10">
        <div className="bg-black/80 border border-slate-800/80 p-2.5 px-3 flex items-center space-x-2 shadow-2xl backdrop-blur-md pointer-events-auto rounded-none">
          <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.2em] mr-1">RADIO</span>
          <div className="flex space-x-1">
            {(['horizon', 'grid', 'dusty', 'none'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => handleRadioChange(ch)}
                className={`px-2.5 py-1 text-[8.5px] font-mono uppercase font-black tracking-wider cursor-pointer border transition-all rounded-none ${
                  activeRadio === ch 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-950/60 border-slate-900/60 text-slate-500 hover:text-slate-350 hover:border-slate-800'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INTERACTIVE STORE MODAL MENUS (AMMU-NATION, GARAGE, BANK) */}
      
      {/* A. Gun store shop menu */}
      {showGunMenu && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-black/90 border border-slate-800/80 p-6 shadow-2xl z-30 font-sans backdrop-blur-xl rounded-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-cyan-400" /> Tactical Armaments
            </h3>
            <span className="text-xs font-mono font-bold text-cyan-400">₴ {playerState.cash}</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {(['pistol', 'smg', 'shotgun', 'rocket'] as WeaponType[]).map((type) => {
              const weapon = playerState.weapons[type];
              return (
                <div key={type} className="p-2.5 bg-slate-950/80 border border-slate-850 flex justify-between items-center rounded-none">
                  <div>
                    <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide">{weapon.name}</div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">Dmg: {weapon.damage} | Clip: {weapon.ammo}/{weapon.maxAmmo}</div>
                  </div>

                  {!weapon.unlocked ? (
                    <button
                      onClick={() => buyWeapon(type, weapon.cost)}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-none text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Lock ₴ {weapon.cost}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyAmmo(type, Math.round(weapon.cost * 0.2))}
                      disabled={weapon.ammo >= weapon.maxAmmo}
                      className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-transparent rounded-none text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      +Ammo ₴ {Math.round(weapon.cost * 0.2)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* B. Repair/Spray garage menu */}
      {showGarageMenu && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-black/90 border border-slate-800/80 p-6 shadow-2xl z-30 font-sans backdrop-blur-xl rounded-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center">
              <Wrench className="w-4 h-4 mr-2 text-yellow-500" /> Spray & Repairs Garage
            </h3>
            <span className="text-xs font-mono font-bold text-yellow-500">₴ {playerState.cash}</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal mb-4 font-mono">
            PULLED INSIDE WITH AN ACTIVE DAMAGED VEHICLE? RESTORE VEHICLE PLATING OR CUSTOMIZE PERFORMANCE CORES INSTANTLY.
          </p>

          <button
            onClick={repairActiveVehicle}
            disabled={!playerState.inVehicleId}
            className="w-full py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 disabled:bg-slate-950 disabled:text-slate-600 disabled:border-transparent rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Full Plating Repair (₴ 150)
          </button>
        </div>
      )}

      {/* C. ATM transaction deposit modal */}
      {showAtmMenu && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-black/90 border border-slate-800/80 p-6 shadow-2xl z-30 font-sans backdrop-blur-xl rounded-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-cyan-400" /> ATM Vault Terminal
            </h3>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal mb-4 font-mono">
            SECURE YOUR HARD-EARNED WALLET CASH INTO YOUR ENCRYPTED BANK VAULT TO PREVENT ASSET FORFEITURE ON GETTING BUSTED!
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (playerState.cash >= 100) {
                  SoundManager.playCash();
                  setPlayerState(prev => ({ ...prev, cash: prev.cash - 100 }));
                  setBankBalance(prev => prev + 100);
                  triggerHudMessage("Deposited ₴ 100 safely!");
                }
              }}
              className="p-3 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/30 text-left font-bold text-cyan-400 text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer rounded-none"
            >
              Deposit ₴ 100
            </button>
            <button
              onClick={() => {
                if (playerState.cash > 0) {
                  SoundManager.playCash();
                  const amt = playerState.cash;
                  setPlayerState(prev => ({ ...prev, cash: 0 }));
                  setBankBalance(prev => prev + amt);
                  triggerHudMessage(`Deposited all ₴ ${amt} safely!`);
                }
              }}
              className="p-3 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/30 text-left font-bold text-yellow-400 text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer rounded-none"
            >
              Deposit All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
