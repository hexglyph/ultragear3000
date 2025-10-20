import {
  championship,
  eventCatalog,
  trackCatalog,
  type Event,
  type Track,
  type ChampionshipSystem
} from './tg3000-model';

export interface CampaignEvent {
  id: string;
  name: string;
  order: number;
  systemIndex: number;
  system: ChampionshipSystem;
  event: Event;
  track: Track | null;
}

const trackById = new Map(trackCatalog.map((track) => [track.id, track]));
const eventById = new Map(eventCatalog.map((event) => [event.id, event]));

function flattenEvents(): CampaignEvent[] {
  const campaignEvents: CampaignEvent[] = [];
  championship.systems.forEach((system, systemIndex) => {
    system.eventIds.forEach((eventId) => {
      const event = eventById.get(eventId);
      if (!event) {
        return;
      }
      const track = trackById.get(event.trackId) ?? null;
      campaignEvents.push({
        id: event.id,
        name: event.name,
        order: campaignEvents.length,
        systemIndex,
        system,
        event,
        track
      });
    });
  });
  return campaignEvents;
}

const campaignEvents = flattenEvents();

export function getCampaignEvents(): CampaignEvent[] {
  return campaignEvents;
}

export function getCampaignEventByOrder(order: number): CampaignEvent | null {
  const normalized = ((order % campaignEvents.length) + campaignEvents.length) % campaignEvents.length;
  return campaignEvents[normalized] ?? null;
}

export function getCampaignLength() {
  return campaignEvents.length;
}

export function getEventRewards(eventId: string) {
  return eventById.get(eventId)?.rewards ?? null;
}
