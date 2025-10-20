import { useMemo } from 'react';
import { useGameStore } from '../game/state/gameStore';
import { useRaceTelemetry } from '../game/state/raceTelemetry';

function formatSpeed(speed: number) {
  return `${Math.round(speed).toString().padStart(3, '0')} km/h`;
}

export function HUDOverlay() {
  const scene = useGameStore((state) => state.scene);
  const race = useGameStore((state) => state.race);
  const credits = useGameStore((state) => state.career.credits);
  const telemetry = useRaceTelemetry();

  const lapText = useMemo(() => `${telemetry.lap}/${telemetry.totalLaps}`, [telemetry]);
  const fuelPercent = Math.max(0, Math.min(100, telemetry.fuel));
  const armorPercent = Math.max(0, Math.min(100, telemetry.armor));

  if (scene !== 'race' || !race) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
      <header className="flex items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Planeta</p>
          <h1 className="text-xl font-semibold text-neon-blue">{race.planet.name}</h1>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pista</p>
          <h2 className="text-lg font-semibold text-white">
            {race.planet.tracks[race.trackIndex]?.name ?? '???'}
          </h2>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clima</p>
          <h3 className="text-lg font-semibold text-neon-orange">{race.weather}</h3>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Créditos</p>
          <h3 className="text-lg font-semibold text-neon-blue">{credits}</h3>
        </div>
      </header>

      <footer className="flex items-end justify-between">
        <div className="flex gap-8 text-sm text-slate-200">
          <div>
            <p className="uppercase tracking-[0.3em] text-slate-500">Volta</p>
            <p className="text-3xl font-bold text-neon-blue">{lapText}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.3em] text-slate-500">Posição</p>
            <p className="text-3xl font-bold text-white">#{telemetry.position}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.3em] text-slate-500">Tempo</p>
            <p className="text-3xl font-bold text-white">
              {telemetry.lapTime.toFixed(2)}s
              <span className="ml-3 text-sm text-slate-400">
                Melhor: {telemetry.bestLap ? `${telemetry.bestLap.toFixed(2)}s` : '--'}
              </span>
            </p>
          </div>
          <div className="w-40">
            <p className="uppercase tracking-[0.3em] text-slate-500">Combustível</p>
            <div className="mt-1 h-3 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-orange to-neon-pink"
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-300">{fuelPercent.toFixed(0)}%</p>
          </div>
          <div className="w-40">
            <p className="uppercase tracking-[0.3em] text-slate-500">Armadura</p>
            <div className="mt-1 h-3 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: `${armorPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-300">{armorPercent.toFixed(0)}%</p>
          </div>
        </div>
        <div className="flex flex-col items-end text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Velocidade</p>
          <p className="text-5xl font-black text-neon-pink drop-shadow-[0_0_12px_rgba(255,61,188,0.8)]">
            {formatSpeed(telemetry.speed)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
            Boost: Shift • Hangar: G • Mapa: M
          </p>
        </div>
      </footer>
    </div>
  );
}
