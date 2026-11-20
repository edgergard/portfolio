import { PMREMGenerator, type Material, type Texture, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Blur of the studio reflections (radians). */
export const ENV_SIGMA = 0.04;
const POLL_MS = 10;

type ProgramState = { currentProgram?: { isReady: () => boolean } };

/**
 * Runs draw() with renderer.render swapped for renderer.compile: every program the draw
 * would use starts compiling (in parallel, with KHR_parallel_shader_compile) for the same
 * render targets, but nothing is drawn and nothing waits for a shader link.
 */
export const compileWithoutDrawing = (gl: WebGLRenderer, draw: () => void) => {
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

/**
 * Resolves true once every material's program has linked (the same polling as
 * renderer.compileAsync), or false as soon as isAlive() turns false. Without that exit the
 * loop would poll forever after an unmount, since a lost context never reports "ready".
 */
export const whenProgramsReady = (
  gl: WebGLRenderer,
  materials: Set<Material>,
  isAlive: () => boolean,
) =>
  new Promise<boolean>((resolve) => {
    const check = () => {
      if (!isAlive()) {
        resolve(false);

        return;
      }

      materials.forEach((material) => {
        const { currentProgram } = gl.properties.get(material) as ProgramState;

        if (!currentProgram || currentProgram.isReady()) {
          materials.delete(material);
        }
      });

      if (materials.size === 0) {
        resolve(true);
      } else {
        setTimeout(check, POLL_MS);
      }
    };

    check();
  });

/**
 * Builds the studio reflections (RoomEnvironment prefiltered through PMREM) without a
 * blocking shader link: a dry pass with a throwaway generator starts every program, we wait
 * for them, then the real pass reuses them. Returns null if isAlive() turned false first.
 * The room and the dry generator are disposed on every path.
 */
export const buildStudioEnvironment = async (
  gl: WebGLRenderer,
  isAlive: () => boolean,
): Promise<Texture | null> => {
  const room = new RoomEnvironment();
  // Kept until the real pass is done, so the shared programs are not released in between.
  const dry = new PMREMGenerator(gl);

  try {
    const programs = compileWithoutDrawing(gl, () => dry.fromScene(room, ENV_SIGMA).dispose());

    if (!(await whenProgramsReady(gl, programs, isAlive))) {
      return null;
    }

    const pmrem = new PMREMGenerator(gl);

    try {
      return pmrem.fromScene(room, ENV_SIGMA).texture;
    } finally {
      pmrem.dispose();
    }
  } finally {
    dry.dispose();
    room.dispose();
  }
};
