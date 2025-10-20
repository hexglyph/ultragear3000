import { useMemo } from 'react';

import { useGameStore } from '../game/state/gameStore';
import { calculateUpgradeCost, upgradeCatalog, type UpgradeSlotId } from '../game/systems/upgrades';

const keyHints: Record<UpgradeSlotId, string> = {
  engine: '1',
  transmission: '2',
  aero: '3',
  tires: '4',
  brakes: '5',
  armor: '6',
  energy: '7',
  prototype: '8'
};

function describeEffect(slot: UpgradeSlotId, level: number) {
  if (level <= 0) return 'Sem bônus aplicado';
  const definition = upgradeCatalog.find((item) => item.id === slot);
  if (!definition) return '—';
  const effect = definition.effect(level);
  const parts: string[] = [];
  if (effect.topSpeed) parts.push(`+${Math.round(effect.topSpeed)} km/h`);
  if (effect.acceleration) parts.push(`+${(effect.acceleration * 100).toFixed(0)}% acel.`);
  if (effect.handling) parts.push(`+${(effect.handling * 100).toFixed(0)}% controle`);
  if (effect.durability) parts.push(`+${(effect.durability * 100).toFixed(0)}% blindagem`);
  if (effect.energy) parts.push(`+${(effect.energy * 100).toFixed(0)}% energia`);
  if (effect.boostPower) parts.push(`+${(effect.boostPower * 100).toFixed(0)}% turbo`);
  if (effect.boostDuration) parts.push(`+${effect.boostDuration.toFixed(1)}s turbo`);
  return parts.join(' • ');
}

export function GarageOverlay() {
  const scene = useGameStore((state) => state.scene);
  const vehicle = useGameStore((state) => state.vehicle);
  const credits = useGameStore((state) => state.career.credits);

  const totalPower = useMemo(() => {
    const speed = Math.round(vehicle.topSpeed);
    const accel = vehicle.acceleration.toFixed(2);
    const handling = (vehicle.handling * 100).toFixed(0);
    const durability = (vehicle.durability * 100).toFixed(0);
    const energy = (vehicle.energy * 100).toFixed(0);
    return { speed, accel, handling, durability, energy };
  }, [vehicle]);

  if (scene !== 'garage') {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-black/80 p-8 text-white">
      <h2 className="text-3xl font-bold text-neon-blue">Hangar VX Orion</h2>
      <p className="mt-1 text-sm uppercase tracking-[0.3em] text-slate-400">
        Créditos disponíveis: {credits}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
        [R] Voltar à corrida • [M] Mapa • Dígitos [1-8] aplicam upgrades nos módulos listados
      </p>

      <div className="mt-4 grid grid-cols-5 gap-4 text-xs uppercase tracking-[0.2em] text-slate-300">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-slate-400">Velocidade</p>
          <p className="text-lg font-semibold text-neon-blue">{totalPower.speed} km/h</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-slate-400">0-100</p>
          <p className="text-lg font-semibold text-neon-orange">{totalPower.accel}s</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-slate-400">Controle</p>
          <p className="text-lg font-semibold text-emerald-400">{totalPower.handling}%</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-slate-400">Blindagem</p>
          <p className="text-lg font-semibold text-cyan-300">{totalPower.durability}%</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-slate-400">Energia</p>
          <p className="text-lg font-semibold text-fuchsia-300">{totalPower.energy}%</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {upgradeCatalog.map((item) => {
          const current = vehicle.upgrades.find((upgrade) => upgrade.slot === item.id)?.level ?? 0;
          const cost = calculateUpgradeCost(item.id, current);
          const isMaxed = current >= item.maxLevel;
          const shortcut = keyHints[item.id];
          return (
            <div
              key={item.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 transition-shadow hover:shadow-[0_0_18px_rgba(59,130,246,0.35)]"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold text-neon-orange">{item.name}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">[{shortcut}]</span>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Nível {current}/{item.maxLevel}
              </p>
              <p className="mt-2 text-sm text-slate-200">{item.description}</p>
              <p className="mt-4 text-sm text-neon-blue">
                {isMaxed ? 'Nível máximo alcançado' : `Próximo upgrade: ${cost} créditos`}
              </p>
              <p className="mt-1 text-xs text-slate-400">Bônus atual: {describeEffect(item.id, current)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
