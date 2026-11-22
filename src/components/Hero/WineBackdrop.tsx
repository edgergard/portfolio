import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Vector2 } from 'three';
import { damp, MAX_DT, type ScenePointer } from './motion';
import { useCurrentTheme } from '../../theme';
import { applyWineTheme, createWineUniforms, fragmentShader, vertexShader, WINE } from './wineShader';

const FOLLOW_RATE = 2;
const PLANE_Z = -2.5;
const PLANE_SIZE = 9;
/** How far (in UV) the glow centre drifts towards the pointer. */
const FOLLOW_REACH = 0.12;

type Props = {
  pointer: MutableRefObject<ScenePointer>;
  /** Time multiplier: 1 normally, lower under reduced motion. */
  speed: number;
};

/** The animated "Wine" glow: a shader plane behind the knot that fills the panel (palette per theme). */
const WineBackdrop = ({ pointer, speed }: Props) => {
  const uniforms = useMemo(createWineUniforms, []);
  const theme = useCurrentTheme();

  useEffect(() => applyWineTheme(uniforms, theme), [uniforms, theme]);
  const time = useRef(0);
  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);
  // Keep the square plane at its designed size, but grow it on wide panels (tablet) so it always fills.
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, PLANE_Z]);
  const scale = Math.max(1, (Math.max(width, height) * 1.02) / PLANE_SIZE);

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DT);

    time.current += dt * speed;
    uniforms.uTime.value = time.current * WINE.speed;

    const { x, y, hovering } = pointer.current;
    const mouse = uniforms.uMouse.value as Vector2;

    mouse.set(
      damp(mouse.x, hovering ? 0.5 + x * FOLLOW_REACH : 0.5, FOLLOW_RATE, dt),
      damp(mouse.y, hovering ? 0.5 + y * FOLLOW_REACH : 0.5, FOLLOW_RATE, dt),
    );
  });

  return (
    <mesh position-z={PLANE_Z} scale={scale}>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
      {/* Constructed with our uniforms object (args), not given it as a prop: R3F 9 copies a
          `uniforms` prop into fresh objects, so the per-frame uTime/uMouse writes and the theme
          palette above would never reach the material and the wine would freeze. */}
      <shaderMaterial
        args={[{ uniforms, vertexShader, fragmentShader }]}
        toneMapped={false}
      />
    </mesh>
  );
};

export default WineBackdrop;
