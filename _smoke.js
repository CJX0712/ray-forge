// Headless invariant test for RayForge engine (extracted from index.html)
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!m) { console.error('engine script not found'); process.exit(1); }

const ctx = { console, Math, Object, Array, JSON, String, Uint8ClampedArray, ImageData: undefined, globalThis: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
const Ray = vm.runInContext(m[1] + '\nRay;', ctx, { filename: 'engine.js' });

let pass = 0, fail = 0;
function ok(name, cond){
  if (cond){ pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}
const lum = rgb => 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];

console.log('RayForge engine smoke test');

// 1) sphere hit distance
const t1 = Ray.hitSphere([0,0,5],[0,0,-1],[0,0,0],1);
ok('sphere hit: t = 4', Math.abs(t1 - 4) < 1e-9);
// 2) miss
ok('sphere miss: Infinity', Ray.hitSphere([0,0,5],[0,1,0],[0,0,0],1) === Infinity);
// 3) nearest of two spheres
const ro=[0,0,5], rd=[0,0,-1];
const ta = Ray.hitSphere(ro,rd,[0,0,0],1), tb = Ray.hitSphere(ro,rd,[0,0,-3],1);
ok('nearest sphere: 4 < 7', Math.abs(ta-4)<1e-9 && tb>ta);
// 4) normal outward
const scene = Ray.defaultScene(0);
const front = Ray.trace([0,0.5,5],[0,0,-1],scene);
ok('normal outward ≈ (0,0,1)', Math.abs(front.normal[0])<1e-6 && Math.abs(front.normal[1])<1e-6 && front.normal[2]>0.99);
// 5) lambert lit > ambient
const lit = lum(front.color);
ok('lit front brighter than ambient base', lit > 0.16);
// 6) plane hit
const tp = Ray.hitPlane([0,5,0],[0,-1,0],[0,-1,0],[0,1,0]);
ok('plane hit: t = 6', Math.abs(tp - 6) < 1e-9);
// 7) shadow: a point behind a sphere is darker
const litSphere = Ray.trace([0,0,5],[0,0,-1],scene); // front of red sphere, lit
const bg = Ray.trace([0,3,5],[0,1,0],scene); // upward -> background
ok('background returns bg color when no hit', !bg.hit && bg.color[2] > 0.1);
// 8) determinism
const A = Ray.render(scene, 24, 24), B = Ray.render(scene, 24, 24);
let same = true; for (let i=0;i<A.length;i++) if (A[i]!==B[i]) same=false;
ok('determinism: identical renders', same);
// 9) pixel range
const big = Ray.render(scene, 60, 60);
let inRange = true; for (let i=0;i<big.length;i++) if (big[i]<0||big[i]>255) inRange=false;
ok('pixel values within 0..255', inRange);
// 10) composition: center brighter than corner
const r2 = Ray.render(scene, 40, 40);
const cen = lum([r2[(20*40+20)*3], r2[(20*40+20)*3+1], r2[(20*40+20)*3+2]]);
const cor = lum([r2[0], r2[1], r2[2]]);
ok('composition: center brighter than corner', cen > cor);
// 11) rotation changes scene (different angle -> different center pixel)
const rA = Ray.render(Ray.defaultScene(0), 40, 40);
const rB = Ray.render(Ray.defaultScene(1.2), 40, 40);
let diff = false; for (let i=0;i<rA.length;i++) if (Math.abs(rA[i]-rB[i])>1){ diff=true; break; }
ok('rotation: different angle -> different image', diff);

console.log('\nRESULT: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
