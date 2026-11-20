import { memo, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, type Texture } from 'three';
import Knot from './Knot';
import WineBackdrop from './WineBackdrop';
import { motionSpeed, type ScenePointer } from './motion';
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

/** True while the element intersects the viewport and the tab is visible. */
const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const [intersecting, setIntersecting] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const onChange = () => setPageVisible(!document.hidden);

    document.addEventListener('visibilitychange', onChange);

    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return intersecting && pageVisible;
};

/**
 * Tracks the pointer anywhere over the hero section, in NDC of the canvas panel,
 * so the knot reacts while the visitor reads the text column too.
 */
const useHeroPointer = (ref: RefObject<HTMLElement>, enabled: boolean) => {
  const pointer = useRef<ScenePointer>({ x: 0, y: 0, hovering: false });

  useEffect(() => {
    const panel = ref.current;
    const hero = panel?.closest('section') ?? panel;

    if (!enabled || !panel || !hero) {
      return;
    }

    const state = pointer.current;
    const onMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();

      state.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      state.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      state.hovering = true;
    };

    const onLeave = () => {
      state.hovering = false;
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      // Settle back to rest if tracking stops (e.g. reduced motion switched on mid-hover).
      state.hovering = false;
    };
  }, [ref, enabled]);

  return pointer;
};

const HeroScene = ({ reducedMotion, onFps }: Props) => {
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);
  // Reduced motion: no pointer tilt or drift, and everything moves at a calmer pace.
  const pointer = useHeroPointer(host, !reducedMotion);
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
