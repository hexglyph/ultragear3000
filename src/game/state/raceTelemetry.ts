import { create } from 'zustand';

export interface RaceTelemetry {
  speed: number;
  lap: number;
  totalLaps: number;
  position: number;
  lapTime: number;
  bestLap: number;
  progress: number;
  fuel: number;
  armor: number;
  carPosition: [number, number, number];
  carDirection: [number, number, number];
}

interface RaceTelemetryStore extends RaceTelemetry {
  update: (partial: Partial<RaceTelemetry>) => void;
  reset: (laps: number) => void;
}

const initialState: RaceTelemetry = {
  speed: 0,
  lap: 1,
  totalLaps: 3,
  position: 1,
  lapTime: 0,
  bestLap: 0,
  progress: 0,
  fuel: 100,
  armor: 100,
  carPosition: [0, 0, 0],
  carDirection: [0, 0, 1]
};

export const useRaceTelemetry = create<RaceTelemetryStore>((set) => ({
  ...initialState,
  update: (partial) => set((state) => ({ ...state, ...partial })),
  reset: (laps) => set({ ...initialState, totalLaps: laps })
}));
