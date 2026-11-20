import {
  Mesh,
  NoToneMapping,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { whenProgramsReady } from '../../Hero/warmup';
import { createWineUniforms, fragmentShader, vertexShader, WINE } from '../../Hero/wineShader';
import type { WineBufferRenderer } from './loop';

// Lazy chunk: imported only by wineButtons.load, so three.js stays out of the main bundle.

/** Size of the shared buffer the buttons copy from (2:1, like a wide pill). */
export const BUFFER_WIDTH = 512;
export const BUFFER_HEIGHT = 256;

/**
 * The patch of the hero's shader plane (in its UVs) the buffer shows: the vivid centre,
 * well inside the radial fade (which starts at 0.35 * radius from the centre), at 2:1.
 */
export const UV_WINDOW = { u: [0.25, 0.75], v: [0.375, 0.625] } as const;

/**
 * One offscreen WebGLRenderer drawing the hero's Wine shader (same uniforms, palette,
 * speed, warp, sRGB output) into a 512x256 buffer. Resolves once the program has linked,
 * so no frame blocks on a shader compile. Throws if no context can be created.
 */
export const createWineBufferRenderer = async (
  onLost: () => void,
): Promise<WineBufferRenderer> => {
  const gl = new WebGLRenderer({
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'low-power',
  });

  gl.setPixelRatio(1);
  gl.setSize(BUFFER_WIDTH, BUFFER_HEIGHT, false);
  gl.toneMapping = NoToneMapping;

  const uniforms = createWineUniforms();
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    toneMapped: false,
  });
  const geometry = new PlaneGeometry(2, 2);
  const uv = geometry.getAttribute('uv');

  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      UV_WINDOW.u[0] + uv.getX(i) * (UV_WINDOW.u[1] - UV_WINDOW.u[0]),
      UV_WINDOW.v[0] + uv.getY(i) * (UV_WINDOW.v[1] - UV_WINDOW.v[0]),
    );
  }

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);

  camera.position.z = 1;
  scene.add(new Mesh(geometry, material));

  let alive = true;
  const canvas = gl.domElement;
  const onContextLost = (event: Event) => {
    event.preventDefault();

    if (alive) {
      onLost();
    }
  };

  canvas.addEventListener('webglcontextlost', onContextLost);

  const dispose = () => {
    alive = false;
    canvas.removeEventListener('webglcontextlost', onContextLost);
    geometry.dispose();
    material.dispose();
    gl.dispose();
    gl.forceContextLoss();
  };

  try {
    if (!(await whenProgramsReady(gl, new Set(gl.compile(scene, camera)), () => alive))) {
      throw new Error('Wine button shader did not compile');
    }
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    source: canvas,
    width: BUFFER_WIDTH,
    height: BUFFER_HEIGHT,
    render: (time) => {
      uniforms.uTime.value = time * WINE.speed;
      gl.render(scene, camera);
    },
    dispose,
  };
};
