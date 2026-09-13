// Probe: render a small grayscale ASCII view to verify the ball composition looks right
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
const ctx = { console, Math, Object, Array, JSON, String, Uint8ClampedArray, globalThis: {} }; ctx.globalThis = ctx;
vm.createContext(ctx);
const Ray = vm.runInContext(m[1] + '\nRay;', ctx, { filename: 'engine.js' });

const W = 48, H = 24;
const data = Ray.render(Ray.defaultScene(0), W, H);
const ramp = ' .:-=+*#%@';
const lines = [];
for (let y = 0; y < H; y++){
  let row = '';
  for (let x = 0; x < W; x++){
    const r = data[(y*W+x)*3]/255, g = data[(y*W+x)*3+1]/255, b = data[(y*W+x)*3+2]/255;
    const L = 0.299*r + 0.587*g + 0.114*b;
    row += ramp[Math.min(ramp.length-1, Math.max(0, Math.round(L * (ramp.length-1))))];
  }
  lines.push(row);
}
fs.writeFileSync(path.join(__dirname, '_probe.txt'), lines.join('\n') + '\n', 'utf8');
console.log('probe written: ' + lines.join('\n').length + ' chars');
