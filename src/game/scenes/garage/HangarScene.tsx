import { Suspense, useRef } from 'react';
import type { Group } from 'three';
import { Color } from 'three';
import { Html, OrbitControls, Stage } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

import { useGameStore } from '../../state/gameStore';

const pulseColor = new Color('#22d3ee');

export function HangarScene() {
  const vehicleName = useGameStore((state) => state.vehicle.name);

  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 6, 2]} intensity={30} color="#38bdf8" />
      <spotLight position={[-6, 8, -6]} angle={0.4} intensity={15} color="#f472b6" castShadow />

      <Stage
        adjustCamera
        environment="night"
        intensity={0.4}
        shadows={{ type: 'contact', color: '#020617', opacity: 0.6 }}
      >
        <Suspense fallback={null}>
          <ShowcaseVehicle name={vehicleName} />
        </Suspense>
      </Stage>

      <OrbitControls enablePan={false} />
    </>
  );
}

function ShowcaseVehicle({ name }: { name: string }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.001;
    groupRef.current.rotation.y = t * 0.3;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.5, 3.2]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.6, -0.5]}>
        <boxGeometry args={[1.6, 0.3, 1.4]} />
        <meshStandardMaterial color="#f472b6" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[1.7, 0.04, 16, 128]} />
        <meshBasicMaterial color={pulseColor} transparent opacity={0.4} />
      </mesh>
      <TextBillboard text={name} />
    </group>
  );
}

function TextBillboard({ text }: { text: string }) {
  return (
    <Html position={[0, 1.4, 0]} center>
      <div className="rounded-full border border-neon-blue/40 bg-black/70 px-6 py-2 text-sm uppercase tracking-[0.3em] text-neon-blue">
        {text}
      </div>
    </Html>
  );
}
