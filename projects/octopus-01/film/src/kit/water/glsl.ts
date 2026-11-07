// Shared GLSL for the water kit (WebGL2; runs under software rendering). All noise is value noise: cheap, smooth,
// deterministic. Units: metres (pass uMPU = metres per scene unit when the scene isn't in metres).
export const NOISE = /* glsl */`
float wh2(vec2 p){ p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float wn2(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wh2(i), wh2(i + vec2(1, 0)), f.x), mix(wh2(i + vec2(0, 1)), wh2(i + vec2(1, 1)), f.x), f.y); }
float wfbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * wn2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; } return s; }
// two-phase flow (Valve, "Water Flow in Portal 2", 2010): sample a pattern advected along 'dir' at two phases half a
// cycle apart and cross-fade, so it flows forever without stretching. 'jit' offsets the phase per place (no pulsing).
float wflow(vec2 uv, vec2 dir, float t, float jit){
  float p0 = fract(t + jit), p1 = fract(t + jit + 0.5);
  float w = abs(1.0 - 2.0 * p0);                       // 1 at p0 = 0 or 1 (when that phase resets), 0 mid-cycle
  float a = wfbm(uv - dir * p0), b = wfbm(uv - dir * p1 + 7.3);
  return mix(a, b, w); }
`;
// fragment shaders only (screen derivatives): bump a normal from a scalar height, no tangents needed
export const BUMP = /* glsl */`
vec3 wbump(vec3 surfPos, vec3 n, float hgt, float k){
  vec3 dpx = dFdx(surfPos), dpy = dFdy(surfPos); vec2 dh = vec2(dFdx(hgt), dFdy(hgt)) * k;
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1);
  return normalize(abs(det) * n - sign(det) * (dh.x * r1 + dh.y * r2)); }
`;
// screen-space fade for high-frequency detail: 0 where a pattern of 'period' metres would alias
export const AA = /* glsl */`
float wdetail(vec2 uvM, float period){ float fw = length(fwidth(uvM)); return clamp(1.0 - fw / (period * 0.5), 0.0, 1.0); }
`;
