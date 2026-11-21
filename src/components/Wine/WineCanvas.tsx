'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import WineBackdrop from '../Hero/WineBackdrop';
import { motionSpeed, type ScenePointer } from '../Hero/motion';
import { useOnScreen } from '../Hero/sceneSupport';
import { whenProgramsReady } from '../Hero/warmup';
import { useCurrentTheme } from '../../theme';
import { WINE_THEMES } from '../Hero/wineShader';


/** No pointer drift here: the glow stays centred, as in the hero when the pointer is away. */
const RESTING_POINTER = { current: { x: 0, y: 0, hovering: false } satisfies ScenePointer };

type Props = {
  reducedMotion: boolean;
};

/** Compiles the shader program in parallel, then calls onReady, so no frame blocks on a link. */
const Warmup = ({ onReady }: { onReady: () => void }) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    let alive = true;

    whenProgramsReady(gl, gl.compile(scene, camera), () => alive)
      .then((ok) => ok && onReady())
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('Wine canvas warm-up failed; keeping the CSS fill.', error);
      });

    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onReady]);

  return null;
};

/**
 * The hero's "Wine" backdrop on its own: the same shader plane (WineBackdrop: palette,
 * speed, warp, colour space), seen through the hero's camera, filling the parent.
 * Pauses off-screen and in hidden tabs. Lazy-loaded so three.js stays out of the main bundle.
 */
const WineCanvas = ({ reducedMotion }: Props) => {
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);
  const speed = motionSpeed(reducedMotion);
  const theme = useCurrentTheme();
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div ref={host} data-testid="wine-canvas-host" data-speed={speed} className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 32, position: [0, 0, 8], near: 0.1, far: 100 }}
        gl={{ toneMapping: ACESFilmicToneMapping }}
        // "demand" with nothing invalidating = paused; R3F still redraws on resize.
        frameloop={onScreen ? 'always' : 'demand'}
        // Transparent until the program is ready: the CSS fill underneath shows meanwhile.
        style={{ opacity: ready ? 1 : 0 }}
      >
        <color attach="background" args={[WINE_THEMES[theme].bg]} />
        <Warmup onReady={onReady} />
        <group visible={ready}>
          <WineBackdrop pointer={RESTING_POINTER} speed={speed} />
        </group>
      </Canvas>
    </div>
  );
};

export default memo(WineCanvas);
