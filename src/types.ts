/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaponType = 'unarmed' | 'pistol' | 'smg' | 'shotgun' | 'rocket';

export interface Weapon {
  type: WeaponType;
  name: string;
  ammo: number;
  maxAmmo: number;
  damage: number;
  fireRate: number; // ms between shots
  reloadTime: number; // ms
  recoil: number;
  unlocked: boolean;
  cost: number;
}

export type EntityType = 'player' | 'civilian' | 'cop' | 'swat' | 'tank_boss';

export interface Character {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  targetAngle: number;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  state: 'idle' | 'walking' | 'running' | 'sprinting' | 'shooting' | 'driving' | 'dead' | 'cover';
  currentWeapon: WeaponType;
  weapons: Record<WeaponType, Weapon>;
  cash: number;
  wantedLevel: number; // 0 to 5
  wantedProgress: number; // 0 to 100 towards next level
  inVehicleId: string | null;
  id: string;
}

export type VehicleType = 'sedan' | 'sports' | 'supercar' | 'motorcycle' | 'police' | 'swat_van' | 'tank';

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  handling: number; // turning rate
  angle: number;
  health: number;
  maxHealth: number;
  color: string;
  hasPlayer: boolean;
  isPolice: boolean;
  cost: number;
  damageLevel: number; // 0 = pristine, 1 = smoking, 2 = burning, 3 = destroyed
}

export interface NPC {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  health: number;
  maxHealth: number;
  state: 'wander' | 'alert' | 'panic' | 'chase' | 'flee' | 'attack' | 'dead';
  weapon: WeaponType;
  targetX: number | null;
  targetY: number | null;
  shootCooldown: number;
  cooldownTimer: number;
  pathTimer: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  ownerId: string;
  type: WeaponType;
  range: number;
  distanceTraveled: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  damage: number;
}

export type DistrictType = 'downtown' | 'suburbs' | 'industrial' | 'beach' | 'desert' | 'military';

export interface District {
  id: DistrictType;
  name: string;
  color: string;
  description: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  hazardLevel: number;
}

export interface Objective {
  description: string;
  type: 'goto' | 'kill' | 'steal' | 'survive' | 'escape';
  targetX?: number;
  targetY?: number;
  targetId?: string;
  targetCount?: number;
  currentCount?: number;
  isCompleted: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  giver: string;
  rewardCash: number;
  objectives: Objective[];
  activeObjectiveIndex: number;
  status: 'locked' | 'available' | 'active' | 'completed' | 'failed';
  dialogue: string[];
}

export interface GameConfig {
  playerSpeed: number;
  physicsTimeStep: number;
  trafficDensity: number;
  pedestrianDensity: number;
  copSpawnRate: number;
  vfxMultiplier: number;
  audioVolume: number;
  sfxVolume: number;
  bulletSpeed: number;
  cheatMode: boolean;
}

export interface SaveState {
  cash: number;
  weapons: Record<WeaponType, boolean>;
  wantedLevel: number;
  completedMissions: string[];
  purchasedVehicles: string[];
}
