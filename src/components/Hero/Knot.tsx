import { useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useCurrentTheme } from '../../theme';
import { damp, MAX_DT, stageScale, tiltTarget, type ScenePointer } from './motion';

/** TorusKnotGeometry(1, 0.34) spans ~1.84 units; this brings its radius to ~1.35. */
const KNOT_SCALE = 1.35 / 1.84;
const TILT_RATE = 3;
const REST = { x: 0, y: 0 };

/** Glossy obsidian in the dark theme, glossy porcelain white in the light theme. */
export const KNOT_MATERIAL = {
  dark: { color: '#050506', envMapIntensity: 2.2 },
  light: { color: '#F4F2F0', envMapIntensity: 1.1 },
} as const;

type Props = {
  pointer: MutableRefObject<ScenePointer>;
  /** Time multiplier: 1 normally, lower under reduced motion. */
  speed: number;
};

/** Glossy (2,3) torus knot, black or white with the theme: slow spin, gentle float, leans towards the pointer. */
const Knot = ({ pointer, speed }: Props) => {
  const mesh = useRef<Mesh>(null!);
  const tilt = useRef({ ...REST });
  const time = useRef(0);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const material = KNOT_MATERIAL[useCurrentTheme()];

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const t = (time.current += dt * speed);
    const { x, y, hovering } = pointer.current;
    const target = hovering ? tiltTarget(x, y) : REST;

    tilt.current.x = damp(tilt.current.x, target.x, TILT_RATE, dt);
    tilt.current.y = damp(tilt.current.y, target.y, TILT_RATE, dt);

    mesh.current.rotation.set(tilt.current.x + t * 0.12, tilt.current.y + t * 0.18, 0);
    mesh.current.position.y = Math.sin(t * 0.8) * 0.06;
  });

  return (
    <group scale={stageScale(aspect)}>
      <mesh ref={mesh} scale={KNOT_SCALE}>
        <torusKnotGeometry args={[1, 0.34, 420, 72, 2, 3]} />
        <meshPhysicalMaterial
          color={material.color}
          metalness={0.2}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={material.envMapIntensity}
          specularIntensity={1}
        />
      </mesh>
    </group>
  );
};

export default Knot;
