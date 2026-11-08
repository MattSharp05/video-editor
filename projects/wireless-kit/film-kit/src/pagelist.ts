import { kitPages } from './KitSheet';
for (const p of kitPages()) p.still.forEach((s) => console.log(`${p.name}_${String(s).padStart(3, '0')} ${p.start + s}`));
