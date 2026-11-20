import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, type Texture } from 'three';
import Knot from './Knot';
import WineBackdrop from './WineBackdrop';
import { motionSpeed } from './motion';
import { useOnScreen } from './sceneSupport';
import { useHeroPointer } from './useHeroPointer';
import { buildStudioEnvironment, whenProgramsReady } from './warmup';

const BG = '#0A0A0B';
const FPS_INTERVAL_MS = 500;

type Props = {
  reducedMotion: boolean;
  onFps?: (fps: number) => void;
};

/**
 * Prepares the scene without long main-thread stalls, then calls onReady:
 * 1. builds the studio reflections with warm programs (see buildStudioEnvironment),
 * 2. compiles the knot and backdrop programs (which depend on that env map) in parallel.
 * Until then the scene content stays hidden, so no frame blocks on a shader link.
 * Unmounting stops every wait; a failure leaves the gradient underneath in place.
 */
const SceneWarmup = ({ onReady }: { onReady: () => void }) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    let alive = true;
    let envMap: Texture | null = null;
    const isAlive = () => alive;

    const run = async () => {
      const studio = await buildStudioEnvironment(gl, isAlive);

      if (!studio) {
        return;
      }

      if (!alive) {
        studio.dispose();

        return;
      }

      envMap = studio;
      scene.environment = studio;

      if (await whenProgramsReady(gl, gl.compile(scene, camera), isAlive)) {
        onReady();
      }
    };

    run().catch((error: unknown) => {
      // eslint-disable-next-line no-console
      console.warn('Hero scene warm-up failed; keeping the gradient.', error);
    });

    return () => {
      alive = false;
      scene.environment = null;
      envMap?.dispose();
    };
  }, [gl, scene, camera, onReady]);

  return null;
};

const FpsMeter = ({ onFps }: { onFps: (fps: number) => void }) => {
  const frames = useRef(0);
  const since = useRef(performance.now());

  useFrame(() => {
    frames.current += 1;
    const now = performance.now();
    const elapsed = now - since.current;

    if (elapsed < FPS_INTERVAL_MS) {
      return;
    }

    // A long gap means the loop was paused; start a fresh sample instead of reporting a dip.
    if (elapsed < FPS_INTERVAL_MS * 4) {
      onFps(Math.round((frames.current * 1000) / elapsed));
    }

    frames.current = 0;
    since.current = now;
  });

  return null;
};

const HeroScene = ({ reducedMotion, onFps }: Props) => {
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);
  // Pointer tilt and drift work the same under reduced motion; only the pace is gentler.
  const pointer = useHeroPointer(host);
  const speed = motionSpeed(reducedMotion);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // "demand" with nothing invalidating = paused; R3F still redraws on resize.
  const frameloop = onScreen ? 'always' : 'demand';

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 32, position: [0, 0, 8], near: 0.1, far: 100 }}
        gl={{ toneMapping: ACESFilmicToneMapping }}
        frameloop={frameloop}
        // Transparent until warm-up is done: the gradient underneath shows instead of a blank frame.
        style={{ opacity: ready ? 1 : 0 }}
      >
        <color attach="background" args={[BG]} />
        <SceneWarmup onReady={onReady} />
        <group visible={ready}>
          <WineBackdrop pointer={pointer} speed={speed} />
          <Knot pointer={pointer} speed={speed} />
        </group>
        {ready && onFps && <FpsMeter onFps={onFps} />}
      </Canvas>
    </div>
  );
};

export default memo(HeroScene);
