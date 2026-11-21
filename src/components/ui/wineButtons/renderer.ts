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
import { currentTheme } from '../../../theme';
import { applyWineTheme, createWineUniforms, fragmentShader, vertexShader, WINE, type WineTheme } from '../../Hero/wineShader';
import type { WineBufferRenderer } from './loop';

// Lazy chunk: imported only by wineButtons.load, so three.js stays out of the main bundle.

/** Size of the shared buffer the buttons copy from (2:1, like a wide pill). */
export const BUFFER_WIDTH = 512;
export const BUFFER_HEIGHT = 256;

/**
 * How much of the hero's shader plane (in UV) one CSS pixel of the hero panel shows on a
 * 1440x900 desktop. The camera (fov 32 at z 8) sees 2 * 10.5 * tan(16deg) = 6.02 units of
 * the 9-unit plane at z -2.5 across the 828px-tall panel: 6.02 / 9 / 828 = 0.00081.
 */
export const HERO_UV_PER_PX = 0.00081;

/** Button width (CSS px) at which a button's grain matches the hero's exactly: the hero's View experience is ~210px. */
export const MATCH_WIDTH = 200;

/**
 * The patch of the hero's shader plane (in its UVs) the buffer shows: the vivid centre
 * (well inside the radial fade, which starts at 0.35 * radius from the centre), at 2:1.
 * Buttons wider than 2:1 cover-fit the buffer's full width, so a MATCH_WIDTH button spans
 * exactly as much of the noise as the same width of the hero panel: the same material.
 */
const U_SPAN = HERO_UV_PER_PX * MATCH_WIDTH;

export const UV_WINDOW = {
  u: [0.5 - U_SPAN / 2, 0.5 + U_SPAN / 2],
  v: [0.5 - U_SPAN / 4, 0.5 + U_SPAN / 4],
} as const;

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
    // No preserveDrawingBuffer: the loop copies each frame with drawImage in the same task
    // as gl.render, before the buffer is presented and cleared.
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
  let palette: WineTheme = 'dark';
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
      // Follow the page theme (a cheap attribute read; the uniforms change only on a switch).
      const theme = currentTheme();

      if (theme !== palette) {
        palette = theme;
        applyWineTheme(uniforms, theme);
      }

      uniforms.uTime.value = time * WINE.speed;
      gl.render(scene, camera);
    },
    dispose,
  };
};
