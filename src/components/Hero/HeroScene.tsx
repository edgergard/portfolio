import { memo, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, PMREMGenerator, type Material, type Texture, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Knot from './Knot';
import WineBackdrop from './WineBackdrop';
import type { ScenePointer } from './motion';

const BG = '#0A0A0B';
const FPS_INTERVAL_MS = 500;
/** Blur of the studio reflections (radians). */
const ENV_SIGMA = 0.04;

type Props = {
  reducedMotion: boolean;
  onFps?: (fps: number) => void;
};

type ProgramState = { currentProgram?: { isReady: () => boolean } };

/**
 * Runs draw() with renderer.render swapped for renderer.compile: every program the draw
 * would use starts compiling (in parallel, with KHR_parallel_shader_compile) for the same
 * render targets, but nothing is drawn and nothing waits for a shader link.
 */
const compileWithoutDrawing = (gl: WebGLRenderer, draw: () => void) => {
  const materials = new Set<Material>();
  const render = gl.render;

  gl.render = (object, camera) => {
    gl.compile(object, camera).forEach((material) => materials.add(material));
  };

  try {
    draw();
  } finally {
    gl.render = render;
  }

  return materials;
};

/** Resolves once every material's program has linked (same polling as compileAsync). */
const whenProgramsReady = (gl: WebGLRenderer, materials: Set<Material>) =>
  new Promise<void>((resolve) => {
    const check = () => {
      materials.forEach((material) => {
        const { currentProgram } = gl.properties.get(material) as ProgramState;

        if (!currentProgram || currentProgram.isReady()) {
          materials.delete(material);
        }
      });

      if (materials.size === 0) {
        resolve();
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });

/**
 * Prepares the scene without long main-thread stalls, then calls onReady:
 * 1. a dry PMREM pass starts compiling the room and prefilter programs, and we wait for them,
 * 2. the real PMREM pass builds the studio reflections for the glossy knot (programs are warm),
 * 3. the knot and backdrop programs (which depend on that env map) compile via compileAsync.
 * Until then the scene content stays hidden, so no frame blocks on a shader link.
 */
const SceneWarmup = ({ onReady }: { onReady: () => void }) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    let alive = true;
    let envMap: Texture | null = null;

    const run = async () => {
      const room = new RoomEnvironment();
      // Kept alive until the real pass is done, so the shared programs are not released.
      const dry = new PMREMGenerator(gl);

      const programs = compileWithoutDrawing(gl, () => dry.fromScene(room, ENV_SIGMA).dispose());

      await whenProgramsReady(gl, programs);

      if (alive) {
        const pmrem = new PMREMGenerator(gl);

        envMap = pmrem.fromScene(room, ENV_SIGMA).texture;
        pmrem.dispose();
        scene.environment = envMap;
      }

      dry.dispose();
      room.dispose();

      if (!alive) {
        return;
      }

      await gl.compileAsync(scene, camera);

      if (alive) {
        onReady();
      }
    };

    run();

    return () => {
      alive = false;
      scene.environment = null;
      envMap?.dispose();
    };
  }, [gl, scene, camera, onReady]);

  return null;
};

/** With frameloop "never", draws one frame after mount and after every resize. */
const RenderOnce = ({ ready }: { ready: boolean }) => {
  const advance = useThree((state) => state.advance);
  const size = useThree((state) => state.size);

  useEffect(() => {
    advance(performance.now());
  }, [advance, size, ready]);

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

    const onMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();

      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointer.current.hovering = true;
    };

    const onLeave = () => {
      pointer.current.hovering = false;
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, enabled]);

  return pointer;
};

const HeroScene = ({ reducedMotion, onFps }: Props) => {
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);
  const pointer = useHeroPointer(host, !reducedMotion);
  const animated = !reducedMotion;
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // "demand" with nothing invalidating = paused; R3F still redraws on resize.
  const frameloop = reducedMotion ? 'never' : onScreen ? 'always' : 'demand';

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
          <WineBackdrop pointer={pointer} animated={animated} />
          <Knot pointer={pointer} animated={animated} />
        </group>
        {ready && animated && onFps && <FpsMeter onFps={onFps} />}
        {reducedMotion && <RenderOnce ready={ready} />}
      </Canvas>
    </div>
  );
};

export default memo(HeroScene);
