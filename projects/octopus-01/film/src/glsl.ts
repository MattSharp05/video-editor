// Shared GLSL: 3D hash/value noise, fbm, cellular (Worley) noise, and the reef's own colour so the octopus can match
// the exact rock it sits on (REEF_COLOR is used by the rock shader and by the octopus's "match" pattern).
export const N3 = /* glsl */`
float h31(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
vec3 h33(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
float vn3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * vn3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
// nearest feature point: x = distance, y = that cell's id in [0,1)
vec2 worley(vec3 p){ vec3 i = floor(p), f = fract(p); float d = 8.0, id = 0.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec3 g = vec3(float(x), float(y), float(z)); vec3 o = h33(i + g); vec3 r = g + o * 0.8 + 0.1 - f; float dd = dot(r, r);
    if (dd < d){ d = dd; id = h31(i + g + 17.0); } }
  return vec2(sqrt(d), id); }
`;

// The reef rock's colour from a world position (top-down xz plus a little y): tan stone, pink coralline crust,
// olive algae turf and dark pits. Output in linear-ish display colour (fed to a standard material's diffuse).
export const REEF_COLOR = /* glsl */`
vec3 reefColor(vec3 w){
  vec2 q = w.xz;
  float big = fbm3(vec3(q * 2.2, 3.0)), mid = fbm3(vec3(q * 7.0, w.y * 4.0 + 11.0)), fine = vn3(vec3(q * 38.0, w.y * 20.0));
  vec3 stone = mix(vec3(0.27, 0.24, 0.19), vec3(0.47, 0.42, 0.33), mid);
  vec3 col = stone;
  col = mix(col, vec3(0.62, 0.36, 0.38), smoothstep(0.5, 0.6, big) * 0.9);              // pink coralline crust
  col = mix(col, vec3(0.22, 0.27, 0.11), smoothstep(0.5, 0.64, fbm3(vec3(q * 4.0 + 7.0, 1.0))) * 0.9); // algae turf
  col *= 0.78 + 0.32 * fine;
  col *= mix(0.45, 1.0, smoothstep(0.22, 0.42, mid));                                     // dark pits
  return col; }
`;
