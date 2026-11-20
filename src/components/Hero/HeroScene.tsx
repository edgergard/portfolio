import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Knot from './Knot';
import WineBackdrop from './WineBackdrop';
import type { ScenePointer } from './motion';

const BG = '#0A0A0B';
const FPS_INTERVAL_MS = 500;

type Props = {
  reducedMotion: boolean;
  onFps?: (fps: number) => void;
};

/** Studio reflections for the glossy knot: RoomEnvironment prefiltered through PMREM. */
const StudioEnvironment = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envMap = pmrem.fromScene(room, 0.04).texture;

    scene.environment = envMap;
    room.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      envMap.dispose();
    };
  }, [gl, scene]);

  return null;
};

/** With frameloop "never", draws one frame after mount and after every resize. */
const RenderOnce = () => {
  const advance = useThree((state) => state.advance);
  const size = useThree((state) => state.size);

  useEffect(() => {
    advance(performance.now());
  }, [advance, size]);

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

  // "demand" with nothing invalidating = paused; R3F still redraws on resize.
  const frameloop = reducedMotion ? 'never' : onScreen ? 'always' : 'demand';

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 32, position: [0, 0, 8], near: 0.1, far: 100 }}
        gl={{ toneMapping: ACESFilmicToneMapping }}
        frameloop={frameloop}
      >
        <color attach="background" args={[BG]} />
        <StudioEnvironment />
        <WineBackdrop pointer={pointer} animated={animated} />
        <Knot pointer={pointer} animated={animated} />
        {animated && onFps && <FpsMeter onFps={onFps} />}
        {reducedMotion && <RenderOnce />}
      </Canvas>
    </div>
  );
};

export default memo(HeroScene);
