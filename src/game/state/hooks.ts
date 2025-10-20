import { useEffect } from 'react';

import { useGameStore } from './gameStore';

export function useInitializeGame() {
  const setLoading = useGameStore((state) => state.setLoading);
  const setScene = useGameStore((state) => state.setScene);
  const startEvent = useGameStore((state) => state.startEvent);

  useEffect(() => {
    const timer = setTimeout(() => {
      startEvent(0);
      setLoading(false);
      setScene('race');
    }, 750);

    return () => clearTimeout(timer);
  }, [setLoading, setScene, startEvent]);
}

export function useSceneHotkeys() {
  const setScene = useGameStore((state) => state.setScene);
  const scene = useGameStore((state) => state.scene);
  const upgradeVehicle = useGameStore((state) => state.upgradeVehicle);
  const startEvent = useGameStore((state) => state.startEvent);
  const currentEventOrder = useGameStore((state) => state.career.currentEventOrder);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyG':
          setScene('garage');
          break;
        case 'KeyR':
          setScene('race');
          break;
        case 'KeyM':
        case 'KeyP':
          setScene('galaxy');
          break;
        case 'Enter':
          if (scene === 'galaxy') {
            startEvent(currentEventOrder);
            setScene('race');
          }
          break;
        case 'Digit1':
          if (scene === 'garage') upgradeVehicle('engine');
          break;
        case 'Digit2':
          if (scene === 'garage') upgradeVehicle('transmission');
          break;
        case 'Digit3':
          if (scene === 'garage') upgradeVehicle('aero');
          break;
        case 'Digit4':
          if (scene === 'garage') upgradeVehicle('tires');
          break;
        case 'Digit5':
          if (scene === 'garage') upgradeVehicle('brakes');
          break;
        case 'Digit6':
          if (scene === 'garage') upgradeVehicle('armor');
          break;
        case 'Digit7':
          if (scene === 'garage') upgradeVehicle('energy');
          break;
        case 'Digit8':
          if (scene === 'garage') upgradeVehicle('prototype');
          break;
        case 'KeyU':
          if (scene === 'garage') {
            upgradeVehicle('engine');
          }
          break;
        default:
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentEventOrder, scene, setScene, startEvent, upgradeVehicle]);
}
