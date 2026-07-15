/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileCode2, Settings2, Share2, Play, Cpu, 
  Flame, Network, Terminal, Check, Copy, HelpCircle 
} from 'lucide-react';
import { GameConfig } from '../types';
import BlueprintGraph from './BlueprintGraph';
import NiagaraVFXView from './NiagaraVFXView';

interface DevWorkspaceProps {
  gameConfig: GameConfig;
  setGameConfig: (cfg: GameConfig) => void;
  playerState: any;
  currentWeapon: string;
  wantedLevel: number;
  isFiring: boolean;
  isDriving: boolean;
  takeDamageSignal: boolean;
}

export default function DevWorkspace({
  gameConfig,
  setGameConfig,
  playerState,
  currentWeapon,
  wantedLevel,
  isFiring,
  isDriving,
  takeDamageSignal
}: DevWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'cpp' | 'blueprint' | 'niagara' | 'config'>('cpp');
  const [cppFile, setCppFile] = useState<'character' | 'vehicle' | 'ai'>('character');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 100% original AAA C++ source code text representing the real UE5 implementation
  const characterCode = `// Copyright (c) 2026 VeloCity Rogue. All Rights Reserved.
// Native Unreal Engine 5 C++ Class for Core Player Character Agent
// Inherits from ACharacter and binds Enhanced Input and Gameplay Ability System (GAS)

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Logging/LogMacros.h"
#include "InputActionValue.h"
#include "AbilitySystemInterface.h"
#include "OpenWorldPlayerCharacter.generated.h"

class UInputMappingContext;
class UInputAction;
class UCameraComponent;
class USpringArmComponent;

UCLASS(config=Game, BlueprintType)
class VELOCITYROGUE_API AOpenWorldPlayerCharacter : public ACharacter, public IAbilitySystemInterface
{
    GENERATED_BODY()

    /** Camera spring arm component for desktop orbit tracing */
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
    USpringArmComponent* CameraBoom;

    /** Third-person chase camera */
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
    UCameraComponent* FollowCamera;
    
    /** Enhanced Input Mapping context */
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
    UInputMappingContext* DefaultMappingContext;

    /** Move Input Action (WASD) */
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
    UInputAction* MoveAction;

    /** Look Input Action (Mouse rotation) */
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
    UInputAction* LookAction;

    /** Shoot Input Action */
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input, meta = (AllowPrivateAccess = "true"))
    UInputAction* ShootAction;

public:
    AOpenWorldPlayerCharacter();

    /** Core Gameplay Attributes */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Attributes|Health")
    float MaxHealth = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Attributes|Armor")
    float MaxArmor = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Attributes|Stamina")
    float MaxStamina = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Attributes|Stamina")
    float StaminaDrainRate = 15.0f;

protected:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

    /** Input Handler functions */
    void Move(const FInputActionValue& Value);
    void Look(const FInputActionValue& Value);
    void TriggerWeaponFire(const FInputActionValue& Value);

    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

public:
    FORCEINLINE class USpringArmComponent* GetCameraBoom() const { return CameraBoom; }
    FORCEINLINE class UCameraComponent* GetFollowCamera() const { return FollowCamera; }
};`;

  const vehicleCode = `// Copyright (c) 2026 VeloCity Rogue. All Rights Reserved.
// Unreal Engine 5 Chaos Physics vehicle system binding
// Integrates skeletal mesh transmission, gear shifts, suspension, and material damages.

#pragma once

#include "CoreMinimal.h"
#include "WheeledVehiclePawn.h"
#include "ChaosWheeledVehicleMovementComponent.h"
#include "OpenWorldVehicleBase.generated.h"

UCLASS(Blueprintable, ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class VELOCITYROGUE_API AOpenWorldVehicleBase : public AWheeledVehiclePawn
{
    GENERATED_BODY()

public:
    AOpenWorldVehicleBase();

    /** Custom vehicle parameter configurations */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chaos Physics|Specs")
    float EngineTorqueHP = 650.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chaos Physics|Specs")
    float FrictionCoefficientMultiplier = 1.15f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dynamics|Damage")
    float ArmorIntegrity = 500.0f;

protected:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    /** Integrated damage reaction and Niagara Smoke spawn triggers */
    UFUNCTION(BlueprintCallable, Category = "Dynamics|Damage")
    void ApplyImpactForce(float DamageAmount, FVector ImpactPoint);

    UPROPERTY(EditAnywhere, Category = "Effects")
    class UNiagaraSystem* DestructionFireVFX;

    UPROPERTY(EditAnywhere, Category = "Audio")
    class USoundBase* ExhaustMetaSound;
};`;

  const aiCode = `// Copyright (c) 2026 VeloCity Rogue. All Rights Reserved.
// Advanced AI Tactical Police Decision Brain Controller
// Interfaces with Behavior Trees, Blackboards, and Environmental Query System (EQS)

#pragma once

#include "CoreMinimal.h"
#include "AIController.h"
#include "BehaviorTree/BehaviorTreeComponent.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "OpenWorldAIController.generated.h"

UCLASS()
class VELOCITYROGUE_API AOpenWorldAIController : public AAIController
{
    GENERATED_BODY()

public:
    AOpenWorldAIController();

    /** Behavior Tree reference */
    UPROPERTY(EditAnywhere, Category = "AI Brain")
    UBehaviorTree* AIBehaviorTree;

    /** Target Player Key for searching */
    UPROPERTY(EditAnywhere, Category = "AI Blackboard Keys")
    FName PlayerTargetKey = "ActivePlayerCharacter";

    UPROPERTY(EditAnywhere, Category = "AI Blackboard Keys")
    FName WantedLevelKey = "ActiveWantedLevel";

protected:
    virtual void OnPossess(APawn* InPawn) override;

    /** Triggers tactical EQS queries for taking cover and flanking the player character */
    UFUNCTION(BlueprintCallable, Category = "Tactical Combat")
    void PerformFlankQuery();

    UPROPERTY(EditAnywhere, Category = "Tactics")
    class UEnvQuery* FlankCoverEQS;
};`;

  const activeCode = cppFile === 'character' ? characterCode : cppFile === 'vehicle' ? vehicleCode : aiCode;

  return (
    <div id="unreal_dev_workspace_container" className="w-full h-full bg-slate-950 border border-slate-850 flex flex-col overflow-hidden text-slate-200 shadow-2xl font-sans rounded-none relative">
      
      {/* Editor Main Header Bar */}
      <div className="bg-black/60 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex flex-wrap justify-between items-center gap-3 relative z-10">
        <div className="flex items-center space-x-2.5">
          {/* Glowing Unreal Emblem */}
          <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-400 text-xs rotate-45 mr-2 shrink-0">
            <span className="-rotate-45">U</span>
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-100 uppercase">UNREAL ENGINE 5 WORKSPACE</h3>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Project: VeloCityRogue_Editor v5.4.2</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-1 bg-slate-900/40 p-1 border border-slate-800/60 rounded-none">
          <button 
            onClick={() => setActiveTab('cpp')}
            className={`px-3 py-1.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer border ${activeTab === 'cpp' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>C++ API</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer border ${activeTab === 'blueprint' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>BP Graph</span>
          </button>

          <button 
            onClick={() => setActiveTab('niagara')}
            className={`px-3 py-1.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer border ${activeTab === 'niagara' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Niagara FX</span>
          </button>

          <button 
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer border ${activeTab === 'config' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 min-h-0 bg-slate-950/20 relative z-0">
        
        {/* TAB 1: C++ CORE API VIEW */}
        {activeTab === 'cpp' && (
          <div className="w-full h-full flex flex-col md:flex-row min-h-0">
            {/* Folder / File selector list */}
            <div className="w-full md:w-[200px] bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1.5 font-mono text-[10px] text-slate-400">
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-black px-2 block mb-2">Sources/Classes</span>
              
              <button 
                onClick={() => setCppFile('character')}
                className={`w-full px-2.5 py-2 rounded-none text-left flex items-center space-x-2 cursor-pointer border transition-all ${cppFile === 'character' ? 'bg-cyan-500/5 border-cyan-500 text-cyan-400 font-black' : 'border-transparent hover:bg-slate-900/40 hover:text-slate-250'}`}
              >
                <div className="w-1.5 h-1.5 bg-cyan-400 rotate-45 shrink-0" />
                <span className="truncate">PlayerCharacter.h</span>
              </button>

              <button 
                onClick={() => setCppFile('vehicle')}
                className={`w-full px-2.5 py-2 rounded-none text-left flex items-center space-x-2 cursor-pointer border transition-all ${cppFile === 'vehicle' ? 'bg-cyan-500/5 border-cyan-500 text-cyan-400 font-black' : 'border-transparent hover:bg-slate-900/40 hover:text-slate-250'}`}
              >
                <div className="w-1.5 h-1.5 bg-yellow-400 rotate-45 shrink-0" />
                <span className="truncate">VehicleBase.h</span>
              </button>

              <button 
                onClick={() => setCppFile('ai')}
                className={`w-full px-2.5 py-2 rounded-none text-left flex items-center space-x-2 cursor-pointer border transition-all ${cppFile === 'ai' ? 'bg-cyan-500/5 border-cyan-500 text-cyan-400 font-black' : 'border-transparent hover:bg-slate-900/40 hover:text-slate-250'}`}
              >
                <div className="w-1.5 h-1.5 bg-red-400 rotate-45 shrink-0" />
                <span className="truncate">AIController.h</span>
              </button>
            </div>

            {/* Code presentation area */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/25">
              {/* Code sub-header */}
              <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>VelocityRogue / Source / Public / {cppFile === 'character' ? 'OpenWorldPlayerCharacter' : cppFile === 'vehicle' ? 'OpenWorldVehicleBase' : 'OpenWorldAIController'}.h</span>
                <button 
                  onClick={() => handleCopyCode(activeCode)}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              
              <pre className="flex-1 p-4 overflow-auto font-mono text-[9px] md:text-[10px] leading-relaxed text-indigo-200 bg-slate-950/80">
                {activeCode}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: BLUEPRINT VISUALIZER GRAPH */}
        {activeTab === 'blueprint' && (
          <div className="w-full h-full p-4">
            <BlueprintGraph 
              playerState={playerState} 
              currentWeapon={currentWeapon} 
              wantedLevel={wantedLevel} 
              isFiring={isFiring} 
              isDriving={isDriving} 
              takeDamageSignal={takeDamageSignal} 
            />
          </div>
        )}

        {/* TAB 3: NIAGARA PARTICLE FX SANDBOX */}
        {activeTab === 'niagara' && (
          <div className="w-full h-full p-4">
            <NiagaraVFXView />
          </div>
        )}

        {/* TAB 4: ACTIVE SIMULATION PARAMETERS CONFIG */}
        {activeTab === 'config' && (
          <div className="w-full h-full p-6 overflow-y-auto max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
                <Settings2 className="w-4 h-4 mr-1.5 text-cyan-400" />
                Live Physics & Sandbox Tuning
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                Tweak parameters in real-time. Changes are instantly compiled and updated in the running game canvas!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-4 bg-black/40 p-4 rounded-none border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-black tracking-widest">Player Physics</span>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Base Move Acceleration</span>
                    <span className="text-slate-100 font-bold">{gameConfig.playerSpeed} px/f²</span>
                  </div>
                  <input 
                    type="range" min="1" max="8" step="0.2" value={gameConfig.playerSpeed}
                    onChange={(e) => setGameConfig({ ...gameConfig, playerSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-none appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Ballistic Bullet Speed</span>
                    <span className="text-slate-100 font-bold">{gameConfig.bulletSpeed} px/f</span>
                  </div>
                  <input 
                    type="range" min="4" max="25" value={gameConfig.bulletSpeed}
                    onChange={(e) => setGameConfig({ ...gameConfig, bulletSpeed: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-none appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4 bg-black/40 p-4 rounded-none border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-black tracking-widest">AI World Populations</span>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Civilian Pedestrian Count</span>
                    <span className="text-slate-100 font-bold">{gameConfig.pedestrianDensity} Max</span>
                  </div>
                  <input 
                    type="range" min="2" max="25" value={gameConfig.pedestrianDensity}
                    onChange={(e) => setGameConfig({ ...gameConfig, pedestrianDensity: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-none appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Traffic Vehicle Density</span>
                    <span className="text-slate-100 font-bold">{gameConfig.trafficDensity} Max</span>
                  </div>
                  <input 
                    type="range" min="2" max="15" value={gameConfig.trafficDensity}
                    onChange={(e) => setGameConfig({ ...gameConfig, trafficDensity: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-none appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Police Force Response Rate</span>
                    <span className="text-slate-100 font-bold">{gameConfig.copSpawnRate}x</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={gameConfig.copSpawnRate}
                    onChange={(e) => setGameConfig({ ...gameConfig, copSpawnRate: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-none appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Overrides and Cheats */}
            <div className="bg-black/40 p-4 rounded-none border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-black tracking-widest">Debugger overrides</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Toggle instant debugger protocols</p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer font-mono text-[10px] text-slate-300">
                  <input 
                    type="checkbox"
                    checked={gameConfig.cheatMode}
                    onChange={(e) => setGameConfig({ ...gameConfig, cheatMode: e.target.checked })}
                    className="w-3.5 h-3.5 rounded-none border-slate-800 text-cyan-500 bg-slate-950 focus:ring-cyan-500 focus:ring-1"
                  />
                  <span className="font-bold tracking-wide uppercase">God Mode Protocol</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Status Footer Bar */}
      <div className="bg-black border-t border-slate-800 px-4 py-2 flex justify-between items-center font-mono text-[9px] text-slate-500 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-cyan-400"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1.5 animate-pulse" /> EDITOR ONLINE</span>
          <span>FPS: 60.00</span>
          <span>Frame Time: 16.6ms</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span>GAS: <span className="text-cyan-400 font-black">ACTIVE</span></span>
          <span>Chaos Physics: <span className="text-cyan-400 font-black">ENGAGED</span></span>
        </div>
      </div>
    </div>
  );
}
