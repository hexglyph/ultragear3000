import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { defaultPlanetaryCampaign, type PlanetDefinition } from '../world/planets';
import { calculateUpgradeCost, upgradeCatalog, type UpgradeSlotId } from '../systems/upgrades';
import { baseCars, type CarBaseStats } from '../../data/tg3000-model';
import { getCampaignEventByOrder, getCampaignLength, getEventRewards } from '../../data/tg3000-campaign';
import { selectRacePreset } from '../world/racePreset';

export type SceneKey = 'loading' | 'race' | 'garage' | 'galaxy';

export interface VehicleUpgrade {
  slot: UpgradeSlotId;
  level: number;
}

export interface VehicleProfile {
  id: string;
  name: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  durability: number;
  energy: number;
  boostPower: number;
  boostDuration: number;
  upgrades: VehicleUpgrade[];
}

export interface CareerProgress {
  credits: number;
  currentEventOrder: number;
  eventsUnlocked: number;
  currentPlanetIndex: number;
  unlockedPlanets: number;
}

export interface RaceContext {
  eventId: string | null;
  trackId: string | null;
  planet: PlanetDefinition;
  trackIndex: number;
  laps: number;
  weather: 'day' | 'night' | 'fog' | 'storm';
}

export interface GameStoreState {
  scene: SceneKey;
  loading: boolean;
  career: CareerProgress;
  vehicle: VehicleProfile;
  race: RaceContext | null;
  setScene: (scene: SceneKey) => void;
  setLoading: (loading: boolean) => void;
  setRace: (race: RaceContext | null) => void;
  startEvent: (order: number) => void;
  completeEvent: (position: number) => void;
  awardCredits: (amount: number) => void;
  upgradeVehicle: (slot: UpgradeSlotId) => void;
  startNextEvent: () => void;
}

const defaultCar = baseCars[0];

function findUpgradeDefinition(slot: UpgradeSlotId) {
  return upgradeCatalog.find((item) => item.id === slot);
}

function buildVehicleProfile(baseCar: CarBaseStats, upgrades: VehicleUpgrade[]): VehicleProfile {
  const bonuses = {
    topSpeed: 0,
    acceleration: 0,
    handling: 0,
    durability: 0,
    energy: 0,
    boostPower: 0,
    boostDuration: 0
  };

  upgrades.forEach((upgrade) => {
    const definition = findUpgradeDefinition(upgrade.slot);
    if (!definition) {
      return;
    }
    const level = Math.min(upgrade.level, definition.maxLevel);
    const effect = definition.effect(level);
    bonuses.topSpeed += effect.topSpeed ?? 0;
    bonuses.acceleration += effect.acceleration ?? 0;
    bonuses.handling += effect.handling ?? 0;
    bonuses.durability += effect.durability ?? 0;
    bonuses.energy += effect.energy ?? 0;
    bonuses.boostPower += effect.boostPower ?? 0;
    bonuses.boostDuration += effect.boostDuration ?? 0;
  });

  const baseAcceleration = 10 / baseCar.accel0to100;
  const accelerationStat = Math.max(0.3, Number((baseAcceleration + bonuses.acceleration).toFixed(2)));
  const handlingStat = Math.min(1.6, baseCar.handlingGrip + bonuses.handling);
  const durabilityStat = Math.min(1.5, baseCar.damageMax / 200 + bonuses.durability);
  const energyStat = Math.min(1.6, baseCar.fuelCapacity / 220 + bonuses.energy);
  const boostPower = Math.max(0.15, 0.18 + bonuses.boostPower);
  const boostDuration = Math.max(1.6, 1.8 + bonuses.boostDuration);

  return {
    id: baseCar.id,
    name: baseCar.name,
    topSpeed: baseCar.maxSpeed + bonuses.topSpeed,
    acceleration: accelerationStat,
    handling: handlingStat,
    durability: durabilityStat,
    energy: energyStat,
    boostPower,
    boostDuration,
    upgrades
  };
}

const initialVehicle: VehicleProfile = buildVehicleProfile(defaultCar, []);

const initialCareer: CareerProgress = {
  credits: 2000,
  currentEventOrder: 0,
  eventsUnlocked: 1,
  currentPlanetIndex: 0,
  unlockedPlanets: 1
};

export const useGameStore = create<GameStoreState>()(
  devtools((set, get) => ({
    scene: 'loading',
    loading: true,
    career: initialCareer,
    vehicle: initialVehicle,
    race: null,
    setScene: (scene) => set({ scene }),
    setLoading: (loading) => set({ loading }),
    setRace: (race) => set({ race }),
    startEvent: (order) =>
      set((state) => {
        const campaignEvent = getCampaignEventByOrder(order);
        const planets = defaultPlanetaryCampaign();
        if (!campaignEvent || planets.length === 0) {
          return state;
        }
        const race = selectRacePreset(planets, campaignEvent);
        const planetIndex = planets.findIndex((planet) => planet.id === race.planet.id);
        const normalizedPlanetIndex = planetIndex >= 0 ? planetIndex : state.career.currentPlanetIndex;
        const unlockedPlanets = Math.max(state.career.unlockedPlanets, normalizedPlanetIndex + 1);
        return {
          race,
          career: {
            ...state.career,
            currentEventOrder: campaignEvent.order,
            currentPlanetIndex: normalizedPlanetIndex,
            unlockedPlanets
          }
        };
      }),
    awardCredits: (amount) =>
      set((state) => ({
        career: {
          ...state.career,
          credits: Math.max(0, state.career.credits + amount)
        }
      })),
    completeEvent: (position) =>
      set((state) => {
        const race = state.race;
        if (!race?.eventId) {
          return state;
        }
        const currentOrder = state.career.currentEventOrder;
        const campaignEvent = getCampaignEventByOrder(currentOrder);
        if (!campaignEvent) {
          return state;
        }
        const rewards = getEventRewards(campaignEvent.id);
        const normalizedPosition = Math.max(1, Math.floor(position));
        const positionIndex =
          rewards && rewards.positionCredits.length > 0
            ? Math.min(rewards.positionCredits.length - 1, normalizedPosition - 1)
            : 0;
        const positionReward =
          rewards?.positionCredits[positionIndex] ?? 0;
        const completionBonus = rewards?.completionBonus ?? 0;
        const totalReward = positionReward + completionBonus;

        const campaignLength = getCampaignLength();
        const eventsUnlocked = Math.min(
          campaignLength,
          Math.max(state.career.eventsUnlocked, campaignEvent.order + 2)
        );

        let unlockedPlanets = state.career.unlockedPlanets;
        const nextEvent = getCampaignEventByOrder(campaignEvent.order + 1);
        if (nextEvent) {
          const planets = defaultPlanetaryCampaign();
          const trackId = nextEvent.track?.id ?? nextEvent.event.trackId;
          const planetIndex = planets.findIndex((planet) =>
            planet.tracks.some((track) => track.id === trackId)
          );
          if (planetIndex !== -1) {
            unlockedPlanets = Math.max(unlockedPlanets, planetIndex + 1);
          }
        }

        return {
          career: {
            ...state.career,
            credits: Math.max(0, state.career.credits + totalReward),
            eventsUnlocked,
            unlockedPlanets
          }
        };
      }),
    upgradeVehicle: (slot) =>
      set((state) => {
        const currentLevel =
          state.vehicle.upgrades.find((upgrade) => upgrade.slot === slot)?.level ?? 0;
        const definition = upgradeCatalog.find((item) => item.id === slot);
        if (!definition) {
          return state;
        }
        const cost = calculateUpgradeCost(slot, currentLevel);

        if (currentLevel >= definition.maxLevel || state.career.credits < cost) {
          return state;
        }

        const upgrades = state.vehicle.upgrades.map((upgrade) =>
          upgrade.slot === slot ? { ...upgrade, level: upgrade.level + 1 } : upgrade
        );
        if (!upgrades.some((upgrade) => upgrade.slot === slot)) {
          upgrades.push({ slot, level: 1 });
        }
        const baseSpec = baseCars.find((car) => car.id === state.vehicle.id) ?? defaultCar;
        const updatedVehicle = buildVehicleProfile(baseSpec, upgrades);
        return {
          vehicle: {
            ...updatedVehicle
          },
          career: {
            ...state.career,
            credits: state.career.credits - cost
          }
        };
      }),
    startNextEvent: () => {
      const nextOrder = get().career.currentEventOrder + 1;
      get().startEvent(nextOrder);
    }
  }))
);
