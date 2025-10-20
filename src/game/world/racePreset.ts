import type { PlanetDefinition } from './planets';
import type { RaceContext } from '../state/gameStore';
import type { CampaignEvent } from '../../data/tg3000-campaign';

function findTrackReference(planets: PlanetDefinition[], trackId: string) {
  for (let planetIndex = 0; planetIndex < planets.length; planetIndex += 1) {
    const planet = planets[planetIndex];
    const trackIndex = planet.tracks.findIndex((track) => track.id === trackId);
    if (trackIndex !== -1) {
      return { planet, planetIndex, trackIndex };
    }
  }
  return null;
}

export function selectRacePreset(
  planets: PlanetDefinition[],
  campaignEvent: CampaignEvent
): RaceContext {
  const trackId = campaignEvent.track?.id ?? campaignEvent.event.trackId;
  const reference = findTrackReference(planets, trackId);
  const fallbackPlanet = planets[0];
  const planet = reference?.planet ?? fallbackPlanet;
  const trackIndex = reference?.trackIndex ?? 0;
  const track = planet.tracks[trackIndex] ?? planet.tracks[0];
  const climate = track?.climateCycle[0] ?? 'day';
  const laps = track?.laps ?? campaignEvent.track?.laps ?? 3;

  return {
    eventId: campaignEvent.event.id,
    trackId,
    planet,
    trackIndex,
    laps: typeof laps === 'number' ? laps : 3,
    weather: climate
  };
}
