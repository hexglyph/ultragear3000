import { Suspense } from 'react';
import { useGameStore } from '../state/gameStore';
import { GalaxyScene } from './galaxy/GalaxyScene';
import { HangarScene } from './garage/HangarScene';
import { RaceScene } from './race/RaceScene';

export function SceneRouter() {
  const scene = useGameStore((state) => state.scene);

  switch (scene) {
    case 'race':
      return (
        <Suspense fallback={null}>
          <RaceScene />
        </Suspense>
      );
    case 'garage':
      return <HangarScene />;
    case 'galaxy':
      return <GalaxyScene />;
    default:
      return null;
  }
}
