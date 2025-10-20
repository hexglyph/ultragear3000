import { useMemo } from 'react';

import { useGameStore } from '../game/state/gameStore';
import { defaultPlanetaryCampaign } from '../game/world/planets';
import { getCampaignEvents } from '../data/tg3000-campaign';

const campaignPlanets = defaultPlanetaryCampaign();
const campaignEvents = getCampaignEvents();
type CampaignEventType = (typeof campaignEvents)[number];

const trackToPlanetId = new Map<string, string>();
campaignPlanets.forEach((planet) => {
  planet.tracks.forEach((track) => {
    trackToPlanetId.set(track.id, planet.id);
  });
});

const eventsByPlanetId = campaignEvents.reduce<Map<string, CampaignEventType[]>>((acc, event) => {
  const trackId = event.track?.id ?? event.event.trackId;
  const planetId = trackToPlanetId.get(trackId);
  if (!planetId) {
    return acc;
  }
  const existing = acc.get(planetId);
  if (existing) {
    existing.push(event);
  } else {
    acc.set(planetId, [event]);
  }
  return acc;
}, new Map());

const totalEvents = campaignEvents.length;

export function GalaxyOverlay() {
  const scene = useGameStore((state) => state.scene);
  const currentPlanetIndex = useGameStore((state) => state.career.currentPlanetIndex);
  const unlocked = useGameStore((state) => state.career.unlockedPlanets);
  const eventsUnlocked = useGameStore((state) => state.career.eventsUnlocked);
  const currentEventOrder = useGameStore((state) => state.career.currentEventOrder);
  const raceEventId = useGameStore((state) => state.race?.eventId ?? null);

  const summary = useMemo(() => {
    const completed = Math.min(currentEventOrder, totalEvents);
    const currentEvent = campaignEvents[currentEventOrder] ?? null;
    return {
      completed,
      currentLabel: currentEvent
        ? `#${currentEvent.order + 1} — ${currentEvent.name}`
        : 'Todos os eventos concluídos',
      currentTrack: currentEvent?.track?.name ?? null,
      systemName: currentEvent?.system.name ?? null
    };
  }, [currentEventOrder]);

  if (scene !== 'galaxy') {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 bg-gradient-to-br from-black/90 via-black/70 to-slate-900/60 p-8 text-white">
      <h2 className="text-3xl font-bold text-neon-pink">Mapa Galáctico</h2>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Eventos concluídos: {summary.completed}/{totalEvents} • Sistemas desbloqueados: {unlocked}
      </p>
      <p className="mt-1 text-sm text-slate-200">
        Próxima etapa{' '}
        <span className="font-semibold text-neon-blue">{summary.currentLabel}</span>
        {summary.currentTrack ? (
          <>
            {' '}
            • Pista <span className="font-semibold text-neon-orange">{summary.currentTrack}</span>
          </>
        ) : null}
        {summary.systemName ? (
          <>
            {' '}
            • Sistema <span className="font-semibold text-neon-pink">{summary.systemName}</span>
          </>
        ) : null}
      </p>

      <div className="mt-6 flex gap-6 overflow-x-auto">
        {campaignPlanets.map((planet, index) => {
          const locked = index >= unlocked;
          const events = eventsByPlanetId.get(planet.id) ?? [];
          return (
            <div
              key={planet.id}
              className={`min-w-[220px] rounded-xl border p-4 ${
                locked
                  ? 'border-white/5 bg-white/5 text-slate-500'
                  : 'border-neon-blue/40 bg-white/10 text-white'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Sistema {planet.starSystem}
              </p>
              <h3 className="text-xl font-semibold text-neon-blue">{planet.name}</h3>
              <p className="mt-2 text-sm">{planet.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                Gravidade {planet.gravity.toFixed(1)}g | Atmo {planet.atmosphere}
              </p>
              <p className="mt-2 text-sm text-neon-orange">
                {planet.tracks.length} pistas • nível {planet.tracks[0]?.difficulty ?? 1}+
              </p>
              <div className="mt-4 space-y-2 text-sm">
                {events.length === 0 ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Eventos ainda não cadastrados
                  </p>
                ) : (
                  events.map((event) => {
                    const isCurrent = event.order === currentEventOrder;
                    const isCompleted = event.order < currentEventOrder;
                    const isUnlocked = event.order < eventsUnlocked;
                    const status = isCompleted
                      ? 'Concluído'
                      : isCurrent
                      ? 'Em progresso'
                      : isUnlocked
                      ? 'Disponível'
                      : 'Bloqueado';
                    const statusColor = isCompleted
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-neon-pink'
                      : isUnlocked
                      ? 'text-neon-blue'
                      : 'text-slate-500';
                    const trackName = event.track?.name ?? '???';
                    const trackLength = event.track
                      ? `${(event.track.length / 1000).toFixed(1)} km`
                      : '—';
                    return (
                      <div
                        key={event.id}
                        className={`rounded-md border border-white/10 bg-white/5 p-3 ${
                          isCurrent ? 'shadow-[0_0_15px_rgba(236,72,153,0.35)]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{event.name}</p>
                          <span className={`text-xs uppercase tracking-[0.2em] ${statusColor}`}>
                            {status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">
                          Pista {trackName} • {trackLength}{' '}
                          {raceEventId === event.event.id ? '• Selecionado' : ''}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
              {currentPlanetIndex === index ? (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-neon-pink">
                  Navegar: Enter • Voltar à corrida: R
                </p>
              ) : locked ? (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                  Conclua eventos anteriores para desbloquear
                </p>
              ) : (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-neon-blue">
                  Eventos disponíveis acima
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
