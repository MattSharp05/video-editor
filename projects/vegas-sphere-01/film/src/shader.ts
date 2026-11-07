// PuckField: the Sphere's outside as a real lon/lat grid of glowing pucks on a ball, drawn per pixel.
// Orthographic camera from the front. World units: sphere radius 1, centre (0,0), y up.
// One cell = one puck (density of 1.2 million pucks over the whole ball). Close up: dots, dark gaps, steel rails,
// 48 LEDs inside a puck. Far away: the smooth picture (analytic coverage blend, no moiré).
export const DT = Math.sqrt((4 * Math.PI) / 1.2e6);

export const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

export const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec3 uCam; uniform float uMorph;
uniform sampler2D uPicA; uniform sampler2D uPicB;
uniform float uDT; uniform vec2 uOur;
uniform float uMissing, uOurLit, uFieldLit, uWave, uLED, uLEDOn, uGlowBlur;
uniform float uReelT, uReelLand, uRepaint, uTime, uGap, uOurGlow, uTVScale, uStrobe, uTwinkle, uFrame;
uniform vec3 uGapCol;
out vec4 o;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 hsv(float h, float s, float v){ vec3 k = clamp(abs(mod(h*6.0+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.); return v*mix(vec3(1.),k,s); }
float sdRBox(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
vec3 pic(sampler2D s, vec2 xy){ return texture(s, vec2(xy.x*0.5+0.5, 0.5-xy.y*0.5)).rgb; }

void main(){
  vec2 fc = gl_FragCoord.xy - uRes*0.5;
  vec2 p = uCam.xy + fc / uCam.z;
  float px = 1.0 / uCam.z;
  // TV -> ball morph (signed distance in world units)
  float sd = mix(sdRBox(p, vec2(0.92, 0.70), 0.16), length(p) - 1.0, uMorph);
  float inside = smoothstep(px, -px, sd);
  if (inside <= 0.0) { o = vec4(0.0); return; }
  float r2 = dot(p, p);
  float z = sqrt(max(0.0, 1.0 - r2));
  float ball = smoothstep(0.55, 1.0, uMorph);

  // flat TV screen picture (curved-glass vignette, faint scanlines)
  vec2 tp = p / uTVScale;
  vec3 flatCol = pic(uPicA, tp) * (0.92 - 0.25*dot(p*vec2(0.9,1.1), p*vec2(0.9,1.1))) ;
  flatCol *= 0.94 + 0.06*sin(fc.y*0.9);

  // the ball: puck grid on lon/lat rows, cells physically square
  float lat = asin(clamp(p.y, -1., 1.));
  float lon = atan(p.x, max(z, 1e-4));
  float fv = lat / uDT;
  float cj = floor(fv);
  float latc = (cj + 0.5) * uDT;
  float cl = cos(latc);
  float fu = lon * cl / uDT;
  float ci = floor(fu);
  vec2 cell = vec2(ci, cj);
  vec2 loc = vec2(fu - ci - 0.5, fv - cj - 0.5);
  float aa = max(fwidth(lon * cos(lat) / uDT), fwidth(fv)) + 1e-5;   // pixel size in cells
  float lonc = (ci + 0.5) * uDT / cl;
  vec2 cxy = vec2(cl * sin(lonc), sin(latc));          // where this puck's colour comes from in the picture
  bool our = all(equal(cell, uOur));
  float dist = length(cell - uOur);
  float h = hash(cell);

  // which picture: the pulses repaint emoji -> eye outward from our puck; a band before the front strobes
  float front = uRepaint - dist - h*4.0;
  vec3 colA = pic(uPicA, cxy), colB = pic(uPicB, cxy);
  vec3 col = front > 0.0 ? colB : colA;
  float strobe = (front > -9.0 && front <= 0.0 && uRepaint > 0.0) ? 1.0 : 0.0;
  strobe = max(strobe, uStrobe * step(0.0, -front));
  if (strobe > 0.0) col = mix(col, hsv(hash(cell + floor(uTime*14.0)), 0.7, 1.0), 0.85 * strobe);

  // slot-machine reels: every puck spins colour bands, then lands on its picture colour
  if (uReelT >= 0.0) {
    float land = uReelLand + h*0.35 + dist*0.035 - (our ? 0.6 : 0.0);
    float left = land - uReelT;
    if (left > 0.0) {
      float ph = left*left*2.2 + left*3.0 + h*7.0;
      float band = floor(ph);
      col = mix(col, hsv(fract(band*0.161 + h), 0.8, 1.0), clamp(uReelT / 0.3, 0.0, 1.0));
    } else col *= 1.0 + 0.6*exp(-(-left)*8.0);
  }

  // lit / unlit
  float waveLit = dist < uWave - h*2.5 ? 1.0 : 0.0;
  float lit = our ? uOurLit : max(uFieldLit, waveLit);
  float d = length(loc);
  float rr = 0.36;
  float mask = 1.0 - smoothstep(rr - aa, rr + aa, d);
  if (our) mask *= 1.0 - uMissing;
  vec3 body = vec3(0.075, 0.08, 0.09) * (1.0 + 0.8*smoothstep(0.1, -0.3, loc.y)) ;
  vec3 face = col * (1.0 + 0.35*(1.0 - d/rr));
  if (!our) face *= 1.0 + uTwinkle * 0.5 * sin(uTime*5.0 + h*40.0);   // neighbours twinkle while we hold on the tape
  // 48 LEDs: rings of 8, 16, 24 inside the face, lit in a counting sweep, then blurred into one glow
  if (uLEDOn > 0.0 && aa < 0.02) {
    float rings[3] = float[3](0.085, 0.165, 0.245);
    float cnt[3] = float[3](8., 16., 24.);
    float off[3] = float[3](0., 8., 24.);
    int k = d < 0.125 ? 0 : (d < 0.205 ? 1 : 2);
    float ang = atan(loc.y, loc.x) / 6.28318 + 0.5 + (k == 1 ? 0.03 : 0.0);
    float idx = floor(ang * cnt[k] + 0.5);
    float a2 = (idx / cnt[k] - 0.5 - (k == 1 ? 0.03 : 0.0)) * 6.28318;
    vec2 lc = rings[k] * vec2(cos(a2), sin(a2));
    float ld = length(loc - lc);
    float g = off[k] + mod(idx, cnt[k]);
    float on = g < uLED ? 1.0 : 0.0;
    float led = 1.0 - smoothstep(0.028 - aa, 0.028 + aa, ld);
    vec3 ledFace = vec3(0.05,0.05,0.06) + col*(led*on*1.6 + on*0.5*exp(-ld*40.0)) + vec3(0.12)*led*(1.0-on);
    face = mix(face, ledFace, uLEDOn * (1.0 - uGlowBlur));
  }
  vec3 near = mix(body, face, lit) * mask;
  // halo of light around a lit puck, steel rails in the gaps, and what shows through the gaps
  float halo = lit * 0.22 * exp(-max(0.0, d - rr) * 9.0) * (our ? (1.0 - uMissing) : 1.0);
  float rail = (1.0 - smoothstep(0.035, 0.035 + aa, abs(abs(loc.y) - 0.5))) * (1.0 - mask);
  vec3 gap = mix(vec3(0.012, 0.014, 0.02), uGapCol, uGap);
  near += (1.0 - mask) * (gap + col * halo + vec3(0.11, 0.115, 0.13) * rail * (0.4 + 2.0*halo) + vec3(0.42, 0.45, 0.52) * rail * uFrame);
  if (our) {  // the lead: a warm gold rim; the empty slot shows its dark socket
    float ring = exp(-pow((d - rr - 0.035) / 0.02, 2.0));
    near += vec3(1.0, 0.77, 0.43) * ring * uOurGlow;
    near = mix(near, vec3(0.0), uMissing * (1.0 - smoothstep(rr*0.95, rr*1.05, d)) * 0.9);
  }
  // far away: the eye blends dots into the picture (coverage of the disc plus halo)
  float cover = 0.55;
  vec3 farCol = mix(vec3(0.02), (front > 0.0 ? pic(uPicB, p) : pic(uPicA, p)), max(uFieldLit, step(4000.0, uWave))) * (cover + 0.3);
  float k = smoothstep(0.16, 0.45, aa);
  vec3 ballCol = mix(near, farCol, k);
  // limb darkening (pucks face outward) and a soft shading of the ball
  float limb = mix(0.35, 1.0, pow(z, 0.45));
  ballCol *= limb * (0.92 + 0.12 * p.y);
  ballCol += vec3(0.6, 0.35, 0.5) * pow(1.0 - z, 4.0) * 0.18 * k;   // dusk sky caught at the rim
  vec3 c = mix(flatCol, ballCol, ball);
  o = vec4(c * inside, inside);
}`;
