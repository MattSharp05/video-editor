import * as THREE from 'three';
import * as TL from '../src/timeline';
for (const t of [5, 14, 30, 33]) {
  const v = TL.sunLocal(t); const lat = Math.asin(v.y) * 57.3; const lon = Math.atan2(v.z, -v.x) * 57.3 - 180;
  console.log(t, 'subsolar lat', lat.toFixed(1), 'lon', ((lon + 540) % 360 - 180).toFixed(1), 'want', TL.subsolarLon(t));
}
