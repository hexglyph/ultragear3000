import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { Color, MathUtils } from 'three';
import { OrbitControls, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

import { defaultPlanetaryCampaign } from '../../world/planets';
import { useGameStore } from '../../state/gameStore';

const planets = defaultPlanetaryCampaign();

export function GalaxyScene() {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={5} />
      <Stars radius={300} count={4000} factor={4} saturation={0} />
      <GalaxyCore />
      <SolarRings />
      <PlanetNodes />
      <OrbitControls enablePan={false} enableZoom={false} />
    </>
  );
}

function GalaxyCore() {
  return (
    <mesh>
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial color="#f97316" />
    </mesh>
  );
}

function SolarRings() {
  const rings = useMemo(
    () =>
      new Array(6).fill(0).map((_, index) => ({
        radius: 8 + index * 6,
        color: new Color().setHSL(0.55 + index * 0.05, 0.6, 0.4),
        tilt: MathUtils.degToRad(index * 8)
      })),
    []
  );
  return (
    <group rotation={[MathUtils.degToRad(24), MathUtils.degToRad(12), 0]}>
      {rings.map((ring, index) => (
        <mesh key={index} rotation={[ring.tilt, 0, 0]}>
          <torusGeometry args={[ring.radius, 0.05, 16, 128]} />
          <meshBasicMaterial color={ring.color} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function PlanetNodes() {
  const groups = useRef<Group[]>([]);
  const currentPlanet = useGameStore((state) => state.career.currentPlanetIndex);

  useFrame((_, delta) => {
    groups.current.forEach((group, index) => {
      if (!group) return;
      group.rotation.y += delta * 0.2 * (1 + index * 0.1);
    });
  });

  return (
    <group>
      {planets.map((planet, index) => {
        const orbitRadius = 10 + index * 6;
        const color = new Color().setHSL(0.55 + index * 0.06, 0.75, 0.5);
        const glow = color.clone().offsetHSL(0.05, 0.1, 0.2);
        return (
          <group
            key={planet.id}
            ref={(instance) => {
              if (instance) groups.current[index] = instance;
            }}
          >
            <mesh position={[orbitRadius, 0, 0]}>
              <sphereGeometry args={[1.2 + index * 0.2, 32, 32]} />
              <meshStandardMaterial emissive={glow} color={color} emissiveIntensity={0.5} />
              <mesh position={[0, 0, 0]}>
                <ringGeometry args={[1.4 + index * 0.2, 1.45 + index * 0.2, 32]} />
                <meshBasicMaterial color={glow} transparent opacity={0.3} side={2} />
              </mesh>
            </mesh>
            {currentPlanet === index ? (
              <mesh position={[orbitRadius, 0, 0]}>
                <sphereGeometry args={[1.5 + index * 0.25, 32, 32]} />
                <meshBasicMaterial color="#f472b6" wireframe transparent opacity={0.3} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
