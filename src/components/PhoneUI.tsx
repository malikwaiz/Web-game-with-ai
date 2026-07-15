/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, Briefcase, CreditCard, Car, MapPin, Settings as SettingsIcon, 
  ChevronLeft, Signal, Battery, ArrowUpRight, ArrowDownLeft, Send, CheckCircle2,
  Lock, Play, ShieldAlert, Sparkles, Volume2, Gamepad2
} from 'lucide-react';
import { Mission, Vehicle, VehicleType, WeaponType } from '../types';

interface PhoneUIProps {
  cash: number;
  bankBalance: number;
  onDeposit: (amt: number) => void;
  onWithdraw: (amt: number) => void;
  missions: Mission[];
  activeMissionIndex: number | null;
  onSelectMission: (id: string) => void;
  onSpawnVehicle: (type: VehicleType, name: string, cost: number) => void;
  onCheatCode: (code: string) => void;
  gameConfig: any;
  setGameConfig: (cfg: any) => void;
  onClose: () => void;
}

export default function PhoneUI({
  cash,
  bankBalance,
  onDeposit,
  onWithdraw,
  missions,
  activeMissionIndex,
  onSelectMission,
  onSpawnVehicle,
  onCheatCode,
  gameConfig,
  setGameConfig,
  onClose
}: PhoneUIProps) {
  const [screen, setScreen] = useState<'home' | 'contracts' | 'bank' | 'velodrive' | 'gps' | 'settings'>('home');
  const [timeStr, setTimeStr] = useState('12:00 PM');
  const [cheatInput, setCheatInput] = useState('');
  const [cheatStatus, setCheatStatus] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyCheat = () => {
    if (!cheatInput.trim()) return;
    onCheatCode(cheatInput.trim().toUpperCase());
    setCheatStatus(`Code "${cheatInput.toUpperCase()}" Processed`);
    setCheatInput('');
    setTimeout(() => setCheatStatus(null), 3000);
  };

  const deliverableCars = [
    { type: 'sports' as VehicleType, name: 'Volt Spectre', cost: 1500, speed: 8, handle: 7, desc: 'Eco-charged high-frequency drift car' },
    { type: 'supercar' as VehicleType, name: 'Apex Falcon', cost: 5000, speed: 10, handle: 8, desc: 'Quantum-thrust aerodynamic track beast' },
    { type: 'motorcycle' as VehicleType, name: 'Rogue Blade', cost: 800, speed: 9, handle: 9, desc: 'Unstable plasma battery racing bike' },
    { type: 'sedan' as VehicleType, name: 'Titan Sovereign', cost: 600, speed: 5, handle: 6, desc: 'Armored heavy executive luxury cruiser' },
    { type: 'swat_van' as VehicleType, name: 'Tactical Enforcer', cost: 2500, speed: 6, handle: 4, desc: 'Heavy Chaos-reinforced riot containment vehicle' }
  ];

  return (
    <div id="virtual_phone_frame" className="w-[310px] h-[550px] bg-slate-950/95 border border-slate-800 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col font-sans select-none ring-4 ring-slate-900/50 backdrop-blur-md">
      {/* Dynamic Camera Notch & Status Bar */}
      <div className="h-6 w-full bg-slate-950 flex justify-between items-center px-6 text-[10px] text-slate-400 font-mono relative z-20">
        <span>{timeStr}</span>
        <div className="w-16 h-3.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1 flex items-center justify-center border border-slate-900">
          <div className="w-1.5 h-1.5 bg-indigo-900/50 rounded-full" />
        </div>
        <div className="flex items-center space-x-1.5">
          <Signal className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px]">5G</span>
          <Battery className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>

      {/* Screen Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col relative z-10 bg-gradient-to-b from-slate-900/50 to-slate-950/80">
        {screen !== 'home' && (
          <button 
            onClick={() => setScreen('home')}
            className="mb-3 flex items-center text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors w-fit px-1 py-0.5 rounded bg-slate-900/40 border border-slate-800/30"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            Home
          </button>
        )}

        {/* 1. HOME SCREEN */}
        {screen === 'home' && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Ambient greeting */}
            <div className="pt-4 px-2">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono font-semibold">Nova Haven Network</div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">Welcome, Operator</h1>
              <div className="flex items-center space-x-2 mt-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-slate-300">GPS Link Established</span>
              </div>
            </div>

            {/* Application Grid */}
            <div className="grid grid-cols-3 gap-3.5 my-6 px-1">
              <button 
                onClick={() => setScreen('contracts')}
                className="flex flex-col items-center justify-center p-3.5 bg-indigo-950/40 border border-indigo-900/40 hover:bg-indigo-900/40 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-1.5 border border-indigo-500/30 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5.5 h-5.5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-300 tracking-wide">Missions</span>
              </button>

              <button 
                onClick={() => setScreen('bank')}
                className="flex flex-col items-center justify-center p-3.5 bg-emerald-950/30 border border-emerald-900/30 hover:bg-emerald-900/30 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-1.5 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5.5 h-5.5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-300 tracking-wide">Finance</span>
              </button>

              <button 
                onClick={() => setScreen('velodrive')}
                className="flex flex-col items-center justify-center p-3.5 bg-amber-950/30 border border-amber-900/20 hover:bg-amber-900/30 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center mb-1.5 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Car className="w-5.5 h-5.5 text-amber-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-300 tracking-wide">VeloDrive</span>
              </button>

              <button 
                onClick={() => setScreen('gps')}
                className="flex flex-col items-center justify-center p-3.5 bg-sky-950/30 border border-sky-900/20 hover:bg-sky-900/30 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 bg-sky-500/10 rounded-xl flex items-center justify-center mb-1.5 border border-sky-500/20 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5.5 h-5.5 text-sky-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-300 tracking-wide">GPS Way</span>
              </button>

              <button 
                onClick={() => setScreen('settings')}
                className="flex flex-col items-center justify-center p-3.5 bg-slate-900/50 border border-slate-800/40 hover:bg-slate-800/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 bg-slate-700/20 rounded-xl flex items-center justify-center mb-1.5 border border-slate-600/20 group-hover:scale-105 transition-transform">
                  <SettingsIcon className="w-5.5 h-5.5 text-slate-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-300 tracking-wide">System</span>
              </button>

              <div 
                className="flex flex-col items-center justify-center p-3.5 bg-slate-900/20 border border-slate-800/10 rounded-2xl opacity-40 cursor-not-allowed"
              >
                <div className="w-11 h-11 bg-slate-800/10 rounded-xl flex items-center justify-center mb-1.5">
                  <Phone className="w-5.5 h-5.5 text-slate-500" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Contact</span>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 px-3.5 mb-1.5 flex justify-between items-center">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Available Wallet</span>
                <div className="text-sm font-mono font-bold text-slate-100">${cash.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Secure Bank</span>
                <div className="text-sm font-mono font-bold text-emerald-400">${bankBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTRACTS (MISSIONS) SCREEN */}
        {screen === 'contracts' && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-2.5 flex items-center">
              <Briefcase className="w-4 h-4 mr-1.5 text-indigo-400" />
              Contract Registry
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
              {missions.map((mission, idx) => {
                const isActive = activeMissionIndex === idx;
                const isCompleted = mission.status === 'completed';
                const isLocked = mission.status === 'locked';

                return (
                  <div 
                    key={mission.id}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive 
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/20' 
                        : isCompleted
                        ? 'bg-slate-900/30 border-slate-800/40 opacity-75'
                        : isLocked
                        ? 'bg-slate-950 border-slate-900/50 opacity-40'
                        : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-semibold text-slate-200 flex items-center">
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />}
                        {isLocked && <Lock className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />}
                        {mission.title}
                      </h3>
                      <span className="text-[9px] font-mono text-indigo-400 font-semibold bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30 shrink-0">
                        +${mission.rewardCash}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {mission.description}
                    </p>

                    {!isLocked && !isCompleted && !isActive && (
                      <button
                        onClick={() => onSelectMission(mission.id)}
                        className="mt-2.5 w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center"
                      >
                        <Play className="w-2.5 h-2.5 mr-1 fill-current" /> Initialize Mission
                      </button>
                    )}

                    {isActive && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-900/40">
                        <div className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">Active Objective:</div>
                        <div className="text-[10px] text-slate-300 font-medium flex items-center">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 shrink-0" />
                          {mission.objectives[mission.activeObjectiveIndex]?.description}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FINANCE (ATM/BANK) SCREEN */}
        {screen === 'bank' && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-2.5 flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-emerald-400" />
              Nova Cryptobank
            </h2>

            {/* Total Balance Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-900/30 p-4 rounded-2xl mb-4 text-center">
              <div className="text-[9px] uppercase tracking-wider text-emerald-500 font-mono font-medium">Secure Vault Balance</div>
              <div className="text-2xl font-mono font-bold text-slate-100 tracking-tight mt-1">${bankBalance.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-mono mt-1">Wallet cash on hand: ${cash.toLocaleString()}</div>
            </div>

            {/* ATM Operations */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">Transfer Terminal</div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDeposit(Math.min(cash, 100))}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left cursor-pointer transition-all active:scale-95"
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 mb-1" />
                  <div className="text-[10px] font-semibold text-slate-300">Deposit $100</div>
                  <div className="text-[8px] text-slate-500 font-mono">Move to bank</div>
                </button>

                <button
                  onClick={() => onWithdraw(Math.min(bankBalance, 100))}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left cursor-pointer transition-all active:scale-95"
                >
                  <ArrowDownLeft className="w-4 h-4 text-amber-400 mb-1" />
                  <div className="text-[10px] font-semibold text-slate-300">Withdraw $100</div>
                  <div className="text-[8px] text-slate-500 font-mono">Take to wallet</div>
                </button>

                <button
                  onClick={() => onDeposit(cash)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left cursor-pointer col-span-2 flex items-center justify-between transition-all active:scale-95"
                >
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-300">Deposit All Cash</div>
                      <div className="text-[8px] text-slate-500 font-mono">Secures ${cash} safely</div>
                    </div>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 rotate-180" />
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-auto bg-slate-950/80 border border-slate-900 p-2.5 rounded-xl flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                NOTICE: Police busts or player death will result in complete loss of un-deposited Wallet Cash. Bank vaults are 100% encrypted and secure.
              </p>
            </div>
          </div>
        )}

        {/* 4. VELODRIVE VEHICLE DELIVERY SCREEN */}
        {screen === 'velodrive' && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-2.5 flex items-center">
              <Car className="w-4 h-4 mr-1.5 text-amber-400" />
              VeloDrive Services
            </h2>
            <div className="text-[9px] text-slate-400 font-mono mb-2">On-demand drone delivery of vehicle prototypes to your current coordinate point:</div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
              {deliverableCars.map((car) => {
                const canAfford = cash >= car.cost;
                return (
                  <div 
                    key={car.name}
                    className="p-2.5 bg-slate-900/60 border border-slate-800/60 rounded-xl flex justify-between items-center"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate">{car.name}</span>
                        <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400 font-mono">{car.type}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">{car.desc}</p>
                      
                      {/* Bar Indicators */}
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 flex items-center space-x-0.5">
                          <span className="text-[7px] text-slate-500 font-mono">SPD:</span>
                          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="bg-amber-400 h-full" style={{ width: `${car.speed * 10}%` }} />
                          </div>
                        </div>
                        <div className="flex-1 flex items-center space-x-0.5">
                          <span className="text-[7px] text-slate-500 font-mono">HDL:</span>
                          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="bg-sky-400 h-full" style={{ width: `${car.handle * 10}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (canAfford) {
                          onSpawnVehicle(car.type, car.name, car.cost);
                        }
                      }}
                      disabled={!canAfford}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all flex flex-col items-center justify-center shrink-0 w-[68px] cursor-pointer ${
                        canAfford 
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95' 
                          : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-[8px] font-mono">${car.cost}</span>
                      <span>Order</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. GPS ROUTING SCREEN */}
        {screen === 'gps' && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-2.5 flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-sky-400" />
              GPS Navigation
            </h2>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-3">
              <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Active Waypoint Coordinates</span>
              <div className="text-xs font-mono font-medium text-slate-300 mt-1 flex items-center justify-between">
                <span>Vector: [0.0, 0.0]</span>
                <span className="text-sky-400 text-[10px]">Auto-Linked</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 leading-relaxed mb-3">
              Nova Haven districts mapped with security zones:
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto">
              <div className="p-2 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">1. Neon Downtown</span>
                <span className="text-[8px] font-mono text-emerald-400 px-1 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30">Safe Zone</span>
              </div>
              <div className="p-2 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">2. Suburban Outskirts</span>
                <span className="text-[8px] font-mono text-emerald-400 px-1 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30">Safe Zone</span>
              </div>
              <div className="p-2 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">3. Iron Docks & Industrial</span>
                <span className="text-[8px] font-mono text-amber-400 px-1 py-0.5 rounded bg-amber-950/20 border border-amber-900/30">Gang Activity</span>
              </div>
              <div className="p-2 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">4. Crimson Desert</span>
                <span className="text-[8px] font-mono text-amber-400 px-1 py-0.5 rounded bg-amber-950/20 border border-amber-900/30">Hostile AI</span>
              </div>
              <div className="p-2 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">5. Aegis Military Keep</span>
                <span className="text-[8px] font-mono text-rose-400 px-1 py-0.5 rounded bg-rose-950/20 border border-rose-900/30">Lethal Turrets</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. SETTINGS & CHEATS SCREEN */}
        {screen === 'settings' && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-2.5 flex items-center">
              <SettingsIcon className="w-4 h-4 mr-1.5 text-slate-400" />
              Settings & Overrides
            </h2>

            {/* Audio slider */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-300">System Master Audio</span>
                <span className="text-[9px] font-mono text-indigo-400">{Math.round(gameConfig.audioVolume * 100)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={gameConfig.audioVolume * 100}
                  onChange={(e) => setGameConfig({ ...gameConfig, audioVolume: parseFloat(e.target.value) / 100 })}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Cheat Code Terminal */}
            <div className="space-y-2 bg-slate-900/40 border border-slate-800/60 p-3 rounded-2xl">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Cheat Codes Terminal
              </span>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={cheatInput}
                  onChange={(e) => setCheatInput(e.target.value)}
                  placeholder="ENTER OVERRIDE PROTOCOL..."
                  className="flex-1 bg-slate-950 border border-slate-800 px-2 py-1.5 rounded-lg text-[9px] font-mono text-slate-100 placeholder-slate-700 outline-none uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyCheat();
                  }}
                />
                <button
                  onClick={handleApplyCheat}
                  className="px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {cheatStatus && (
                <div className="text-[8px] font-mono text-amber-400 text-center uppercase animate-pulse">
                  {cheatStatus}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/40 text-[8px] font-mono text-slate-500 space-y-1 leading-normal">
                <div>• <span className="text-slate-400">NEONSOVERDRIVE</span>: +$100,000 Cryptobank Cash</div>
                <div>• <span className="text-slate-400">LETHALPROTOCOL</span>: Unlock All Weapon Armaments</div>
                <div>• <span className="text-slate-400">SHADOWOPS</span>: Clear Wanted Levels instantly</div>
                <div>• <span className="text-slate-400">AEGISTANK</span>: Spawn heavy military tank immediately</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Physical Home Button / Close */}
      <div className="h-9 w-full bg-slate-950 flex justify-center items-center relative border-t border-slate-900 shrink-0">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-all shadow-inner relative z-10 cursor-pointer active:scale-90"
        >
          <div className="w-3 h-3 bg-indigo-500/20 rounded-sm border border-indigo-500/40" />
        </button>
      </div>
    </div>
  );
}
