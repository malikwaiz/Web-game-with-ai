/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BlueprintGraphProps {
  playerState: 'idle' | 'walking' | 'running' | 'sprinting' | 'shooting' | 'driving' | 'dead' | 'cover';
  currentWeapon: string;
  wantedLevel: number;
  isFiring: boolean;
  isDriving: boolean;
  takeDamageSignal: boolean;
}

export default function BlueprintGraph({
  playerState,
  currentWeapon,
  wantedLevel,
  isFiring,
  isDriving,
  takeDamageSignal
}: BlueprintGraphProps) {
  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      {/* Blueprint Grid Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between font-mono text-[10px] text-slate-400 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="text-amber-500 font-bold">BP_VelocityPlayerController</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">Event Graph</span>
        </div>
        <div className="flex items-center space-x-3 text-[9px]">
          <span className="flex items-center"><span className="w-2 h-2 bg-rose-500 rounded-full mr-1" /> Exec Flow</span>
          <span className="flex items-center"><span className="w-2 h-2 bg-sky-400 rounded-full mr-1" /> Vector Pin</span>
          <span className="flex items-center"><span className="w-2 h-2 bg-emerald-400 rounded-full mr-1" /> Bool Pin</span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <svg className="w-full h-full absolute inset-0 text-slate-700 pointer-events-none">
          {/* Node Connections */}
          {/* Conn 1: Enhanced Input -> Spawn Bullet */}
          <path 
            d="M 190 85 C 240 85, 230 160, 310 160" 
            fill="none" 
            stroke={isFiring ? '#f43f5e' : '#64748b'} 
            strokeWidth="2.5" 
            strokeDasharray={isFiring ? '5,5' : '0'}
            className={isFiring ? 'animate-[dash_1s_linear_infinite]' : ''}
          />
          {/* Conn 2: Current Weapon Variable -> Spawn Bullet (Data connection) */}
          <path 
            d="M 175 190 C 230 190, 250 175, 310 175" 
            fill="none" 
            stroke="#38bdf8" 
            strokeWidth="2" 
          />
          {/* Conn 3: Take Damage -> Subtract Armor */}
          <path 
            d="M 190 285 C 240 285, 250 340, 310 340" 
            fill="none" 
            stroke={takeDamageSignal ? '#f43f5e' : '#64748b'} 
            strokeWidth="2.5" 
            strokeDasharray={takeDamageSignal ? '5,5' : '0'}
            className={takeDamageSignal ? 'animate-[dash_1s_linear_infinite]' : ''}
          />
          {/* Conn 4: In Vehicle? -> Route input to driving physics */}
          <path 
            d="M 450 160 C 500 160, 480 85, 540 85" 
            fill="none" 
            stroke={isDriving ? '#f59e0b' : '#64748b'} 
            strokeWidth="2.5" 
            strokeDasharray={isDriving ? '5,5' : '0'}
            className={isDriving ? 'animate-[dash_1s_linear_infinite]' : ''}
          />

          <defs>
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -20;
                }
              }
            `}</style>
          </defs>
        </svg>

        {/* Node 1: Enhanced Input Event Firing */}
        <div className={`absolute top-6 left-6 w-[170px] bg-slate-900/90 border rounded shadow-lg transition-all ${isFiring ? 'border-rose-500 shadow-rose-950/20' : 'border-slate-800'}`}>
          <div className="bg-rose-900/50 px-2 py-1 text-[9px] font-mono font-bold text-rose-300 flex justify-between items-center border-b border-rose-800/40">
            <span>Input: Weapon Fire</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isFiring ? 'bg-rose-400 animate-ping' : 'bg-rose-900'}`} />
          </div>
          <div className="p-1.5 font-mono text-[8px] space-y-1 text-slate-300">
            <div className="flex justify-between items-center text-slate-500">
              <span>Trigger: Pressed</span>
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <span>Is Firing State</span>
              <span className="text-emerald-400">BOOL</span>
            </div>
          </div>
        </div>

        {/* Node 2: Current Weapon Reference (Data Node) */}
        <div className="absolute top-36 left-6 w-[150px] bg-slate-900/90 border border-sky-900 rounded shadow-lg">
          <div className="bg-sky-950/80 px-2 py-0.5 text-[8px] font-mono font-bold text-sky-400 border-b border-sky-900/30">
            Get Current Weapon
          </div>
          <div className="p-1.5 font-mono text-[8px] flex justify-between items-center text-slate-300">
            <span className="text-sky-400">Weapon Name</span>
            <span className="text-[7px] font-mono bg-sky-950 border border-sky-900 text-sky-300 px-1 rounded truncate max-w-[60px]">
              {currentWeapon.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Node 3: Spawn Bullet Actor */}
        <div className={`absolute top-24 left-[295px] w-[180px] bg-slate-900/90 border rounded shadow-lg transition-all ${isFiring ? 'border-rose-400 scale-[1.01]' : 'border-slate-800'}`}>
          <div className="bg-sky-900/50 px-2 py-1 text-[9px] font-mono font-bold text-sky-300 flex justify-between items-center border-b border-sky-800/40">
            <span>Spawn Actor From Class</span>
            <span className="text-[7px] text-sky-400">FX SYSTEM</span>
          </div>
          <div className="p-1.5 font-mono text-[8px] space-y-1.5 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              <span className="text-rose-400 font-bold">EXEC OUT</span>
            </div>
            <div className="flex justify-between items-center text-[7px] text-slate-500">
              <span>Class: BP_Bullet_Projectile</span>
              <span>Ref</span>
            </div>
          </div>
        </div>

        {/* Node 4: Take Damage Event */}
        <div className={`absolute top-[210px] left-6 w-[170px] bg-slate-900/90 border rounded shadow-lg transition-all ${takeDamageSignal ? 'border-rose-500 animate-pulse' : 'border-slate-800'}`}>
          <div className="bg-rose-950/70 px-2 py-1 text-[9px] font-mono font-bold text-rose-300 flex justify-between items-center border-b border-rose-900/40">
            <span>Event: Any Damage</span>
            <div className={`w-1.5 h-1.5 rounded-full ${takeDamageSignal ? 'bg-rose-400 animate-ping' : 'bg-rose-900'}`} />
          </div>
          <div className="p-1.5 font-mono text-[8px] space-y-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span>Damage Amount</span>
              <span className="text-amber-500">FLOAT</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Damage Type</span>
              <span className="text-violet-400">OBJECT</span>
            </div>
          </div>
        </div>

        {/* Node 5: Apply Damage To Armor */}
        <div className={`absolute top-[270px] left-[295px] w-[180px] bg-slate-900/90 border rounded shadow-lg transition-all ${takeDamageSignal ? 'border-rose-400' : 'border-slate-800'}`}>
          <div className="bg-purple-900/40 px-2 py-1 text-[9px] font-mono font-bold text-purple-300 border-b border-purple-800/40">
            Calculate Damage Logic
          </div>
          <div className="p-1.5 font-mono text-[8px] space-y-1 text-slate-400">
            <div className="flex justify-between items-center text-slate-300">
              <span>Current Armor Value</span>
              <span>${wantedLevel * 10}</span>
            </div>
            <div className="text-rose-400 text-[7px] font-semibold flex items-center">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1 shrink-0" />
              Clamp (Armor - Damage, 0, Max)
            </div>
          </div>
        </div>

        {/* Node 6: Vehicle Interface Routing */}
        <div className={`absolute top-6 left-[520px] w-[170px] bg-slate-900/90 border rounded shadow-lg transition-all ${isDriving ? 'border-amber-400 scale-[1.01]' : 'border-slate-800'}`}>
          <div className="bg-amber-900/40 px-2 py-1 text-[9px] font-mono font-bold text-amber-300 border-b border-amber-800/40">
            Chaos Vehicle Rig
          </div>
          <div className="p-1.5 font-mono text-[8px] space-y-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span>Input: Gas Throttle</span>
              <span className="text-amber-400">FLOAT</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Gear Ratio</span>
              <span className="text-sky-400">INT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
