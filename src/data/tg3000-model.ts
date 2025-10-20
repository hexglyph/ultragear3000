// Tipos derivados do documento de referência TG3000.

export type Currency = number;
export type Percent = number; // 0..100
export type Meters = number;
export type KmH = number;
export type Seconds = number;

export interface CarBaseStats {
  id: string;
  name: string;
  description: string;
  maxSpeed: KmH;
  accel0to100: Seconds;
  handlingGrip: number; // 0..1
  damageMax: number;
  fuelCapacity: number;
  boostCapacity: number;
}

export interface UpgradeTier {
  id: string;
  slot: UpgradeSlotId;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  cost: Currency;
  deltaMaxSpeed?: KmH;
  deltaAccel?: Seconds;
  deltaGrip?: number;
  deltaDamageMax?: number;
  deltaFuelCap?: number;
  boostPower?: number;
  boostDuration?: Seconds;
  unlockAtEventIndex?: number;
}

export type UpgradeSlotId = 'engine' | 'gearbox' | 'tires' | 'armor' | 'boost' | 'weapon';

export interface WeaponSpec {
  id: 'jump' | 'warp' | 'boost';
  name: string;
  cooldown: Seconds;
  charges?: number;
  effect: 'vertical_impulse' | 'phase_through' | 'speed_burst';
  params: Record<string, number>;
  description: string;
}

export interface CarState {
  integrity: number;
  fuel: number;
  boostCharges: number;
  activeWeapon: WeaponSpec['id'];
}

export interface TrackStrip {
  kind: 'normal' | 'recharge' | 'repair' | 'hazard' | 'jump_bonus';
  length: Meters;
  curvature: number; // -1..1
}

export interface TrackBranch {
  id: string;
  name: string;
  strips: TrackStrip[];
  timeAdvantageAtRefPace: Seconds;
  riskRating: number; // 0..1
  description: string;
}

export interface Track {
  id: string;
  name: string;
  planet: string;
  system: string;
  length: Meters;
  laps: number;
  speedAvgTarget: KmH;
  trafficDensity: number; // 0..1
  climateCycle: Array<'day' | 'night' | 'fog' | 'storm'>;
  environment: 'desert' | 'fields' | 'mountain' | 'beach' | 'nebula' | 'ice';
  difficulty: number;
  branches?: TrackBranch[];
  rechargeZones: number[];
  repairZones: number[];
}

export interface EventRewards {
  positionCredits: Currency[];
  completionBonus: Currency;
}

export interface Event {
  id: string;
  name: string;
  trackId: string;
  gridSize: number; // até 20
  rewards: EventRewards;
  difficultyScalar: number;
}

export interface ChampionshipSystem {
  name: string;
  description: string;
  eventIds: string[];
  gravity: number;
  atmosphere: 'thin' | 'standard' | 'dense';
  primaryPlanet: string;
}

export interface Championship {
  id: string;
  displayName: string;
  systems: ChampionshipSystem[];
  passwordSeed?: string;
}

export interface PlayerProfile {
  name: string;
  unit: 'KMH' | 'MPH';
  controls: Record<string, string>;
  credits: Currency;
  ownedUpgrades: Record<UpgradeSlotId, UpgradeTier['id']>;
}

export interface PlanetInfo {
  id: string;
  name: string;
  starSystem: string;
  gravity: number;
  atmosphere: 'thin' | 'standard' | 'dense';
  description: string;
}

// Dados iniciais inspirados no TG3000, com números ajustados para o protótipo atual.

export const baseCars: CarBaseStats[] = [
  {
    id: 'vx-orion',
    name: 'VX Orion',
    description: 'Pacote balanceado com boa resposta de boost.',
    maxSpeed: 260,
    accel0to100: 5.2,
    handlingGrip: 0.62,
    damageMax: 110,
    fuelCapacity: 110,
    boostCapacity: 4
  },
  {
    id: 'nova-stride',
    name: 'Nova Stride',
    description: 'Foco em aceleração e consumo eficiente para rotas longas.',
    maxSpeed: 248,
    accel0to100: 4.8,
    handlingGrip: 0.58,
    damageMax: 100,
    fuelCapacity: 130,
    boostCapacity: 3
  },
  {
    id: 'quantum-flare',
    name: 'Quantum Flare',
    description: 'Alta velocidade final, exige upgrades de estabilidade.',
    maxSpeed: 280,
    accel0to100: 5.8,
    handlingGrip: 0.54,
    damageMax: 105,
    fuelCapacity: 100,
    boostCapacity: 5
  }
];

export const weaponCatalog: WeaponSpec[] = [
  {
    id: 'jump',
    name: 'Jump Vector',
    cooldown: 1.2,
    effect: 'vertical_impulse',
    params: { impulse: 6.5 },
    description: 'Salto instantâneo para evitar tráfego e acessar bônus suspensos.'
  },
  {
    id: 'warp',
    name: 'Phase Warp',
    cooldown: 9,
    charges: 3,
    effect: 'phase_through',
    params: { warpTime: 1.5 },
    description: 'Permite atravessar veículos e barreiras leves por curto período.'
  },
  {
    id: 'boost',
    name: 'Flux Boost',
    cooldown: 0.5,
    charges: 4,
    effect: 'speed_burst',
    params: { boostDuration: 1.8, boostFactor: 1.28 },
    description: 'Aceleração intensa com alto consumo de combustível.'
  }
];

function buildUpgradeSlot(
  slot: UpgradeSlotId,
  baseCost: number,
  deltas: Array<Partial<UpgradeTier> & { deltaMaxSpeed?: KmH; deltaAccel?: Seconds }>
) {
  return deltas.map((delta, index) => {
    const level = (index + 1) as UpgradeTier['level'];
    return {
      id: `${slot.toUpperCase()}_${level}`,
      slot,
      level,
      cost: Math.round(baseCost * Math.pow(1.45, index)),
      unlockAtEventIndex: level > 2 ? level * 4 : undefined,
      ...delta
    };
  });
}

export const upgradeCatalog: UpgradeTier[] = [
  ...buildUpgradeSlot('engine', 2000, [
    { deltaMaxSpeed: 10 },
    { deltaMaxSpeed: 12 },
    { deltaMaxSpeed: 14 },
    { deltaMaxSpeed: 16 },
    { deltaMaxSpeed: 18 },
    { deltaMaxSpeed: 20 }
  ]),
  ...buildUpgradeSlot('gearbox', 1600, [
    { deltaAccel: -0.25, deltaGrip: 0.02 },
    { deltaAccel: -0.3, deltaGrip: 0.03 },
    { deltaAccel: -0.35, deltaGrip: 0.04 },
    { deltaAccel: -0.4, deltaGrip: 0.05 },
    { deltaAccel: -0.45, deltaGrip: 0.06 },
    { deltaAccel: -0.5, deltaGrip: 0.07 }
  ]),
  ...buildUpgradeSlot('tires', 1500, [
    { deltaGrip: 0.04 },
    { deltaGrip: 0.05 },
    { deltaGrip: 0.06 },
    { deltaGrip: 0.07 },
    { deltaGrip: 0.08 },
    { deltaGrip: 0.09 }
  ]),
  ...buildUpgradeSlot('armor', 1800, [
    { deltaDamageMax: 10 },
    { deltaDamageMax: 12 },
    { deltaDamageMax: 14 },
    { deltaDamageMax: 16 },
    { deltaDamageMax: 18 },
    { deltaDamageMax: 20 }
  ]),
  ...buildUpgradeSlot('boost', 2200, [
    { boostPower: 0.04, boostDuration: 0.1 },
    { boostPower: 0.05, boostDuration: 0.12 },
    { boostPower: 0.06, boostDuration: 0.14 },
    { boostPower: 0.07, boostDuration: 0.16 },
    { boostPower: 0.08, boostDuration: 0.18 },
    { boostPower: 0.09, boostDuration: 0.2 }
  ]),
  ...buildUpgradeSlot('weapon', 2600, [
    { boostDuration: 0.2 },
    { boostDuration: 0.25 },
    { boostDuration: 0.3 },
    { boostDuration: 0.35 },
    { boostDuration: 0.4 },
    { boostDuration: 0.45 }
  ])
];

export const trackCatalog: Track[] = [
  {
    id: 'aurora-pulse',
    name: 'Pulse Fields',
    planet: 'Aurora Prime',
    system: 'Helios Gate',
    length: 3800,
    laps: 3,
    speedAvgTarget: 210,
    trafficDensity: 0.5,
    climateCycle: ['day', 'night'],
    environment: 'fields',
    difficulty: 1,
    branches: [
      {
        id: 'aurora-pulse-ridge',
        name: 'Ridge Sprint',
        strips: [
          { kind: 'normal', length: 600, curvature: 0.1 },
          { kind: 'hazard', length: 340, curvature: 0.4 },
          { kind: 'normal', length: 500, curvature: -0.3 }
        ],
        timeAdvantageAtRefPace: 1.2,
        riskRating: 0.35,
        description: 'Crestas altas com vento lateral intenso.'
      }
    ],
    rechargeZones: [0.18, 0.62, 0.88],
    repairZones: [0.32, 0.74]
  },
  {
    id: 'aurora-tidal',
    name: 'Tidal Rush',
    planet: 'Aurora Prime',
    system: 'Helios Gate',
    length: 5200,
    laps: 3,
    speedAvgTarget: 225,
    trafficDensity: 0.55,
    climateCycle: ['day', 'fog', 'night'],
    environment: 'beach',
    difficulty: 3,
    branches: [
      {
        id: 'aurora-tidal-deep',
        name: 'Deep Current',
        strips: [
          { kind: 'normal', length: 800, curvature: -0.15 },
          { kind: 'recharge', length: 200, curvature: 0 },
          { kind: 'hazard', length: 280, curvature: 0.35 }
        ],
        timeAdvantageAtRefPace: 1.8,
        riskRating: 0.45,
        description: 'Túneis marinhos com baixa visibilidade; entrega combustível extra.'
      },
      {
        id: 'aurora-tidal-surge',
        name: 'Electro Surge',
        strips: [
          { kind: 'normal', length: 420, curvature: -0.2 },
          { kind: 'repair', length: 160, curvature: 0 },
          { kind: 'jump_bonus', length: 140, curvature: 0.28 }
        ],
        timeAdvantageAtRefPace: 0.9,
        riskRating: 0.25,
        description: 'Circuito aéreo com saltos sincronizados e reparo rápido.'
      }
    ],
    rechargeZones: [0.22, 0.58, 0.84],
    repairZones: [0.16, 0.46, 0.72]
  },
  {
    id: 'zephyr-cloudspire',
    name: 'Cloudspire',
    planet: 'Zephyr IX',
    system: 'Cyclone Rift',
    length: 4400,
    laps: 3,
    speedAvgTarget: 235,
    trafficDensity: 0.6,
    climateCycle: ['day', 'storm'],
    environment: 'mountain',
    difficulty: 4,
    branches: [
      {
        id: 'zephyr-cloudspire-tempest',
        name: 'Tempest Rim',
        strips: [
          { kind: 'hazard', length: 320, curvature: -0.45 },
          { kind: 'normal', length: 700, curvature: 0.3 },
          { kind: 'repair', length: 180, curvature: 0 }
        ],
        timeAdvantageAtRefPace: 2.4,
        riskRating: 0.55,
        description: 'Arco externo sobre tempestades iônicas, alto ganho de tempo porém perigoso.'
      }
    ],
    rechargeZones: [0.2, 0.66, 0.9],
    repairZones: [0.4, 0.78]
  }
];

export const eventCatalog: Event[] = [
  {
    id: 'helios-01',
    name: 'Aurora Opening Run',
    trackId: 'aurora-pulse',
    gridSize: 20,
    rewards: {
      positionCredits: [3500, 2500, 1800, 1200, 900],
      completionBonus: 600
    },
    difficultyScalar: 1
  },
  {
    id: 'helios-02',
    name: 'Tidal Rush Circuit',
    trackId: 'aurora-tidal',
    gridSize: 20,
    rewards: {
      positionCredits: [4200, 3100, 2200, 1500, 1000],
      completionBonus: 900
    },
    difficultyScalar: 1.12
  },
  {
    id: 'cyclone-01',
    name: 'Cloudspire Challenge',
    trackId: 'zephyr-cloudspire',
    gridSize: 20,
    rewards: {
      positionCredits: [5200, 3800, 2600, 1800, 1200],
      completionBonus: 1100
    },
    difficultyScalar: 1.2
  }
];

export const championship: Championship = {
  id: 'galactic-proto-league',
  displayName: 'Galactic Proto League',
  systems: [
    {
      name: 'Helios Gate',
      description: 'Campos neon com clima temperado e fluxo energético estável.',
      eventIds: ['helios-01', 'helios-02'],
      gravity: 1,
      atmosphere: 'standard',
      primaryPlanet: 'Aurora Prime'
    },
    {
      name: 'Cyclone Rift',
      description: 'Montanhas flutuantes e tempestades elétricas imprevisíveis.',
      eventIds: ['cyclone-01'],
      gravity: 0.82,
      atmosphere: 'thin',
      primaryPlanet: 'Zephyr IX'
    }
  ],
  passwordSeed: 'UG3K'
};

export const planetInfos: PlanetInfo[] = [
  {
    id: 'aurora-prime',
    name: 'Aurora Prime',
    starSystem: 'Helios Gate',
    gravity: 1,
    atmosphere: 'standard',
    description: 'Campos neon sob auroras constantes; clima estável ideal para pilotos iniciantes.'
  },
  {
    id: 'zephyr-ix',
    name: 'Zephyr IX',
    starSystem: 'Cyclone Rift',
    gravity: 0.82,
    atmosphere: 'thin',
    description: 'Montanhas flutuantes repletas de tempestades elétricas e ventos cruzados imprevisíveis.'
  }
];
