// Offline WAV renderer for synthwave drum pattern - Node.js
// Generates the same "synthwave" preset pattern at 120 BPM

const fs = require('fs');
const SR = 44100;
const BPM = 120;
const STEPS = 16;
const LOOPS = 4;
const STEP_DUR = 60 / BPM / 4; // 16th note
const TAIL = 1; // 1s tail
const TOTAL_DUR = STEPS * LOOPS * STEP_DUR + TAIL;
const TOTAL_SAMPLES = Math.ceil(TOTAL_DUR * SR);

// Stereo buffer
const L = new Float32Array(TOTAL_SAMPLES);
const R = new Float32Array(TOTAL_SAMPLES);

// Pattern: synthwave preset
const pattern = {
  kick:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
  snare:   [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
  hihatC:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
  hihatO:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
  clap:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
};

function addToBuffer(start, samples, vol = 0.8) {
  const offset = Math.floor(start * SR);
  for (let i = 0; i < samples.length && offset + i < TOTAL_SAMPLES; i++) {
    L[offset + i] += samples[i] * vol;
    R[offset + i] += samples[i] * vol;
  }
}

function synthKick(t) {
  const dur = 0.4;
  const len = Math.floor(dur * SR);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const s = i / SR;
    const freq = 150 * Math.exp(-s * Math.log(150/30) / 0.15);
    const clickFreq = 800 * Math.exp(-s * Math.log(800/100) / 0.02);
    const env = Math.exp(-s * 20);
    const clickEnv = s < 0.03 ? 0.6 * Math.exp(-s * 200) : 0;
    buf[i] = Math.sin(2 * Math.PI * freq * s) * env + Math.sin(2 * Math.PI * clickFreq * s) * clickEnv;
  }
  addToBuffer(t, buf);
}

function synthSnare(t) {
  const dur = 0.2;
  const len = Math.floor(dur * SR);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const s = i / SR;
    const noise = (Math.random() * 2 - 1) * 0.7 * Math.exp(-s * 25);
    const bodyFreq = 200 * Math.exp(-s * Math.log(2) / 0.05);
    const body = Math.sin(2 * Math.PI * bodyFreq * s) * 0.5 * Math.exp(-s * 40);
    buf[i] = noise + body;
  }
  addToBuffer(t, buf);
}

function synthHihat(t, dur) {
  const len = Math.floor(dur * SR);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const s = i / SR;
    // Simple highpass noise approximation
    const noise = (Math.random() * 2 - 1);
    buf[i] = noise * 0.3 * Math.exp(-s / dur * 5);
  }
  // Simple highpass: difference filter
  for (let i = len - 1; i > 0; i--) {
    buf[i] = buf[i] - buf[i-1] * 0.5;
  }
  addToBuffer(t, buf);
}

function synthClap(t) {
  for (let n = 0; n < 3; n++) {
    const offset = n * 0.01;
    const dur = 0.15;
    const len = Math.floor(dur * SR);
    const buf = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const s = i / SR;
      buf[i] = (Math.random() * 2 - 1) * 0.6 * Math.exp(-s * 30);
    }
    addToBuffer(t + offset, buf);
  }
}

function synthCrash(t) {
  const dur = 0.8;
  const len = Math.floor(dur * SR);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const s = i / SR;
    buf[i] = (Math.random() * 2 - 1) * 0.4 * Math.exp(-s * 5);
  }
  for (let i = len - 1; i > 0; i--) {
    buf[i] = buf[i] - buf[i-1] * 0.3;
  }
  addToBuffer(t, buf);
}

// Render
for (let loop = 0; loop < LOOPS; loop++) {
  for (let s = 0; s < STEPS; s++) {
    const t = (loop * STEPS + s) * STEP_DUR;
    if (pattern.kick[s])   synthKick(t);
    if (pattern.snare[s])  synthSnare(t);
    if (pattern.hihatC[s]) synthHihat(t, 0.08);
    if (pattern.hihatO[s]) synthHihat(t, 0.3);
    if (pattern.clap[s])   synthClap(t);
    if (pattern.crash[s])  synthCrash(t);
  }
}

// Clamp
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  L[i] = Math.max(-1, Math.min(1, L[i]));
  R[i] = Math.max(-1, Math.min(1, R[i]));
}

// Write WAV
const numCh = 2;
const bitsPerSample = 16;
const dataSize = TOTAL_SAMPLES * numCh * (bitsPerSample / 8);
const buffer = Buffer.alloc(44 + dataSize);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numCh, 22);
buffer.writeUInt32LE(SR, 24);
buffer.writeUInt32LE(SR * numCh * (bitsPerSample / 8), 28);
buffer.writeUInt16LE(numCh * (bitsPerSample / 8), 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let off = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const lSample = Math.max(-1, Math.min(1, L[i]));
  const rSample = Math.max(-1, Math.min(1, R[i]));
  buffer.writeInt16LE(Math.floor(lSample < 0 ? lSample * 0x8000 : lSample * 0x7FFF), off); off += 2;
  buffer.writeInt16LE(Math.floor(rSample < 0 ? rSample * 0x8000 : rSample * 0x7FFF), off); off += 2;
}

fs.writeFileSync('synthwave-drums-120bpm.wav', buffer);
console.log(`Written: synthwave-drums-120bpm.wav (${(buffer.length / 1024 / 1024).toFixed(1)}MB, ${TOTAL_DUR.toFixed(1)}s)`);
