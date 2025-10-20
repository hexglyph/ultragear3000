import { useEffect, useRef } from 'react';

export interface KeyboardState {
  accelerate: number;
  brake: number;
  steer: number;
  boost: boolean;
}

const defaultState: KeyboardState = {
  accelerate: 0,
  brake: 0,
  steer: 0,
  boost: false
};

export function useKeyboardControls(): KeyboardState {
  const stateRef = useRef<KeyboardState>({ ...defaultState });

  useEffect(() => {
    const handleDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          stateRef.current.accelerate = 1;
          break;
        case 'ArrowDown':
        case 'KeyS':
          stateRef.current.brake = 1;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          stateRef.current.steer = -1;
          break;
        case 'ArrowRight':
        case 'KeyD':
          stateRef.current.steer = 1;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          stateRef.current.boost = true;
          break;
        default:
      }
    };

    const handleUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          stateRef.current.accelerate = 0;
          break;
        case 'ArrowDown':
        case 'KeyS':
          stateRef.current.brake = 0;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (stateRef.current.steer < 0) stateRef.current.steer = 0;
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (stateRef.current.steer > 0) stateRef.current.steer = 0;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          stateRef.current.boost = false;
          break;
        default:
      }
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      stateRef.current = { ...defaultState };
    };
  }, []);

  return stateRef.current;
}
