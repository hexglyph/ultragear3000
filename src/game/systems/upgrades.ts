export type UpgradeSlotId =
  | 'engine'
  | 'transmission'
  | 'aero'
  | 'tires'
  | 'brakes'
  | 'armor'
  | 'energy'
  | 'prototype';

export interface UpgradeDefinition {
  id: UpgradeSlotId;
  name: string;
  maxLevel: number;
  baseCost: number;
  description: string;
  effect: (level: number) => Record<string, number>;
}

export const upgradeCatalog: UpgradeDefinition[] = [
  {
    id: 'engine',
    name: 'Turbo Quantum',
    maxLevel: 5,
    baseCost: 1200,
    description: 'Aumenta velocidade máxima e aceleração com injeção de plasma.',
    effect: (level) => ({
      topSpeed: 20 * level,
      acceleration: 0.06 * level
    })
  },
  {
    id: 'transmission',
    name: 'Transmissão Flux Gate',
    maxLevel: 5,
    baseCost: 900,
    description: 'Marchas assimétricas otimizam torque em curvas.',
    effect: (level) => ({
      acceleration: 0.05 * level,
      handling: 0.03 * level
    })
  },
  {
    id: 'aero',
    name: 'Kit Aero Grav',
    maxLevel: 5,
    baseCost: 950,
    description: 'Superfícies reconfiguráveis geram downforce com baixo arrasto.',
    effect: (level) => ({
      handling: 0.07 * level,
      topSpeed: 5 * level
    })
  },
  {
    id: 'tires',
    name: 'Grip Vector',
    maxLevel: 5,
    baseCost: 800,
    description: 'Pneus inteligentes monitoram temperatura e ajustam aderência.',
    effect: (level) => ({
      handling: 0.08 * level
    })
  },
  {
    id: 'brakes',
    name: 'Freios Hexa Flux',
    maxLevel: 4,
    baseCost: 700,
    description: 'Frenagem regenerativa alimenta a bateria e reduz desgaste.',
    effect: (level) => ({
      handling: 0.05 * level,
      energy: 0.04 * level
    })
  },
  {
    id: 'armor',
    name: 'Blindagem Phase Shield',
    maxLevel: 4,
    baseCost: 1100,
    description: 'Campos de fase que absorvem impacto e mitigam danos.',
    effect: (level) => ({
      durability: 0.1 * level
    })
  },
  {
    id: 'energy',
    name: 'Núcleo Flux Drive',
    maxLevel: 4,
    baseCost: 1000,
    description: 'Reservas extras de energia para boosts e escudos.',
    effect: (level) => ({
      energy: 0.1 * level
    })
  },
  {
    id: 'prototype',
    name: 'Slot Experimental',
    maxLevel: 3,
    baseCost: 2500,
    description: 'Protótipos raros com efeitos únicos em campeonatos avançados.',
    effect: (level) => ({
      topSpeed: 15 * level,
      acceleration: 0.08 * level,
      handling: 0.04 * level
    })
  }
];

export function calculateUpgradeCost(slot: UpgradeSlotId, currentLevel: number) {
  const upgrade = upgradeCatalog.find((item) => item.id === slot);
  if (!upgrade) {
    throw new Error(`Upgrade ${slot} não encontrado`);
  }
  const clampedLevel = Math.min(currentLevel, upgrade.maxLevel);
  return Math.floor(upgrade.baseCost * Math.pow(1.35, clampedLevel));
}
