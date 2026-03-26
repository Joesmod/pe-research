#!/usr/bin/env node
/**
 * Synthwave track generator using open-samples WAV files
 * Reads WAV samples, pitch-shifts via resampling, sequences into a full track
 * Output: 16-bit 44100Hz stereo WAV
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const BPM = 110;
const BEAT = 60 / BPM; // seconds per beat
const DURATION = 180; // 3 minutes
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;

// --- WAV reading/writing ---

function readWav(filePath) {
  const buf = fs.readFileSync(filePath);
  // Find 'fmt ' chunk
  let i = 12;
  let channels = 1, sampleRate = 44100, bitsPerSample = 16;
  while (i < buf.length - 8) {
    const id = buf.toString('ascii', i, i + 4);
    const size = buf.readUInt32LE(i + 4);
    if (id === 'fmt ') {
      channels = buf.readUInt16LE(i + 10);
      sampleRate = buf.readUInt32LE(i + 12);
      bitsPerSample = buf.readUInt16LE(i + 22);
    }
    if (id === 'data') {
      const dataStart = i + 8;
      const dataEnd = dataStart + size;
      const samples = [];
      const bytesPerSample = bitsPerSample / 8;
      for (let j = dataStart; j < dataEnd && j < buf.length; j += bytesPerSample * channels) {
        // Read first channel (mono mix)
        let val;
        if (bitsPerSample === 16) {
          val = buf.readInt16LE(j) / 32768;
        } else if (bitsPerSample === 24) {
          val = ((buf[j] | (buf[j+1] << 8) | (buf[j+2] << 16)) << 8 >> 8) / 8388608;
        } else {
          val = (buf[j] - 128) / 128;
        }
        samples.push(val);
      }
      return { samples, sampleRate, channels };
    }
    i += 8 + size;
    if (size % 2) i++; // padding
  }
  throw new Error('No data chunk found in ' + filePath);
}

function pitchShift(samples, origRate, semitones) {
  // Simple resampling-based pitch shift
  const ratio = Math.pow(2, semitones / 12);
  const newLen = Math.floor(samples.length / ratio);
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const srcIdx = i * ratio;
    const idx = Math.floor(srcIdx);
    const frac = srcIdx - idx;
    if (idx + 1 < samples.length) {
      out[i] = samples[idx] * (1 - frac) + samples[idx + 1] * frac;
    } else if (idx < samples.length) {
      out[i] = samples[idx];
    }
  }
  return out;
}

function writeWav(filePath, leftCh, rightCh) {
  const numSamples = leftCh.length;
  const dataSize = numSamples * 2 * 2; // 2 channels, 16-bit
  const buf = Buffer.alloc(44 + dataSize);
  
  // Header
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); // chunk size
  buf.writeUInt16LE(1, 20);  // PCM
  buf.writeUInt16LE(2, 22);  // stereo
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 4, 28); // byte rate
  buf.writeUInt16LE(4, 32);  // block align
  buf.writeUInt16LE(16, 34); // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, leftCh[i])) * 32767;
    const r = Math.max(-1, Math.min(1, rightCh[i])) * 32767;
    buf.writeInt16LE(Math.round(l), offset);
    buf.writeInt16LE(Math.round(r), offset + 2);
    offset += 4;
  }
  
  fs.writeFileSync(filePath, buf);
  console.log(`Wrote ${filePath} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
}

// --- Synthesis helpers ---

function envelope(samples, attackMs, decayMs, sustain, releaseMs, sampleRate) {
  const attack = Math.floor(attackMs / 1000 * sampleRate);
  const decay = Math.floor(decayMs / 1000 * sampleRate);
  const release = Math.floor(releaseMs / 1000 * sampleRate);
  const out = new Float32Array(samples.length);
  
  for (let i = 0; i < samples.length; i++) {
    let env;
    if (i < attack) {
      env = i / attack;
    } else if (i < attack + decay) {
      env = 1 - (1 - sustain) * ((i - attack) / decay);
    } else if (i >= samples.length - release) {
      env = sustain * (samples.length - i) / release;
    } else {
      env = sustain;
    }
    out[i] = samples[i] * Math.max(0, env);
  }
  return out;
}

function mixInto(target, source, startSample, volume) {
  for (let i = 0; i < source.length && startSample + i < target.length; i++) {
    target[startSample + i] += source[i] * volume;
  }
}

// --- Pure synthesis fallback (if no samples found) ---

function synthOsc(freq, durationSec, type = 'saw') {
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const phase = (freq * t) % 1;
    if (type === 'saw') {
      out[i] = 2 * phase - 1;
    } else if (type === 'square') {
      out[i] = phase < 0.5 ? 1 : -1;
    } else if (type === 'sine') {
      out[i] = Math.sin(2 * Math.PI * freq * t);
    } else if (type === 'triangle') {
      out[i] = 4 * Math.abs(phase - 0.5) - 1;
    }
  }
  return out;
}

function lowpass(samples, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(samples.length);
  out[0] = samples[0];
  for (let i = 1; i < samples.length; i++) {
    out[i] = out[i - 1] + alpha * (samples[i] - out[i - 1]);
  }
  return out;
}

// --- Kick drum synthesis ---
function synthKick(durationSec = 0.4) {
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 150 * Math.exp(-t * 20) + 40;
    out[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 8);
  }
  return out;
}

// --- Snare synthesis ---
function synthSnare(durationSec = 0.2) {
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const noise = Math.random() * 2 - 1;
    const tone = Math.sin(2 * Math.PI * 200 * t);
    out[i] = (noise * 0.7 + tone * 0.3) * Math.exp(-t * 15);
  }
  return out;
}

// --- Hi-hat synthesis ---
function synthHat(durationSec = 0.05) {
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40);
  }
  return out;
}

// --- Note to frequency ---
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteToFreq(note, octave) {
  const idx = NOTE_NAMES.indexOf(note);
  const midi = (octave + 1) * 12 + idx;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// --- Find samples ---
function findSamples(samplesDir) {
  const found = { pads: [], bass: [], leads: [], strings: [] };
  if (!fs.existsSync(samplesDir)) return found;
  
  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith('.wav')) {
          const lower = full.toLowerCase();
          if (lower.includes('pad') || lower.includes('dream')) found.pads.push(full);
          else if (lower.includes('bass')) found.bass.push(full);
          else if (lower.includes('lead') || lower.includes('bell')) found.leads.push(full);
          else if (lower.includes('string')) found.strings.push(full);
        }
      }
    } catch(e) {}
  }
  walk(samplesDir);
  return found;
}

// ==================== MAIN ====================

const samplesDir = path.resolve(__dirname, '..', 'open-samples');
const outputDir = path.resolve(__dirname, '..', 'mvp-studio-showcase', 'music');

console.log('Looking for samples in:', samplesDir);
const sampleLib = findSamples(samplesDir);
console.log(`Found: ${sampleLib.pads.length} pads, ${sampleLib.bass.length} bass, ${sampleLib.leads.length} leads, ${sampleLib.strings.length} strings`);

const useSamples = sampleLib.pads.length > 0 || sampleLib.bass.length > 0;

// Track: "Signal Loss" — moody synthwave, Dm key
const left = new Float32Array(TOTAL_SAMPLES);
const right = new Float32Array(TOTAL_SAMPLES);

// --- Chord progression: Dm - Bb - C - Am (i - VI - VII - v) ---
const chords = [
  [['D', 4], ['F', 4], ['A', 4]],   // Dm
  [['A#', 3], ['D', 4], ['F', 4]],  // Bb
  [['C', 4], ['E', 4], ['G', 4]],   // C
  [['A', 3], ['C', 4], ['E', 4]],   // Am
];

const beatsPerChord = 8;
const chordDuration = beatsPerChord * BEAT;

console.log('Generating track "Signal Loss"...');

// --- PAD layer ---
let padSample = null;
if (sampleLib.pads.length > 0) {
  try {
    padSample = readWav(sampleLib.pads[0]);
    console.log('Using sample pad:', sampleLib.pads[0]);
  } catch(e) { console.log('Pad sample read failed, using synth'); }
}

for (let bar = 0; bar < Math.floor(DURATION / chordDuration); bar++) {
  const chord = chords[bar % chords.length];
  const startSample = Math.floor(bar * chordDuration * SAMPLE_RATE);
  
  // Intro: first 4 bars pad only, then layers add
  const section = bar < 4 ? 'intro' : bar < 20 ? 'main' : 'outro';
  
  for (const [note, oct] of chord) {
    const freq = noteToFreq(note, oct);
    let padSound;
    
    if (padSample) {
      // Pitch shift the sample
      const baseFreq = 261.63; // assume C4
      const semitones = 12 * Math.log2(freq / baseFreq);
      padSound = pitchShift(padSample.samples, padSample.sampleRate, semitones);
      // Trim/extend to chord duration
      const needed = Math.floor(chordDuration * SAMPLE_RATE);
      if (padSound.length > needed) padSound = padSound.slice(0, needed);
    } else {
      padSound = synthOsc(freq, chordDuration, 'saw');
      padSound = lowpass(padSound, 800);
    }
    
    padSound = envelope(padSound, 200, 100, 0.6, 500, SAMPLE_RATE);
    const vol = section === 'intro' ? 0.08 : section === 'outro' ? 0.06 : 0.1;
    mixInto(left, padSound, startSample, vol);
    mixInto(right, padSound, startSample, vol * 0.95);
  }
}

// --- BASS layer (comes in after intro) ---
const bassNotes = ['D', 'A#', 'C', 'A'];
const bassOctave = 2;

let bassSample = null;
if (sampleLib.bass.length > 0) {
  try {
    bassSample = readWav(sampleLib.bass[0]);
    console.log('Using sample bass:', sampleLib.bass[0]);
  } catch(e) { console.log('Bass sample read failed, using synth'); }
}

for (let bar = 4; bar < Math.floor(DURATION / chordDuration); bar++) {
  const note = bassNotes[bar % bassNotes.length];
  const freq = noteToFreq(note, bassOctave);
  
  // 8th note bass pattern
  for (let b = 0; b < beatsPerChord * 2; b++) {
    const startSample = Math.floor((bar * chordDuration + b * BEAT / 2) * SAMPLE_RATE);
    const noteDur = BEAT * 0.45;
    
    let bassSound;
    if (bassSample) {
      const baseFreq = 65.41; // C2
      const semitones = 12 * Math.log2(freq / baseFreq);
      bassSound = pitchShift(bassSample.samples, bassSample.sampleRate, semitones);
      const needed = Math.floor(noteDur * SAMPLE_RATE);
      if (bassSound.length > needed) bassSound = bassSound.slice(0, needed);
    } else {
      bassSound = synthOsc(freq, noteDur, 'saw');
      bassSound = lowpass(bassSound, 400);
    }
    
    bassSound = envelope(bassSound, 5, 50, 0.7, 30, SAMPLE_RATE);
    mixInto(left, bassSound, startSample, 0.15);
    mixInto(right, bassSound, startSample, 0.15);
  }
}

// --- LEAD melody (comes in bar 8) ---
const melodyNotes = [
  ['D', 5, 1], ['F', 5, 0.5], ['E', 5, 0.5], ['D', 5, 1], ['C', 5, 1],
  ['A', 4, 1], ['A#', 4, 0.5], ['A', 4, 0.5], ['G', 4, 2],
  ['F', 5, 1], ['E', 5, 0.5], ['D', 5, 0.5], ['C', 5, 1], ['D', 5, 1],
  ['A', 4, 2], ['D', 5, 2],
];

let leadSample = null;
if (sampleLib.leads.length > 0) {
  try {
    leadSample = readWav(sampleLib.leads[0]);
    console.log('Using sample lead:', sampleLib.leads[0]);
  } catch(e) { console.log('Lead sample read failed, using synth'); }
}

for (let rep = 0; rep < 4; rep++) {
  let beatOffset = (8 + rep * 16) * beatsPerChord;
  if (beatOffset * BEAT >= DURATION) break;
  
  let currentBeat = 0;
  for (const [note, oct, dur] of melodyNotes) {
    const freq = noteToFreq(note, oct);
    const startSample = Math.floor((beatOffset + currentBeat) * BEAT * SAMPLE_RATE);
    const noteDur = dur * BEAT * 0.9;
    
    let leadSound;
    if (leadSample) {
      const baseFreq = 523.25; // C5
      const semitones = 12 * Math.log2(freq / baseFreq);
      leadSound = pitchShift(leadSample.samples, leadSample.sampleRate, semitones);
      const needed = Math.floor(noteDur * SAMPLE_RATE);
      if (leadSound.length > needed) leadSound = leadSound.slice(0, needed);
    } else {
      leadSound = synthOsc(freq, noteDur, 'square');
      leadSound = lowpass(leadSound, 2000);
    }
    
    leadSound = envelope(leadSound, 10, 100, 0.5, 100, SAMPLE_RATE);
    // Pan lead slightly right
    mixInto(left, leadSound, startSample, 0.08);
    mixInto(right, leadSound, startSample, 0.12);
    
    currentBeat += dur;
  }
}

// --- DRUMS ---
const kick = synthKick();
const snare = synthSnare();
const hat = synthHat();
const openHat = synthHat(0.15);

for (let beat = 0; beat < DURATION / BEAT; beat++) {
  const bar = Math.floor(beat / beatsPerChord);
  if (bar < 2) continue; // drums come in bar 2
  
  const startSample = Math.floor(beat * BEAT * SAMPLE_RATE);
  const beatInBar = beat % 4;
  
  // Kick on 1 and 3
  if (beatInBar === 0 || beatInBar === 2) {
    mixInto(left, kick, startSample, 0.3);
    mixInto(right, kick, startSample, 0.3);
  }
  
  // Snare on 2 and 4
  if (beatInBar === 1 || beatInBar === 3) {
    mixInto(left, snare, startSample, 0.2);
    mixInto(right, snare, startSample, 0.2);
  }
  
  // Hi-hat on every 8th
  const hatSample = Math.floor(beat * BEAT * SAMPLE_RATE);
  const halfBeat = Math.floor(BEAT * SAMPLE_RATE / 2);
  mixInto(left, hat, hatSample, 0.08);
  mixInto(right, hat, hatSample, 0.1);
  mixInto(left, openHat, hatSample + halfBeat, 0.05);
  mixInto(right, openHat, hatSample + halfBeat, 0.06);
}

// --- Write output ---
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const outPath = path.join(outputDir, 'signal-loss.wav');
writeWav(outPath, left, right);
console.log('Done! Track: Signal Loss');
console.log(`BPM: ${BPM}, Key: Dm, Duration: ${DURATION}s`);
console.log(`Samples used: ${useSamples ? 'YES (open-samples)' : 'Pure synthesis (samples not yet available)'}`);
