import { CatmullRomCurve3, Vector3 } from 'three';

type TrackLayoutGenerator = (segments: number) => Vector3[];

const TWO_PI = Math.PI * 2;

function createEllipseLayout(radiusX: number, radiusZ: number, wobble = 0) {
  return (segments: number) => {
    const points: Vector3[] = [];
    for (let i = 0; i < segments; i += 1) {
      const t = i / segments;
      const angle = t * TWO_PI;
      const wobbleOffset = wobble ? Math.sin(angle * 4) * wobble : 0;
      const x = Math.cos(angle) * (radiusX + wobbleOffset);
      const z = Math.sin(angle) * (radiusZ - wobbleOffset);
      const y = Math.sin(angle * 2) * 0.4 * wobble;
      points.push(new Vector3(x, y, z));
    }
    return points;
  };
}

function createFigureEightLayout(radius = 20) {
  return (segments: number) => {
    const points: Vector3[] = [];
    for (let i = 0; i < segments; i += 1) {
      const t = (i / segments) * TWO_PI;
      const x = Math.sin(t) * radius;
      const z = Math.sin(t) * Math.cos(t) * radius * 0.9;
      const y = Math.cos(t * 2) * 1.2;
      points.push(new Vector3(x, y, z));
    }
    return points;
  };
}

function createSpiralLayout(radius = 18, turns = 2) {
  return (segments: number) => {
    const points: Vector3[] = [];
    for (let i = 0; i < segments; i += 1) {
      const t = i / segments;
      const angle = t * TWO_PI * turns;
      const currentRadius = radius * (0.6 + 0.4 * Math.sin(t * Math.PI));
      const x = Math.cos(angle) * currentRadius;
      const z = Math.sin(angle) * currentRadius;
      const y = Math.sin(t * Math.PI * 3) * 1.5;
      points.push(new Vector3(x, y, z));
    }
    return points;
  };
}

function createCliffLayout(radius = 22) {
  return (segments: number) => {
    const points: Vector3[] = [];
    for (let i = 0; i < segments; i += 1) {
      const t = i / segments;
      const angle = t * TWO_PI;
      const switchback = Math.sin(t * Math.PI * 4) * 6;
      const height = Math.cos(t * Math.PI * 2) * 3;
      const x = Math.cos(angle) * (radius + switchback);
      const z = Math.sin(angle) * (radius * 0.6 + Math.sin(angle * 3) * 5);
      const y = height;
      points.push(new Vector3(x, y, z));
    }
    return points;
  };
}

const layoutGenerators: Record<string, TrackLayoutGenerator> = {
  'aurora-pulse': createEllipseLayout(24, 18, 3),
  'aurora-tidal': createFigureEightLayout(22),
  'aurora-tidal-surge': createSpiralLayout(16, 1.5),
  'aurora-tidal-deep': createSpiralLayout(18, 1.2),
  'zephyr-cloudspire': createCliffLayout(23),
  'zephyr-cloudspire-tempest': createCliffLayout(20),
  default: createEllipseLayout(22, 22, 0)
};

export function createTrackCurve(trackId: string | null, segments = 64) {
  const generator = (trackId && layoutGenerators[trackId]) || layoutGenerators.default;
  const points = generator(segments);
  return new CatmullRomCurve3(points, true, 'centripetal', 0.6);
}
