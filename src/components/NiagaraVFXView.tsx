/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, Code2, Sparkles } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function NiagaraVFXView() {
  const [spawnRate, setSpawnRate] = useState(250);
  const [particleSpeed, setParticleSpeed] = useState(4);
  const [gravity, setGravity] = useState(0.8); // Pulls down
  const [lifetime, setLifetime] = useState(1.5); // Seconds
  const [preset, setPreset] = useState<'fire' | 'plasma' | 'electro' | 'exhaust'>('fire');
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  // Preset configuration details
  const colorSchemes = {
    fire: ['#ef4444', '#f97316', '#f59e0b', '#fef08a'],
    plasma: ['#d946ef', '#a855f7', '#6366f1', '#e0f2fe'],
    electro: ['#06b6d4', '#3b82f6', '#34d399', '#fef08a'],
    exhaust: ['#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9']
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Handle Resize
      if (canvas.width !== canvas.parentElement?.clientWidth || canvas.height !== canvas.parentElement?.clientHeight) {
        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = canvas.parentElement?.clientHeight || 200;
      }

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        // Spawn particles based on spawn rate (Poisson-like approximation per frame)
        const countToSpawn = Math.round((spawnRate * delta) * (0.8 + Math.random() * 0.4));
        for (let i = 0; i < countToSpawn; i++) {
          const angle = -Math.PI / 2 + (Math.random() * 0.5 - 0.25); // Shoot upwards
          const speed = (particleSpeed * 50) * (0.6 + Math.random() * 0.8);
          
          particlesRef.current.push({
            x: canvas.width / 2,
            y: canvas.height * 0.85,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 8,
            color: colorSchemes[preset][Math.floor(Math.random() * colorSchemes[preset].length)],
            alpha: 1,
            life: 0,
            maxLife: lifetime * (0.6 + Math.random() * 0.8)
          });
        }
      }

      // Update & Draw
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += delta;
        p.vy += (gravity * 120) * delta; // Apply Gravity
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        
        const lifeRatio = p.life / p.maxLife;
        p.alpha = 1 - lifeRatio;
        
        if (p.life >= p.maxLife) return false;

        // Draw particle with glow/radial blur
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fill();

        // Extra dynamic halo glow
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return true;
      });

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [spawnRate, particleSpeed, gravity, lifetime, preset, isPlaying]);

  const hlslCode = `// UNREAL ENGINE 5 - NIAGARA TRANSLATION COMPILER SHADER
// System: NS_VeloCityEmitter_${preset.toUpperCase()}
// Compiled HLSL code for GPU Pipeline Execution

#include "/Engine/Private/NiagaraShaderCommon.ush"

struct FNiagaraSpawnParameters {
    float SpawnRate;
    float VelocityScale;
    float3 GravityVector;
    float ParticleLifetime;
};

void MapGPUSimulation(
    in float3 InPosition,
    inout float4 OutColor,
    inout float3 OutVelocity,
    in float LifeRatio
) {
    // Current Active Parameters Configured in Live Editor Workspace
    const float ActiveSpawnRate = ${spawnRate}.0f;
    const float ActiveSpeed = ${particleSpeed}.5f;
    const float ActiveGravityY = ${gravity * 9.81}f;
    const float ActiveMaxLife = ${lifetime}f;

    // Apply Kinetic Force Integrators
    OutVelocity.y += ActiveGravityY * DeltaTime;
    OutVelocity.x += sin(InPosition.y * 0.05f) * (ActiveSpeed * 0.2f);

    // Color Palette Ramp interpolation
    float4 ColorRamp[4] = {
        float4(${preset === 'fire' ? '1.0f, 0.2f, 0.1f' : preset === 'plasma' ? '0.85f, 0.2f, 0.9f' : preset === 'electro' ? '0.0f, 0.7f, 0.8f' : '0.4f, 0.45f, 0.5f'}, 1.0f),
        float4(${preset === 'fire' ? '0.9f, 0.4f, 0.0f' : preset === 'plasma' ? '0.6f, 0.3f, 0.9f' : preset === 'electro' ? '0.2f, 0.5f, 0.9f' : '0.6f, 0.65f, 0.7f'}, 0.8f),
        float4(${preset === 'fire' ? '0.9f, 0.6f, 0.1f' : preset === 'plasma' ? '0.4f, 0.4f, 0.9f' : preset === 'electro' ? '0.2f, 0.8f, 0.6f' : '0.8f, 0.85f, 0.9f'}, 0.5f),
        float4(1.0f, 1.0f, 0.8f, 0.0f)
    };

    int Idx = clamp(int(LifeRatio * 3.0f), 0, 2);
    float t = fraction(LifeRatio * 3.0f);
    OutColor = lerp(ColorRamp[Idx], ColorRamp[Idx + 1], t) * (1.0f - LifeRatio);
}`;

  return (
    <div className="w-full h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row font-sans">
      {/* Simulation Screen */}
      <div className="flex-1 min-h-[220px] relative flex flex-col bg-slate-950 border-r border-slate-800">
        <canvas ref={canvasRef} className="w-full flex-1" />
        
        {/* Floating Playbacks */}
        <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center space-x-2 shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold font-mono tracking-wider text-slate-200">NIAGARA GPU SIMULATOR</span>
        </div>

        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center space-x-2 shadow-lg backdrop-blur-md">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button 
            onClick={() => { particlesRef.current = []; }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800" />
          <span className="text-[9px] font-mono text-slate-400">Particles: {particlesRef.current.length}</span>
        </div>
      </div>

      {/* Editor & Parameters Panel */}
      <div className="w-full md:w-[320px] bg-slate-900/50 flex flex-col overflow-y-auto">
        <div className="border-b border-slate-800 p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center">
            <Sliders className="w-4 h-4 mr-1.5 text-indigo-400" /> System Emitter
          </span>
          <select 
            value={preset} 
            onChange={(e) => setPreset(e.target.value as any)}
            className="bg-slate-950 text-[10px] font-mono text-indigo-400 border border-slate-800 rounded px-2 py-1 outline-none"
          >
            <option value="fire">Flame Burst</option>
            <option value="plasma">Plasma Conduit</option>
            <option value="electro">Electro Helix</option>
            <option value="exhaust">Tire Smoke / Steam</option>
          </select>
        </div>

        {/* Emitter Control Sliders */}
        <div className="p-3.5 space-y-3.5 border-b border-slate-800 text-xs text-slate-300">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Spawn Rate (per sec)</span>
              <span className="text-indigo-400">{spawnRate}</span>
            </div>
            <input 
              type="range" min="20" max="600" value={spawnRate} 
              onChange={(e) => setSpawnRate(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Emitter Initial Speed</span>
              <span className="text-indigo-400">{particleSpeed} m/s</span>
            </div>
            <input 
              type="range" min="1" max="10" value={particleSpeed} 
              onChange={(e) => setParticleSpeed(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Chaos Gravity Force</span>
              <span className="text-indigo-400">{gravity} G</span>
            </div>
            <input 
              type="range" min="-3" max="5" step="0.2" value={gravity} 
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Particle Max Lifetime</span>
              <span className="text-indigo-400">{lifetime}s</span>
            </div>
            <input 
              type="range" min="0.4" max="3" step="0.1" value={lifetime} 
              onChange={(e) => setLifetime(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Generated HLSL Shader Panel */}
        <div className="flex-1 flex flex-col min-h-[150px]">
          <div className="bg-slate-900 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-[9px] font-mono uppercase text-slate-500">
            <span className="flex items-center"><Code2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Compiled GPU HLSL Shader</span>
            <span className="text-emerald-500">READY</span>
          </div>
          <pre className="flex-1 p-3 font-mono text-[8.5px] leading-relaxed text-slate-400 overflow-auto bg-slate-950/40 select-all">
            {hlslCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
