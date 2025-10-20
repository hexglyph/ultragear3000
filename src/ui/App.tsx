import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import { useInitializeGame, useSceneHotkeys } from '../game/state/hooks';
import { GalaxyOverlay } from './GalaxyOverlay';
import { GarageOverlay } from './GarageOverlay';
import { HUDOverlay } from './HUDOverlay';
import { LoadingScreen } from './LoadingScreen';
import { SceneRouter } from '../game/scenes/SceneRouter';

export function App() {
  useInitializeGame();
  useSceneHotkeys();

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <Canvas
        className="absolute inset-0"
        shadows
        gl={{ antialias: true }}
        camera={{ position: [0, 2.5, 6], fov: 60, near: 0.1, far: 1000 }}
      >
        <color attach="background" args={['#04050f']} />
        <Suspense fallback={null}>
          <SceneRouter />
        </Suspense>
      </Canvas>

      <LoadingScreen />
      <HUDOverlay />
      <GarageOverlay />
      <GalaxyOverlay />
    </div>
  );
}
