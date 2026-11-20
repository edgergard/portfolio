import { Color, Vector2, type IUniform } from 'three';

/** Page background, deep wine, burgundy, bright wine. */
export const WINE_PALETTE = ['#0A0A0B', '#3E0712', '#8B1426', '#B8233F'] as const;

export const WINE = { speed: 0.26, warp: 3.0, radius: 0.95, amount: 1.0 } as const;

const BG = '#0A0A0B';

export const createWineUniforms = (): Record<string, IUniform> => ({
  uTime: { value: 0 },
  uMouse: { value: new Vector2(0.5, 0.5) },
  uBg: { value: new Color(BG) },
  uC1: { value: new Color(WINE_PALETTE[0]) },
  uC2: { value: new Color(WINE_PALETTE[1]) },
  uC3: { value: new Color(WINE_PALETTE[2]) },
  uC4: { value: new Color(WINE_PALETTE[3]) },
  uRadius: { value: WINE.radius },
  uAmount: { value: WINE.amount },
  uWarp: { value: WINE.warp },
});

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Domain-warped fbm noise blends the palette; a radial mask (centre nudged towards the pointer)
 * fades it into the page background. Colours are linear, so the output goes through
 * colorspace_fragment to land in sRGB like the rest of the scene.
 */
export const fragmentShader = /* glsl */ `
  uniform float uTime, uRadius, uAmount, uWarp;
  uniform vec2 uMouse;
  uniform vec3 uBg, uC1, uC2, uC3, uC4;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = vUv * 3.0;
    float t = uTime;
    vec2 q = vec2(fbm(p + t * 0.6), fbm(p + vec2(5.2, 1.3) - t * 0.5));
    vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.4), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.35));
    float n = fbm(p + uWarp * r);

    vec3 col = mix(uC1, uC2, smoothstep(0.2, 0.8, n));
    col = mix(col, uC3, smoothstep(0.35, 0.9, r.x));
    col = mix(col, uC4, smoothstep(0.5, 1.0, q.y) * 0.8);

    vec2 c = mix(vec2(0.5), uMouse, 0.35);
    float d = distance(vUv, c);
    float mask = 1.0 - smoothstep(uRadius * 0.35, uRadius, d);

    gl_FragColor = vec4(mix(uBg, col, mask * uAmount), 1.0);
    #include <colorspace_fragment>
  }
`;
