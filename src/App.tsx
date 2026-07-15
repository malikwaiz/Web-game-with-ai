/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, Gamepad2, Settings2, Play, Info, 
  Tv, Phone, Layers, Sparkles, Volume2, HelpCircle 
} from 'lucide-react';
import { 
  Character, Vehicle, NPC, Bullet, Particle, Explosion, 
  District, Mission, WeaponType, GameConfig, VehicleType 
} from './types';
import GameCanvas from './components/GameCanvas';
import DevWorkspace from './components/DevWorkspace';
import PhoneUI from './components/PhoneUI';

export default function App() {
  // 1. Core Config Setup
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerSpeed: 3.2,
    physicsTimeStep: 0.016,
    trafficDensity: 8,
    pedestrianDensity: 12,
    copSpawnRate: 1.5,
    vfxMultiplier: 1.0,
    audioVolume: 0.7,
    sfxVolume: 0.8,
    bulletSpeed: 14,
    cheatMode: false
  });

  // 2. Initial Character setup
  const [playerState, setPlayerState] = useState<Character>({
    id: 'player',
    x: 600,
    y: 800, // Spawn near safehouse
    vx: 0,
    vy: 0,
    angle: 0,
    targetAngle: 0,
    health: 100,
    maxHealth: 100,
    armor: 100,
    maxArmor: 100,
    stamina: 100,
    maxStamina: 100,
    speed: 3.2,
    state: 'idle',
    currentWeapon: 'unarmed',
    weapons: {
      unarmed: { type: 'unarmed', name: 'Fists', ammo: 0, maxAmmo: 0, damage: 15, fireRate: 350, reloadTime: 0, recoil: 0, unlocked: true, cost: 0 },
      pistol: { type: 'pistol', name: 'Aegis Pistol', ammo: 18, maxAmmo: 120, damage: 25, fireRate: 350, reloadTime: 1200, recoil: 0.08, unlocked: true, cost: 250 },
      smg: { type: 'smg', name: 'Voltek SMG', ammo: 0, maxAmmo: 240, damage: 18, fireRate: 100, reloadTime: 1800, recoil: 0.15, unlocked: false, cost: 850 },
      shotgun: { type: 'shotgun', name: 'Scatter Shunt', ammo: 0, maxAmmo: 40, damage: 60, fireRate: 850, reloadTime: 2200, recoil: 0.25, unlocked: false, cost: 1200 },
      rocket: { type: 'rocket', name: 'Demolition Cell', ammo: 0, maxAmmo: 6, damage: 150, fireRate: 1800, reloadTime: 3000, recoil: 0.05, unlocked: false, cost: 3500 }
    },
    cash: 500,
    wantedLevel: 0,
    wantedProgress: 0,
    inVehicleId: null
  });

  // 3. Simulated lists setup
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'v1',
      type: 'sports',
      name: 'Volt Spectre',
      x: 1500,
      y: 1100,
      vx: 0,
      vy: 0,
      speed: 0,
      maxSpeed: 11,
      acceleration: 0.28,
      handling: 0.065,
      angle: Math.PI / 4,
      health: 100,
      maxHealth: 100,
      color: '#ef4444',
      hasPlayer: false,
      isPolice: false,
      cost: 1500,
      damageLevel: 0
    },
    {
      id: 'v2',
      type: 'sedan',
      name: 'Titan Sovereign',
      x: 800,
      y: 1600,
      vx: 0,
      vy: 0,
      speed: 0,
      maxSpeed: 7,
      acceleration: 0.15,
      handling: 0.05,
      angle: 0,
      health: 100,
      maxHealth: 100,
      color: '#3b82f6',
      hasPlayer: false,
      isPolice: false,
      cost: 600,
      damageLevel: 0
    }
  ]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // 4. Initial Campaigns Setup
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Aegis Armament Protocol',
      description: 'Your first directive: Head down to Aegis Weapon Store inside coordinates and purchase or lock dynamic ammunition configs.',
      giver: 'Cyber-Broker Vega',
      rewardCash: 1200,
      objectives: [
        { description: 'Navigate coordinates to Aegis Weapon Store zone', type: 'goto', targetX: 1200, targetY: 1500, isCompleted: false }
      ],
      activeObjectiveIndex: 0,
      status: 'available',
      dialogue: ["Operator, the grid has escalated.", "Head to Ammu-Nation inside coordinates to lock down standard armaments immediately."]
    },
    {
      id: 'm2',
      title: 'The Iron Docks Saboteur',
      description: 'Acquire high-speed wheels, make your way past the industrial yards, and secure a vehicle safe.',
      giver: 'Cyber-Broker Vega',
      rewardCash: 2500,
      objectives: [
        { description: 'Navigate to Iron Docks & Industrial Zone', type: 'goto', targetX: 1800, targetY: 600, isCompleted: false },
        { description: 'Steal high-frequency sports car prototype', type: 'steal', isCompleted: false },
        { description: 'Safely pilot back to Sanctuary hideout', type: 'goto', targetX: 600, targetY: 800, isCompleted: false }
      ],
      activeObjectiveIndex: 0,
      status: 'locked',
      dialogue: ["Excellent job on armaments.", "Now we need to capture the high-speed Volt Spectre prototype from the Docks.", "Stay out of sight from harbor patrols!"]
    },
    {
      id: 'm3',
      title: 'SWAT Evasive Protocols',
      description: 'Escalate Wanted level ratings to draw heavy swat responses, then wipe satellite tracking to purge heat!',
      giver: 'Cyber-Broker Vega',
      rewardCash: 5000,
      objectives: [
        { description: 'Evade security forces until Wanted Escapes', type: 'survive', isCompleted: false }
      ],
      activeObjectiveIndex: 0,
      status: 'locked',
      dialogue: ["You are a targeted agent, Operator.", "Trigger local security responses then lose them completely to finalize Rogue encryption."]
    }
  ]);

  const [activeMissionIndex, setActiveMissionIndex] = useState<number | null>(null);
  const [bankBalance, setBankBalance] = useState(1500);
  const [showPhone, setShowPhone] = useState(false);

  // 5. Live Blueprint Signals (Flashes events on node actions)
  const [firingSignal, setFiringSignal] = useState(false);
  const [drivingSignal, setDrivingSignal] = useState(false);
  const [damageSignal, setDamageSignal] = useState(false);

  // State handles
  const handleSelectMission = (id: string) => {
    const idx = missions.findIndex(m => m.id === id);
    if (idx !== -1) {
      setActiveMissionIndex(idx);
      setMissions(prev => prev.map((m, i) => i === idx ? { ...m, status: 'active' } : m));
    }
  };

  const handleDeposit = (amt: number) => {
    if (playerState.cash >= amt) {
      setPlayerState(prev => ({ ...prev, cash: prev.cash - amt }));
      setBankBalance(prev => prev + amt);
    }
  };

  const handleWithdraw = (amt: number) => {
    if (bankBalance >= amt) {
      setBankBalance(prev => prev - amt);
      setPlayerState(prev => ({ ...prev, cash: prev.cash + amt }));
    }
  };

  const handleSpawnVehicle = (type: VehicleType, name: string, cost: number) => {
    if (playerState.cash >= cost) {
      if ((window as any).triggerSpawnVehicle) {
        (window as any).triggerSpawnVehicle(type, name, cost);
      }
    }
  };

  const handleCheatCode = (code: string) => {
    if ((window as any).triggerCheatCode) {
      (window as any).triggerCheatCode(code);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-200 font-sans relative select-none">
      
      {/* Background ambient gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      </div>

      {/* 1. App Top Nav Header */}
      <header className="bg-black/60 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex justify-between items-center shrink-0 z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center rotate-45 mr-3 shrink-0">
            <span className="font-mono font-black text-cyan-400 text-xs select-none -rotate-45">VR</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase flex items-center">
              VELOCITY ROGUE <span className="text-[9px] bg-cyan-950/50 border border-cyan-500/25 text-cyan-400 px-2 py-0.5 rounded-none font-mono font-bold tracking-[0.1em] uppercase ml-3">Sector 04 // Restricted Access</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">District: <span className="text-cyan-400 font-bold">KAIROS PLAZA</span> // UE5 Sandbox Simulator</p>
          </div>
        </div>

        {/* Quick status controls */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Capital Funds</span>
            <span className="text-sm font-mono font-bold text-cyan-400">₴ {playerState.cash.toLocaleString()}</span>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="flex items-center gap-3 bg-black/40 border border-slate-800/80 px-4 py-1.5">
            <div className="text-right">
              <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider">Encrypted Bank</span>
              <div className="text-sm font-mono font-bold text-white leading-tight">₴ {bankBalance.toLocaleString()}</div>
            </div>
          </div>

          <button 
            onClick={() => setShowPhone(!showPhone)}
            className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>OPERATOR PHONE</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout Grid */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 relative z-10">
        
        {/* Left Panel: The Playable Game Viewport */}
        <section className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800 relative bg-slate-950/20">
          
          {/* Subheader info panel */}
          <div className="bg-slate-900/40 border-b border-slate-850 px-4 py-2 flex justify-between items-center text-[10px] text-slate-500 font-mono shrink-0">
            <span className="flex items-center text-indigo-400"><Tv className="w-3.5 h-3.5 mr-1.5" /> LIVE 2D SANDBOX ENGINE</span>
            <span className="hidden sm:inline">Map Size: 4000x4000m | Controls: WASD to drive/walk, Left Click to shoot</span>
          </div>

          {/* Core Interactive Canvas Sandbox Container */}
          <div className="flex-1 min-h-0 relative">
            <GameCanvas 
              gameConfig={gameConfig}
              setGameConfig={setGameConfig}
              playerState={playerState}
              setPlayerState={setPlayerState}
              vehicles={vehicles}
              setVehicles={setVehicles}
              npcs={npcs}
              setNpcs={setNpcs}
              bullets={bullets}
              setBullets={setBullets}
              explosions={explosions}
              setExplosions={setExplosions}
              particles={particles}
              setParticles={setParticles}
              missions={missions}
              setMissions={setMissions}
              activeMissionIndex={activeMissionIndex}
              setActiveMissionIndex={setActiveMissionIndex}
              bankBalance={bankBalance}
              setBankBalance={setBankBalance}
              setFiringSignal={setFiringSignal}
              setDrivingSignal={setDrivingSignal}
              setDamageSignal={setDamageSignal}
            />

            {/* Float Toggle Phone on non-desktop screens */}
            <button 
              onClick={() => setShowPhone(!showPhone)}
              className="lg:hidden absolute bottom-4 right-4 w-12 h-12 bg-cyan-950/90 hover:bg-cyan-900 border-2 border-cyan-500/80 text-cyan-400 flex items-center justify-center shadow-2xl z-20 cursor-pointer active:scale-95 transition-all rotate-45"
            >
              <Phone className="w-5 h-5 -rotate-45" />
            </button>

            {/* FLOATING VIRTUAL SMARTPHONE (MODAL POP OVER ON CANVAS) */}
            {showPhone && (
              <div className="absolute top-1/2 left-1/2 lg:top-auto lg:left-auto lg:bottom-4 lg:right-4 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:translate-y-0 z-30 shadow-2xl animate-[slideUp_0.3s_ease-out_forwards]">
                <PhoneUI 
                  cash={playerState.cash}
                  bankBalance={bankBalance}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                  missions={missions}
                  activeMissionIndex={activeMissionIndex}
                  onSelectMission={handleSelectMission}
                  onSpawnVehicle={handleSpawnVehicle}
                  onCheatCode={handleCheatCode}
                  gameConfig={gameConfig}
                  setGameConfig={setGameConfig}
                  onClose={() => setShowPhone(false)}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Unreal Engine 5 Developer workspace classes & blueprints */}
        <section className="w-full lg:w-[500px] xl:w-[560px] flex flex-col min-h-[300px] lg:min-h-0 shrink-0 bg-slate-900/30">
          <DevWorkspace 
            gameConfig={gameConfig}
            setGameConfig={setGameConfig}
            playerState={playerState.state}
            currentWeapon={playerState.weapons[playerState.currentWeapon].name}
            wantedLevel={playerState.wantedLevel}
            isFiring={firingSignal}
            isDriving={drivingSignal}
            takeDamageSignal={damageSignal}
          />
        </section>
      </main>

      {/* Slide-Up CSS keyframes declared inline for compatibility */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @media (min-width: 1024px) {
          @keyframes slideUp {
            from {
              transform: translateY(100px) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  );
}
