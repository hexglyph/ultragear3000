import { championship, planetInfos, trackCatalog } from '../../data/tg3000-model';

export type Climate = 'day' | 'night' | 'fog' | 'storm';

export interface TrackDefinition {
  id: string;
  name: string;
  length: number;
  laps: number;
  climateCycle: Climate[];
  environment: 'desert' | 'fields' | 'mountain' | 'beach' | 'nebula' | 'ice';
  difficulty: number;
  rechargeZones: number[];
  repairZones: number[];
}

export interface PlanetDefinition {
  id: string;
  name: string;
  starSystem: string;
  gravity: number;
  atmosphere: 'thin' | 'standard' | 'dense';
  description: string;
  tracks: TrackDefinition[];
}

const planetInfoById = new Map(
  planetInfos.map((info) => [normalizeId(info.id), info])
);

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function formatLength(lengthMeters: number) {
  return Math.round((lengthMeters / 1000) * 10) / 10;
}

export function defaultPlanetaryCampaign(): PlanetDefinition[] {
  const tracksByPlanet = trackCatalog.reduce<Map<string, TrackDefinition[]>>((acc, track) => {
    const planetId = normalizeId(track.planet);
    const collection = acc.get(planetId) ?? [];
    collection.push({
      id: track.id,
      name: track.name,
      length: formatLength(track.length),
      laps: track.laps,
      climateCycle: track.climateCycle,
      environment: track.environment,
      difficulty: track.difficulty,
      rechargeZones: track.rechargeZones,
      repairZones: track.repairZones
    });
    acc.set(planetId, collection);
    return acc;
  }, new Map());

  const orderedPlanetIds = Array.from(
    new Set(
      championship.systems.flatMap((system) => {
        const primary = normalizeId(system.primaryPlanet);
        const systemTracks = trackCatalog
          .filter((track) => normalizeId(track.system) === normalizeId(system.name))
          .map((track) => normalizeId(track.planet));
        return [primary, ...systemTracks];
      })
    )
  );

  return orderedPlanetIds
    .map((planetId) => {
      const info = planetInfoById.get(planetId);
      const tracks = tracksByPlanet.get(planetId);
      if (!tracks || tracks.length === 0) {
        return null;
      }
      return {
        id: planetId,
        name: info?.name ?? planetId,
        starSystem: info?.starSystem ?? championship.displayName,
        gravity: info?.gravity ?? 1,
        atmosphere: info?.atmosphere ?? 'standard',
        description:
          info?.description ??
          'Seção do campeonato pendente de detalhamento — placeholder inspirado no TG3000.',
        tracks
      };
    })
    .filter((planet): planet is PlanetDefinition => Boolean(planet));
}
