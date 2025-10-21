import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { Group } from 'three';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Vector3
} from 'three';
import { GradientTexture, Stars, Stats, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

import { useKeyboardControls } from '../../../core/input/keyboard';
import { useGameStore } from '../../state/gameStore';
import { useRaceTelemetry } from '../../state/raceTelemetry';
import { createTrackCurve } from '../../world/trackLayouts';

const DEFAULT_ZONE_SPAN = 0.06;
const DEFAULT_RECHARGE_POINTS = [0.15, 0.67];
const DEFAULT_REPAIR_POINTS = [0.34, 0.84];

export function RaceScene() {
  const race = useGameStore((state) => state.race);
  const resetTelemetry = useRaceTelemetry((state) => state.reset);
  const completeEvent = useGameStore((state) => state.completeEvent);
  const setScene = useGameStore((state) => state.setScene);
  const startNextEvent = useGameStore((state) => state.startNextEvent);
  const trackData = race ? race.planet.tracks[race.trackIndex] : null;
  const zoneSpan = DEFAULT_ZONE_SPAN;
  const playerPosition = useRaceTelemetry((state) => state.position);
  const aiRacerCount = 19;
  const aiStateRef = useRef<AIShipState[]>([]);
  const aiGroupsRef = useRef<Group[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [startStage, setStartStage] = useState<StartStage>('idle');

  const rechargePoints = useMemo(
    () =>
      trackData?.rechargeZones?.length
        ? [...trackData.rechargeZones]
        : [...DEFAULT_RECHARGE_POINTS],
    [trackData]
  );
  const repairPoints = useMemo(
    () =>
      trackData?.repairZones?.length
        ? [...trackData.repairZones]
        : [...DEFAULT_REPAIR_POINTS],
    [trackData]
  );
  const rechargeZones = useMemo(() => createZones(rechargePoints, zoneSpan), [rechargePoints, zoneSpan]);
  const repairZones = useMemo(() => createZones(repairPoints, zoneSpan), [repairPoints, zoneSpan]);

  useEffect(() => {
    resetTelemetry(race?.laps ?? 3);
  }, [resetTelemetry, race]);

  const trackCurve = useMemo(() => {
    const trackId = trackData?.id ?? race?.trackId ?? null;
    return createTrackCurve(trackId, 96);
  }, [race?.trackId, trackData?.id]);

  if (aiStateRef.current.length === 0) {
    aiStateRef.current = new Array(aiRacerCount).fill(0).map((_, index) => {
      const baseOffset = 0.015 + index * 0.02;
      const baseSpeed = 0.16 + Math.random() * 0.05;
      const color = new Color().setHSL(0.58 + index * 0.07, 0.7, 0.52);
      return {
        offset: baseOffset,
        speed: baseSpeed,
        baseSpeed,
        color,
        boostTimer: 0,
        lateralOffset: (index % 2 === 0 ? -1 : 1) * (0.28 + Math.random() * 0.28),
        launchDelay: 0.2 + Math.random() * 0.6
      };
    });
  }

  useEffect(() => {
    aiStateRef.current = new Array(aiRacerCount).fill(0).map((_, index) => {
      const baseOffset = 0.015 + index * 0.02;
      const baseSpeed = 0.16 + Math.random() * 0.05;
      const color = new Color().setHSL(0.58 + index * 0.07, 0.7, 0.52);
      return {
        offset: baseOffset,
        speed: baseSpeed,
        baseSpeed,
        color,
        boostTimer: 0,
        lateralOffset: (index % 2 === 0 ? -1 : 1) * (0.28 + Math.random() * 0.28),
        launchDelay: 0.2 + Math.random() * 0.6
      };
    });
  }, [race?.trackId, aiRacerCount]);

  useEffect(() => {
    const timeouts: number[] = [];
    const schedule = (delay: number, stage: StartStage, callback?: () => void) => {
      const timeout = window.setTimeout(() => {
        setStartStage(stage);
        callback?.();
      }, delay);
      timeouts.push(timeout);
    };

    setRaceStarted(false);
    setStartStage('idle');
    aiStateRef.current.forEach((racer, index) => {
      racer.offset = 0.015 + index * 0.02;
      racer.speed = racer.baseSpeed;
      racer.boostTimer = 0;
      racer.launchDelay = 0.2 + Math.random() * 0.6;
    });

    schedule(600, 'red1');
    schedule(1400, 'red2');
    schedule(2200, 'red3');
    schedule(3000, 'green', () => setRaceStarted(true));
    schedule(4500, 'idle');

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [trackCurve]);

  const handleFinish = useCallback(() => {
    completeEvent(playerPosition);
    startNextEvent();
    setScene('garage');
  }, [completeEvent, playerPosition, setScene, startNextEvent]);

  return (
    <>
      <fog attach="fog" args={['#020617', 12, 140]} />
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#3b5bdb', '#020924', 0.4]} />
      <directionalLight
        position={[18, 28, 22]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight position={[-12, 22, -14]} intensity={1.1} angle={0.5} penumbra={0.8} />
      <Stars radius={200} count={2000} factor={3} fade speed={1} />

      <HorizonBackdrop />
      <Stats showPanel={0} />
      <RaceStartLights stage={startStage} />
      <RaceCameraRig curve={trackCurve} />
      <TrackEnvironment
        curve={trackCurve}
        rechargePoints={rechargePoints}
        repairPoints={repairPoints}
      />
      <RaceCar
        curve={trackCurve}
        onFinish={handleFinish}
        rechargeZones={rechargeZones}
        repairZones={repairZones}
        aiStateRef={aiStateRef}
        raceStarted={raceStarted}
      />
      <AIShips curve={trackCurve} aiStateRef={aiStateRef} groupsRef={aiGroupsRef} raceStarted={raceStarted} />
    </>
  );
}

function TrackEnvironment({
  curve,
  rechargePoints,
  repairPoints
}: {
  curve: CatmullRomCurve3;
  rechargePoints: number[];
  repairPoints: number[];
}) {
  const trackData = useMemo(() => {
    const length = curve.getLength();
    const segments = Math.max(1024, Math.ceil(length / 4));
    return {
      ribbon: buildTrackRibbon(curve, 12, segments),
      length
    };
  }, [curve]);
  const track = trackData.ribbon;
  const groundSize = Math.max(3000, trackData.length * 0.8);
  const zoneMarkers = useMemo(() => {
    const markers: Array<{ position: Vector3; rotationY: number; type: 'fuel' | 'repair' }> = [];
    const convert = (value: number, type: 'fuel' | 'repair') => {
      const mid = ((value % 1) + 1) % 1;
      const point = curve.getPointAt(mid);
      const tangent = curve.getTangentAt(mid).normalize();
      const rotationY = Math.atan2(tangent.x, tangent.z);
      markers.push({
        position: point.clone(),
        rotationY,
        type
      });
    };
    rechargePoints.forEach((zone) => convert(zone, 'fuel'));
    repairPoints.forEach((zone) => convert(zone, 'repair'));
    return markers;
  }, [curve, rechargePoints, repairPoints]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      <mesh geometry={track.geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#1f3c88"
          metalness={0.12}
          roughness={0.58}
          emissive="#1d4ed8"
          emissiveIntensity={0.25}
        />
      </mesh>

      {track.leftEdge.map((point, index) => {
        if (index % 32 !== 0) return null;
        return (
          <mesh key={`left-${index}`} position={point.toArray()}>
            <boxGeometry args={[0.6, 1.2, 2]} />
            <meshStandardMaterial color="#facc15" emissive="#fbbf24" emissiveIntensity={0.45} />
          </mesh>
        );
      })}

      {track.rightEdge.map((point, index) => {
        if (index % 32 !== 0) return null;
        return (
          <mesh key={`right-${index}`} position={point.toArray()}>
            <boxGeometry args={[0.6, 1.2, 2]} />
            <meshStandardMaterial color="#38bdf8" emissive="#60a5fa" emissiveIntensity={0.45} />
          </mesh>
        );
      })}

      {zoneMarkers.map((marker, index) => (
        <mesh
          key={`zone-${marker.type}-${index}`}
          position={[marker.position.x, marker.position.y + 0.06, marker.position.z]}
          rotation={[-Math.PI / 2, 0, marker.rotationY]}
        >
          <planeGeometry args={[4, 1.6]} />
          <meshBasicMaterial
            color={marker.type === 'fuel' ? '#fb923c' : '#22c55e'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function RaceCar({
  curve,
  onFinish,
  rechargeZones,
  repairZones,
  aiStateRef,
  raceStarted
}: {
  curve: CatmullRomCurve3;
  onFinish: () => void;
  rechargeZones: Zone[];
  repairZones: Zone[];
  aiStateRef: MutableRefObject<AIShipState[]>;
  raceStarted: boolean;
}) {
  const input = useKeyboardControls();
  const carRef = useRef<Group>(null);
  const glowRef = useRef<Group>(null);
  const velocity = useRef(0);
  const progress = useRef(0);
  const previousProgress = useRef(0);
  const lap = useRef(1);
  const completedLaps = useRef(0);
  const lapTimer = useRef(0);
  const bestLap = useRef(0);
  const finished = useRef(false);
  const finishNotified = useRef(false);
  const lateralOffset = useRef(0);
  const lateralVelocity = useRef(0);
  const fuel = useRef(100);
  const armor = useRef(100);
  const fuelCapacity = useRef(100);
  const armorCapacity = useRef(100);
  const fuelModifier = useRef(1);
  const armorMitigation = useRef(1);
  const inRechargeZone = useRef(false);
  const inRepairZone = useRef(false);
  const collisionCooldown = useRef(0);
  const updateTelemetry = useRaceTelemetry((state) => state.update);
  const totalLaps = useRaceTelemetry((state) => state.totalLaps);
  const raceStartedRef = useRef(false);

  const vehicle = useGameStore((state) => state.vehicle);

  useEffect(() => {
    const energyScale = Math.max(0.2, vehicle.energy);
    const durabilityScale = Math.max(0.2, vehicle.durability);
    fuelCapacity.current = 110 + energyScale * 80;
    armorCapacity.current = 110 + durabilityScale * 90;
    fuelModifier.current = Math.max(0.45, 1 - energyScale * 0.4);
    armorMitigation.current = Math.max(0.4, 1 - durabilityScale * 0.6);
    progress.current = 0;
    velocity.current = 0;
    previousProgress.current = 0;
    lap.current = 1;
    completedLaps.current = 0;
    lapTimer.current = 0;
    bestLap.current = 0;
    finished.current = false;
    finishNotified.current = false;
    lateralOffset.current = 0;
    lateralVelocity.current = 0;
    fuel.current = fuelCapacity.current;
    armor.current = armorCapacity.current;
    inRechargeZone.current = false;
    inRepairZone.current = false;
    collisionCooldown.current = 0;
  }, [curve, vehicle, rechargeZones, repairZones]);

  useEffect(() => {
    raceStartedRef.current = raceStarted;
    if (!raceStarted) {
      velocity.current = 0;
      lapTimer.current = 0;
    }
  }, [raceStarted]);

  useFrame((_, delta) => {
    const hasStarted = raceStartedRef.current;
    if (finished.current) {
      velocity.current = Math.max(0, velocity.current - 40 * delta);
    }

    const accelInput = hasStarted ? Math.max(0, input.accelerate) : 0;
    const brakeInput = hasStarted ? Math.max(0, input.brake) : 0;
    const accel = accelInput - brakeInput;
    const topSpeedStat = Math.max(200, vehicle.topSpeed);
    const boostMultiplier = input.boost ? 1 + vehicle.boostPower : 1;
    const baseTopSpeed = topSpeedStat * boostMultiplier;
    const accelerationScale = MathUtils.clamp(vehicle.acceleration / 2.2, 0.7, 1.8);
    const handlingScale = MathUtils.clamp(0.6 + vehicle.handling * 0.5, 0.7, 2);
    const durabilityScale = MathUtils.clamp(0.5 + vehicle.durability * 0.6, 0.6, 1.8);
    const maxAcceleration =
      (input.boost ? 70 : 48) *
      accelerationScale *
      (0.55 + (armor.current / Math.max(1, armorCapacity.current)) * 0.6);
    const friction = 14 / accelerationScale;

    collisionCooldown.current = Math.max(0, collisionCooldown.current - delta);

    const damageFactor = MathUtils.clamp(
      0.5 + (armor.current / Math.max(1, armorCapacity.current)) * durabilityScale,
      0.4,
      1.2
    );
    let effectiveTopSpeed = baseTopSpeed * Math.min(1, Math.max(0.4, damageFactor));

    if (fuel.current <= 0.5) {
      effectiveTopSpeed = Math.min(effectiveTopSpeed, 60);
    }

    if (!finished.current) {
      if (hasStarted) {
        velocity.current += accel * maxAcceleration * delta;
        velocity.current -= Math.sign(velocity.current) * friction * delta;
        velocity.current = Math.max(Math.min(velocity.current, effectiveTopSpeed), -60);
        if (accelInput <= 0 && velocity.current > 0) {
          velocity.current = Math.max(0, velocity.current - 28 * delta);
        }
      } else {
        velocity.current = Math.max(0, velocity.current - 36 * delta);
      }
    }

    if (hasStarted || finished.current) {
      progress.current = (progress.current + velocity.current * delta * 0.0008) % 1;
      if (progress.current < 0) progress.current += 1;
    }

    if (hasStarted) {
      lateralVelocity.current += -input.steer * 22 * handlingScale * delta;
      lateralVelocity.current -= lateralVelocity.current * (4 + handlingScale * 3.4) * delta;
      lateralOffset.current += lateralVelocity.current * delta * 3;
    } else {
      lateralVelocity.current = MathUtils.lerp(lateralVelocity.current, 0, Math.min(1, delta * 8));
      lateralOffset.current = MathUtils.lerp(lateralOffset.current, 0, Math.min(1, delta * 10));
    }

    const lateralLimit = 3.6 + handlingScale * 0.4;
    lateralOffset.current = MathUtils.clamp(lateralOffset.current, -lateralLimit, lateralLimit);

    if (hasStarted && !finished.current) {
      lapTimer.current += delta;
    }

    if (previousProgress.current > 0.95 && progress.current < 0.05) {
      const completedLap = lapTimer.current;
      if (bestLap.current === 0 || completedLap < bestLap.current) {
        bestLap.current = completedLap;
      }
      completedLaps.current += 1;
      lap.current = Math.min(completedLaps.current + 1, totalLaps);
      lapTimer.current = 0;

      if (completedLaps.current >= totalLaps) {
        finished.current = true;
      }
    }

    previousProgress.current = progress.current;

    const rechargeZone = isInZone(progress.current, rechargeZones);
    if (hasStarted && rechargeZone && !inRechargeZone.current) {
      fuel.current = Math.min(fuelCapacity.current, fuel.current + fuelCapacity.current * 0.35);
    }
    inRechargeZone.current = rechargeZone;

    const repairZone = isInZone(progress.current, repairZones);
    if (hasStarted && repairZone && !inRepairZone.current) {
      armor.current = Math.min(armorCapacity.current, armor.current + armorCapacity.current * 0.3);
    }
    inRepairZone.current = repairZone;

    const speedAbs = Math.abs(velocity.current);
    if (hasStarted && speedAbs > 1 && fuel.current > 0) {
      const boostPenalty = input.boost ? vehicle.boostPower * 25 : 0;
      const consumptionRate =
        (3.5 + speedAbs * 0.016 + boostPenalty) * fuelModifier.current;
      fuel.current = Math.max(0, fuel.current - consumptionRate * delta);
    }

    const trackPoint = curve.getPointAt(progress.current);
    const nextPoint = curve.getPointAt((progress.current + 0.01) % 1);
    const direction = nextPoint.clone().sub(trackPoint).normalize();
    const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
    const up = new Vector3().crossVectors(direction, right).normalize();

    const carPosition = trackPoint
      .clone()
      .addScaledVector(right, lateralOffset.current)
      .addScaledVector(up, 0.7);
    const lookTarget = trackPoint
      .clone()
      .add(direction.clone().multiplyScalar(18))
      .addScaledVector(up, 0.8);
    if (carRef.current) {
      carRef.current.position.copy(carPosition);
      carRef.current.up.copy(up);
      carRef.current.lookAt(lookTarget);
    }

    const guardThreshold = lateralLimit - 0.2;
    if (hasStarted && !finished.current && Math.abs(lateralOffset.current) > guardThreshold) {
      if (collisionCooldown.current <= 0) {
        const damage = (6 + Math.abs(velocity.current) * 0.028) * armorMitigation.current;
        armor.current = Math.max(0, armor.current - damage);
        velocity.current *= 0.65;
        lateralVelocity.current = -Math.sign(lateralOffset.current) * Math.max(8, Math.abs(lateralVelocity.current) + 4);
        collisionCooldown.current = 0.8;
      }
    }

    if (glowRef.current) {
      glowRef.current.position.copy(carRef.current?.position ?? carPosition);
    }

    const telemetryPayload = {
      speed: Math.max(0, velocity.current),
      progress: progress.current,
      lap: finished.current ? totalLaps : lap.current,
      lapTime: lapTimer.current,
      bestLap: bestLap.current || 0,
      position: 1,
      fuel: (fuel.current / fuelCapacity.current) * 100,
      armor: (armor.current / armorCapacity.current) * 100,
      carPosition: [carPosition.x, carPosition.y, carPosition.z] as [number, number, number],
      carDirection: [direction.x, direction.y, direction.z] as [number, number, number]
    };

    updateTelemetry(telemetryPayload);

    if (hasStarted && !finished.current && velocity.current > 20) {
      const opponents = aiStateRef.current;
      for (const opponent of opponents) {
        const deltaProgress = ((opponent.offset - progress.current + 1) % 1 + 1) % 1;
        if (deltaProgress > 0.5) continue;
        if (deltaProgress < 0.01) {
          const opponentPoint = curve.getPointAt(opponent.offset);
          const distance = opponentPoint.distanceTo(trackPoint);
          if (distance < 1.6) {
            const impactScale = Math.min(1, Math.abs(velocity.current) / 260);
            opponent.boostTimer = 1.4 * impactScale;
            opponent.speed += 0.08 * impactScale;
            velocity.current *= Math.max(0.35, 1 - impactScale * 0.65);
            lateralVelocity.current += (Math.random() - 0.5) * 6;
            armor.current = Math.max(0, armor.current - 8 * impactScale);
            break;
          }
        }
      }
    }

    if (finished.current && !finishNotified.current && velocity.current < 5) {
      finishNotified.current = true;
      onFinish();
    }
  });

  return (
    <>
      <group ref={carRef} position={[0, 0.75, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.45, 2.8]} />
          <meshStandardMaterial
            color="#f472b6"
            metalness={0.7}
            roughness={0.25}
            emissive="#be185d"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, 0.46, -0.54]}>
          <boxGeometry args={[1.5, 0.32, 1.1]} />
          <meshStandardMaterial
            color="#0ea5e9"
            metalness={0.85}
            roughness={0.18}
            emissive="#22d3ee"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, 0.74, -1.04]}>
          <boxGeometry args={[0.9, 0.45, 0.9]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.85}
            roughness={0.2}
            emissive="#38bdf8"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0, 0.16, 1.88]}>
          <boxGeometry args={[1.1, 0.12, 0.42]} />
          <meshStandardMaterial color="#facc15" emissive="#fde047" emissiveIntensity={0.7} />
        </mesh>
        <pointLight position={[0, 1.4, 0]} intensity={1.8} distance={12} color="#22d3ee" />
        <pointLight position={[0, 0.8, -1.6]} intensity={2.1} distance={14} color="#f472b6" />
      </group>
      <group ref={glowRef}>
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.18} />
        </mesh>
      </group>
    </>
  );
}

function RaceStartLights({ stage }: { stage: StartStage }) {
  const carPosition = useRaceTelemetry((state) => state.carPosition);
  const carDirection = useRaceTelemetry((state) => state.carDirection);
  const groupRef = useRef<Group>(null);
  const targetPosition = useRef(new Vector3());
  const forwardVector = useRef(new Vector3());
  const upVector = useMemo(() => new Vector3(0, 1, 0), []);
  const offsetVector = useRef(new Vector3());
  const lookTarget = useRef(new Vector3());

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.visible = stage !== 'idle';
    }
  }, [stage]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    forwardVector.current.set(carDirection[0], carDirection[1], carDirection[2]);
    if (forwardVector.current.lengthSq() < 1e-6) {
      forwardVector.current.set(0, 0, 1);
    } else {
      forwardVector.current.normalize();
    }

    targetPosition.current.set(carPosition[0], carPosition[1], carPosition[2]);
    offsetVector.current
      .copy(forwardVector.current)
      .multiplyScalar(8)
      .addScaledVector(upVector, 3);
    targetPosition.current.add(offsetVector.current);

    const smoothing = 1 - Math.pow(0.08, delta * 60);
    group.position.lerp(targetPosition.current, smoothing);

    lookTarget.current
      .copy(targetPosition.current)
      .addScaledVector(forwardVector.current, -8);
    group.lookAt(lookTarget.current);
  });

  const activeIndex = START_STAGE_INDEX[stage];
  const isGreenPhase = stage === 'green';

  return (
    <group ref={groupRef} visible={stage !== 'idle'}>
      {START_LIGHT_COLORS.map((color, index) => {
        const shouldLight =
          isGreenPhase ? index === 3 : activeIndex >= index && index < 3 && activeIndex >= 0;
        const emissiveIntensity = shouldLight ? (index === 3 ? 1.6 : 1.2) : 0.08;
        const opacity = shouldLight ? 1 : 0.3;
        return (
          <mesh key={color + index} position={[index * 2.1 - 3.15, 0, 0]}>
            <sphereGeometry args={[0.6, 24, 24]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
      {stage === 'green' && (
        <Text position={[0, -1.8, 0]} fontSize={0.9} color="#22c55e" anchorX="center" anchorY="top">
          VERDE!
        </Text>
      )}
    </group>
  );
}

function RaceCameraRig({ curve }: { curve: CatmullRomCurve3 }) {
  const camera = useThree((state) => state.camera);
  const carPosition = useRaceTelemetry((state) => state.carPosition);
  const carDirection = useRaceTelemetry((state) => state.carDirection);
  const progress = useRaceTelemetry((state) => state.progress);
  const worldUp = useMemo(() => new Vector3(0, 1, 0), []);
  const target = useRef(new Vector3());
  const offset = useRef(new Vector3(0, 6, -15));
  const desired = useRef(new Vector3());
  const followPosition = useRef(new Vector3());
  const forwardVector = useRef(new Vector3());
  const rightVector = useRef(new Vector3(1, 0, 0));
  const upVector = useRef(new Vector3(0, 1, 0));

  useFrame(() => {
    followPosition.current.set(carPosition[0], carPosition[1], carPosition[2]);
    forwardVector.current.set(carDirection[0], carDirection[1], carDirection[2]);

    if (forwardVector.current.lengthSq() < 1e-6) {
      const clampedProgress = ((progress % 1) + 1) % 1;
      const fallbackPoint = curve.getPointAt(clampedProgress);
      const fallbackNext = curve.getPointAt((clampedProgress + 0.01) % 1);
      followPosition.current.copy(fallbackPoint);
      forwardVector.current.copy(fallbackNext.sub(fallbackPoint)).normalize();
    } else {
      forwardVector.current.normalize();
    }

    rightVector.current.crossVectors(worldUp, forwardVector.current);
    if (rightVector.current.lengthSq() < 1e-6) {
      rightVector.current.set(1, 0, 0);
    } else {
      rightVector.current.normalize();
    }
    upVector.current.crossVectors(forwardVector.current, rightVector.current).normalize();

    desired.current
      .copy(followPosition.current)
      .addScaledVector(rightVector.current, offset.current.x)
      .addScaledVector(upVector.current, offset.current.y)
      .addScaledVector(forwardVector.current, offset.current.z);

    target.current
      .copy(followPosition.current)
      .addScaledVector(forwardVector.current, 20)
      .addScaledVector(upVector.current, 2);

    camera.position.copy(desired.current);
    camera.up.copy(upVector.current);
    camera.lookAt(target.current);
  });

  return null;
}

function HorizonBackdrop() {
  return (
    <group>
      <mesh position={[0, 45, -120]}>
        <planeGeometry args={[320, 160]} />
        <meshBasicMaterial toneMapped={false}>
          <GradientTexture
            stops={[0, 0.35, 0.6, 1]}
            colors={['#030712', '#111c44', '#4c1d95', '#8b5cf6']}
            size={64}
          />
        </meshBasicMaterial>
      </mesh>
      <mesh position={[0, -8, -90]} rotation={[-Math.PI / 2.1, 0, 0]}>
        <planeGeometry args={[420, 420]} />
        <meshBasicMaterial color="#020617" toneMapped={false} />
      </mesh>
    </group>
  );
}

function AIShips({
  curve,
  aiStateRef,
  groupsRef,
  raceStarted
}: {
  curve: CatmullRomCurve3;
  aiStateRef: MutableRefObject<AIShipState[]>;
  groupsRef: MutableRefObject<Group[]>;
  raceStarted: boolean;
}) {
  const raceStartedRef = useRef(raceStarted);

  useEffect(() => {
    raceStartedRef.current = raceStarted;
  }, [raceStarted]);

  useFrame((_, delta) => {
    aiStateRef.current.forEach((racer, index) => {
      const group = groupsRef.current[index];
      if (!group) return;
      const hasStarted = raceStartedRef.current;

      if (hasStarted) {
        if (racer.launchDelay > 0) {
          racer.launchDelay = Math.max(0, racer.launchDelay - delta);
        } else {
          if (racer.boostTimer > 0) {
            racer.boostTimer -= delta;
            racer.speed = Math.min(racer.speed + delta * 0.3, racer.baseSpeed + 0.12);
          } else {
            racer.speed = Math.max(racer.baseSpeed, racer.speed - delta * 0.2);
          }
          racer.offset = (racer.offset + racer.speed * delta * 0.02) % 1;
        }
      } else {
        racer.speed = racer.baseSpeed;
      }

      const centerPoint = curve.getPointAt(racer.offset);
      const nextPoint = curve.getPointAt((racer.offset + 0.01) % 1);
      const direction = nextPoint.clone().sub(centerPoint).normalize();
      const right = new Vector3().crossVectors(direction, new Vector3(0, 1, 0)).normalize();
      const up = new Vector3().crossVectors(right, direction).normalize();
      group.position
        .copy(centerPoint)
        .addScaledVector(right, racer.lateralOffset)
        .addScaledVector(up, 0.8);
      group.lookAt(centerPoint.clone().add(direction.multiplyScalar(6)));
      group.rotation.z = Math.sin(performance.now() * 0.001 + index) * 0.08;
    });
  });

  return (
    <group>
      {aiStateRef.current.map((racer, index) => (
        <group
          key={index}
          ref={(instance) => {
            if (instance) groupsRef.current[index] = instance;
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.26, 1.8]} />
            <meshStandardMaterial color={racer.color} metalness={0.7} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.22, -0.44]}>
            <boxGeometry args={[0.65, 0.42, 0.7]} />
            <meshStandardMaterial color={racer.color.clone().offsetHSL(0, 0, 0.2)} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface Zone {
  start: number;
  end: number;
}

type StartStage = 'idle' | 'red1' | 'red2' | 'red3' | 'green';

const START_STAGE_INDEX: Record<StartStage, number> = {
  idle: -1,
  red1: 0,
  red2: 1,
  red3: 2,
  green: 3
};

const START_LIGHT_COLORS = ['#ef4444', '#ef4444', '#ef4444', '#22c55e'] as const;

interface AIShipState {
  offset: number;
  speed: number;
  baseSpeed: number;
  color: Color;
  boostTimer: number;
  lateralOffset: number;
  launchDelay: number;
}

function createZones(points: number[], span: number): Zone[] {
  const half = Math.min(Math.max(span / 2, 0.001), 0.5);
  return points.map((value) => {
    const normalized = ((value % 1) + 1) % 1;
    const start = (normalized - half + 1) % 1;
    const end = (normalized + half) % 1;
    return { start, end };
  });
}

function isInZone(progress: number, zones: Zone[]) {
  return zones.some((zone) => {
    if (zone.start <= zone.end) {
      return progress >= zone.start && progress <= zone.end;
    }
    return progress >= zone.start || progress <= zone.end;
  });
}

function buildTrackRibbon(curve: CatmullRomCurve3, width: number, segments: number) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const leftEdge: Vector3[] = [];
  const rightEdge: Vector3[] = [];
  const up = new Vector3(0, 1, 0);

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const right = new Vector3().crossVectors(up, tangent).normalize();

    const leftPoint = center.clone().addScaledVector(right, -width / 2);
    const rightPoint = center.clone().addScaledVector(right, width / 2);

    leftEdge.push(leftPoint.clone().addScaledVector(up, 0.6));
    rightEdge.push(rightPoint.clone().addScaledVector(up, 0.6));

    positions.push(leftPoint.x, leftPoint.y, leftPoint.z);
    positions.push(rightPoint.x, rightPoint.y, rightPoint.z);

    normals.push(up.x, up.y, up.z);
    normals.push(up.x, up.y, up.z);

    const v = t * 60;
    uvs.push(0, v);
    uvs.push(1, v);
  }

  for (let i = 0; i < segments; i += 1) {
    const base = i * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return {
    geometry,
    leftEdge,
    rightEdge
  };
}
