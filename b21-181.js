// B170 Sound engine DSP, vendored from Pappydapimp69/sound-engine@b028f46 (src/dsp, MIT) by scripts/vendor-sound-engine.mjs.
// Do not edit by hand: change the sound-engine repo and re-run the script. Exposes SoundEngineDSP.{Noise,Ramp,Biquad,SteepBand,Resonator,t60ToDecay,DelayLine,BubbleBank,RisingBubbles,WaterSource,WATER_PRESETS,minnaert,bubbleDecay,ModalBank,SURFACE_MODES,surfaceBank,hertzContactTime,effectiveModulus,MODULI,FootstepSynth,SURFACES,CreatureVoice,CREATURES,tractFormants,maxOpenF0,sacResonance,FDNReverb,ZONES,reverbEnergy,zoneSend,AirFilter,airAbsorption,fitSectionCorner,modelLossDb,OcclusionFilter,maekawaLoss,maekawaCorner,shelfLossDb,ridgeDelta,panGains,lawForDevice,PAN_LAWS,spatialize,Spatializer,SPEED_OF_SOUND,woodworthITD,HEAD_RADIUS}.
const SoundEngineDSP=(()=>{'use strict';
// ---- biquad.js ----
const __se_biquad_js=(()=>{

/**
 * RBJ-cookbook biquad (direct form I). Coefficients are recomputed only when
 * `set*` is called, so call those per block, not per sample.
 */
class Biquad {
  constructor(fs) {
    this.fs = fs;
    this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }

  _set(b0, b1, b2, a0, a1, a2) {
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = a1 / a0; this.a2 = a2 / a0;
    return this;
  }

  _w(f) {
    return 2 * Math.PI * Math.min(Math.max(f, 1), this.fs * 0.49) / this.fs;
  }

  lowpass(f, q = Math.SQRT1_2) {
    const w = this._w(f), c = Math.cos(w), al = Math.sin(w) / (2 * q);
    return this._set((1 - c) / 2, 1 - c, (1 - c) / 2, 1 + al, -2 * c, 1 - al);
  }

  highpass(f, q = Math.SQRT1_2) {
    const w = this._w(f), c = Math.cos(w), al = Math.sin(w) / (2 * q);
    return this._set((1 + c) / 2, -(1 + c), (1 + c) / 2, 1 + al, -2 * c, 1 - al);
  }

  /** Constant 0 dB peak gain band-pass. */
  bandpass(f, q = 1) {
    const w = this._w(f), c = Math.cos(w), al = Math.sin(w) / (2 * q);
    return this._set(al, 0, -al, 1 + al, -2 * c, 1 - al);
  }

  peaking(f, q, gainDb) {
    const A = 10 ** (gainDb / 40), w = this._w(f), c = Math.cos(w), al = Math.sin(w) / (2 * q);
    return this._set(1 + al * A, -2 * c, 1 - al * A, 1 + al / A, -2 * c, 1 - al / A);
  }

  process(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x;
    this.y2 = this.y1; this.y1 = y;
    return y;
  }

  reset() {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }
}

/**
 * Steep band split: four cascaded band-passes. Single biquads leak the slow
 * neighbour band's tail into short bands (read 36% long in dlist/E19).
 */
class SteepBand {
  constructor(fs, f, sections = 4, q = 2) {
    this.stages = Array.from({ length: sections }, () => new Biquad(fs).bandpass(f, q));
  }

  process(x) {
    for (const s of this.stages) x = s.process(x);
    return x;
  }
}
return{Biquad,SteepBand};
})();
// ---- air.js ----
const __se_air_js=(()=>{
const {Biquad}=__se_biquad_js;
/**
 * Air absorption (ISO 9613-1). Loss in dB is linear in distance and grows
 * ~f^2, so one distance-scaled one-pole misses by 1.9-6.2 dB from 100 to
 * 800 m. Instead: fit ONE one-pole section for 25 m and cascade k copies
 * (within 0.89 dB to 200 m); beyond 200 m add a fitted 2nd-order low-pass.
 */
function airAbsorption(f, tempC = 20, humidity = 70, pressureKPa = 101.325) {
  const pr = 101.325, T0 = 293.15, T01 = 273.16, T = tempC + 273.15, pa = pressureKPa;
  const psat = pr * 10 ** (-6.8346 * (T01 / T) ** 1.261 + 4.6151);
  const h = (humidity * psat) / pa;
  const frO = (pa / pr) * (24 + (4.04e4 * h * (0.02 + h)) / (0.391 + h));
  const frN = (pa / pr) * (T / T0) ** -0.5 * (9 + 280 * h * Math.exp(-4.17 * ((T / T0) ** (-1 / 3) - 1)));
  const z = (0.1068 * Math.exp(-3352 / T)) / (frN + (f * f) / frN);
  const y = (T / T0) ** -2.5 * ((0.01275 * Math.exp(-2239.1 / T)) / (frO + (f * f) / frO) + z);
  return 8.686 * f * f * (1.84e-11 * (pa / pr) ** -1 * (T / T0) ** 0.5 + y); // dB per metre
}

const BANDS = Array.from({ length: 23 }, (_, k) => 63 * 2 ** (k / 3));

const SECTION_METRES = 25;
const MAX_SECTIONS = 8;

/** Min-max fit of a one-pole corner so k sections match ISO loss; returns corner Hz. */
function fitSectionCorner(atmosphere = {}) {
  const { tempC = 20, humidity = 70, pressureKPa = 101.325 } = atmosphere;
  const target = BANDS.map((f) => airAbsorption(f, tempC, humidity, pressureKPa) * SECTION_METRES);
  let best = [Infinity, 1000];
  for (let fc = 200; fc < 200000; fc *= 1.01) {
    let e = 0;
    BANDS.forEach((f, i) => { e = Math.max(e, Math.abs(10 * Math.log10(1 + (f / fc) ** 2) - target[i])); });
    if (e < best[0]) best = [e, fc];
  }
  return best[1];
}

/** Fitted 2nd-order (Butterworth) corner for the loss beyond 200 m. */
function fitFarCorner(extraMetres, atmosphere = {}) {
  const { tempC = 20, humidity = 70, pressureKPa = 101.325 } = atmosphere;
  const target = BANDS.map((f) => airAbsorption(f, tempC, humidity, pressureKPa) * extraMetres);
  let best = [Infinity, 20000];
  for (let fc = 200; fc < 100000; fc *= 1.02) {
    let e = 0;
    BANDS.forEach((f, i) => { if (target[i] <= 40) e = Math.max(e, Math.abs(10 * Math.log10(1 + (f / fc) ** 4) - target[i])); });
    if (e < best[0]) best = [e, fc];
  }
  return best[1];
}

/** Analog loss (dB) of the near-range model at frequency f and distance d, for tests. */
function modelLossDb(f, d, corner) {
  const k = Math.min(MAX_SECTIONS, d / SECTION_METRES);
  return k * 10 * Math.log10(1 + (f / corner) ** 2);
}

/**
 * Streaming air-absorption filter: up to 8 one-pole sections; the output
 * blends adjacent taps of the cascade for fractional section counts so
 * distance changes glide instead of stepping.
 */
class AirFilter {
  constructor(fs, atmosphere) {
    this.fs = fs;
    this.s = new Float64Array(MAX_SECTIONS);
    this.k = 0;
    this.far = null;
    this.farMetres = 0;
    this.setAtmosphere(atmosphere);
  }

  setAtmosphere(atmosphere = {}) {
    this.atmosphere = atmosphere;
    this.corner = fitSectionCorner(atmosphere);
    const fc = Math.min(this.corner, this.fs * 0.45);
    this.a = Math.exp((-2 * Math.PI * fc) / this.fs);
  }

  /** @param {number} distance metres */
  setDistance(distance) {
    this.k = Math.min(MAX_SECTIONS, Math.max(0, distance / SECTION_METRES));
    const extra = distance - MAX_SECTIONS * SECTION_METRES;
    if (extra > 5) {
      if (!this.far || Math.abs(extra - this.farMetres) > 10) {   // refit only on real change
        this.farMetres = extra;
        const fc = fitFarCorner(extra, this.atmosphere);
        (this.far ||= new Biquad(this.fs)).lowpass(fc, Math.SQRT1_2);
      }
    } else {
      this.far = null;
    }
  }

  process(x) {
    const kInt = Math.floor(this.k), frac = this.k - kInt;
    const a = this.a, b = 1 - a;
    const n = Math.min(MAX_SECTIONS, kInt + (frac > 0 ? 1 : 0));
    let prev = x, atK = x;                 // atK: output after kInt sections
    for (let i = 0; i < n; i++) {
      this.s[i] = b * prev + a * this.s[i];
      prev = this.s[i];
      if (i === kInt - 1) atK = prev;
    }
    // fractional count: blend the tap after kInt sections with the next one
    let y = frac > 0 && n > kInt ? (1 - frac) * atK + frac * this.s[kInt] : atK;
    if (this.far) y = this.far.process(y);
    return y;
  }
}
return{airAbsorption,SECTION_METRES,MAX_SECTIONS,fitSectionCorner,fitFarCorner,modelLossDb,AirFilter};
})();
// ---- resonator.js ----
const __se_resonator_js=(()=>{

/**
 * Impulse-invariant two-pole resonator: an impulse of size A produces exactly
 * A * sin(2 pi f t) * exp(-d t). Linear, so many impulses sum to many
 * independent decaying sinusoids, which is what makes a resonator bank equal
 * to one-voice-per-event synthesis (dlist/E15).
 */
class Resonator {
  /**
   * @param {number} fs sample rate
   * @param {number} freq Hz
   * @param {number} decay amplitude decay rate d in 1/s (T60 = 6.9078 / d)
   */
  constructor(fs, freq, decay) {
    this.fs = fs;
    this.y1 = this.y2 = 0;
    this.pending = 0;
    this.x1 = 0;
    this.tune(freq, decay);
  }

  tune(freq, decay) {
    const w = 2 * Math.PI * Math.min(freq, this.fs * 0.49) / this.fs;
    const r = Math.exp(-decay / this.fs);
    this.a1 = 2 * r * Math.cos(w);
    this.a2 = -r * r;
    this.b1 = r * Math.sin(w);
    this.freq = freq;
    this.decay = decay;
  }

  /** Add an impulse that rings from the next sample on. */
  excite(amp) {
    this.pending += amp;
  }

  process(x = 0) {
    const y = this.b1 * this.x1 + this.a1 * this.y1 + this.a2 * this.y2;
    this.x1 = x + this.pending;
    this.pending = 0;
    this.y2 = this.y1;
    this.y1 = y;
    // flush subnormals so silent banks cost nothing and terminate
    if (Math.abs(this.y1) < 1e-30 && Math.abs(this.y2) < 1e-30) this.y1 = this.y2 = 0;
    return y;
  }

  /** @returns {boolean} true while still ringing above -120 dB of unit */
  get active() {
    return this.y1 !== 0 || this.y2 !== 0 || this.x1 !== 0 || this.pending !== 0;
  }
}

/** T60 in seconds to a decay rate d in 1/s. */
const t60ToDecay = (t60) => 6.907755 / t60;
return{Resonator,t60ToDecay};
})();
// ---- noise.js ----
const __se_noise_js=(()=>{

/**
 * Seeded xorshift32 noise. Deterministic: the same seed gives the same
 * stream, so tests and replays sound identical.
 */
class Noise {
  /** @param {number} seed non-zero 32-bit seed */
  constructor(seed = 0x9e3779b9) {
    this.state = seed >>> 0 || 1;
  }

  /** @returns {number} uniform in [0, 1) */
  uniform() {
    let x = this.state;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.state = x;
    return x / 4294967296;
  }

  /** @returns {number} uniform in [-1, 1) */
  bipolar() {
    return this.uniform() * 2 - 1;
  }

  /** Exponential gap for a Poisson process of `rate` events per second. */
  exponential(rate) {
    return -Math.log(1 - this.uniform()) / rate;
  }
}
return{Noise};
})();
// ---- bubbles.js ----
const __se_bubbles_js=(()=>{
const {Resonator}=__se_resonator_js;
const {Noise}=__se_noise_js;
/**
 * Bubble acoustics after van den Doel 2005 (ACM TAP 2:534):
 * a bubble rings at the Minnaert frequency f = 3 / r and decays at
 * d = 0.13 / r + 0.0072 r^-1.5 (r in metres).
 */
const minnaert = (r) => 3 / r;
const bubbleDecay = (r) => 0.13 / r + 0.0072 * r ** -1.5;

/**
 * Radius-binned resonator bank. Every bubble adds an impulse to the nearest
 * bin; by linearity that equals summing per-bubble voices exactly, at a fixed
 * cost of `bins` resonators instead of rate x lifetime voices (48 voices at
 * 1000 bubbles/s, 351 at 10000/s; dlist/E15).
 */
class BubbleBank {
  constructor(fs, { minRadius = 0.0002, maxRadius = 0.005, bins = 16 } = {}) {
    this.fs = fs;
    this.radii = [];
    this.res = [];
    for (let k = 0; k < bins; k++) {
      const r = minRadius * (maxRadius / minRadius) ** (k / (bins - 1));
      this.radii.push(r);
      this.res.push(new Resonator(fs, minnaert(r), bubbleDecay(r)));
    }
    this.logMin = Math.log(minRadius);
    this.logStep = Math.log(maxRadius / minRadius) / (bins - 1);
  }

  /** @param {number} r bubble radius (m) @param {number} amp impulse size */
  add(r, amp) {
    const k = Math.round((Math.log(r) - this.logMin) / this.logStep);
    this.res[Math.min(this.res.length - 1, Math.max(0, k))].excite(amp);
  }

  process() {
    let y = 0;
    for (const r of this.res) y += r.process();
    return y;
  }
}

/**
 * A handful of free voices for sparse drips whose pitch rises as the bubble
 * nears the surface: f(t) = f0 (1 + xi d t), xi ~ 0.1. A fixed bank cannot do
 * this (time-varying pitch), so keep these few and sparse.
 */
class RisingBubbles {
  constructor(fs, maxVoices = 4) {
    this.fs = fs;
    this.voices = Array.from({ length: maxVoices }, () => ({ on: false }));
  }

  add(r, amp, xi = 0.1) {
    let v = this.voices.find((x) => !x.on);
    if (!v) v = this.voices.reduce((a, b) => (a.t > b.t ? a : b)); // steal the oldest drip
    Object.assign(v, { on: true, f0: minnaert(r), d: bubbleDecay(r), amp, xi, t: 0, ph: 0 });
  }

  process() {
    let y = 0;
    const dt = 1 / this.fs;
    for (const v of this.voices) {
      if (!v.on) continue;
      v.ph += 2 * Math.PI * v.f0 * (1 + v.xi * v.d * v.t) * dt;
      const env = Math.exp(-v.d * v.t);
      y += v.amp * Math.sin(v.ph) * env;
      v.t += dt;
      if (env < 1e-4) v.on = false;
    }
    return y;
  }
}

/** Water presets: bubbles per second and radius-size exponent (1/r^gamma). */
const WATER_PRESETS = {
  drip: { rate: 3, gamma: 1, minRadius: 0.001, maxRadius: 0.004, rising: 1 },
  stream: { rate: 800, gamma: 2, minRadius: 0.0005, maxRadius: 0.005, rising: 0.02 },
  rain: { rate: 4000, gamma: 6, minRadius: 0.0001, maxRadius: 0.002, rising: 0 },
  splash: { rate: 0, gamma: 2, minRadius: 0.0008, maxRadius: 0.008, rising: 0.1 },
};

/**
 * Stochastic bubble stream driving a bank (dense) and rising voices (sparse).
 * Seeded: same seed, same water.
 */
class WaterSource {
  constructor(fs, preset = 'stream', seed = 1) {
    this.fs = fs;
    this.noise = new Noise(seed);
    this.setPreset(preset);
    this.rising = new RisingBubbles(fs);
    this.next = 0;
    this.gain = 1;
  }

  setPreset(name) {
    const p = typeof name === 'string' ? WATER_PRESETS[name] : name;
    this.p = { ...p };
    this.bank = new BubbleBank(this.fs, { minRadius: p.minRadius, maxRadius: p.maxRadius });
    this.next = 0;
    // uncorrelated bubbles add in power: keep loudness steady across rates
    this.norm = 3 / Math.sqrt(Math.max(p.rate, 10));
  }

  /** Sample a radius from a 1/r^gamma distribution between min and max. */
  _radius() {
    const { minRadius: a, maxRadius: b, gamma: g } = this.p;
    const u = this.noise.uniform();
    if (Math.abs(g - 1) < 1e-6) return a * (b / a) ** u;
    const e = 1 - g;
    return (a ** e + u * (b ** e - a ** e)) ** (1 / e);
  }

  /** Burst of n bubbles now (splashes, footsteps in water). */
  burst(n, energy = 1) {
    for (let i = 0; i < n; i++) this._emit(energy);
  }

  _emit(energy) {
    const r = this._radius();
    const amp = energy * (r / this.p.maxRadius) ** 0.5 * (0.5 + this.noise.uniform());
    if (this.noise.uniform() < this.p.rising) this.rising.add(r, amp);
    else this.bank.add(r, amp);
  }

  process() {
    if (this.p.rate > 0) {
      this.next -= 1 / this.fs;
      while (this.next <= 0) {
        this._emit(1);
        this.next += this.noise.exponential(this.p.rate);
      }
    }
    return this.gain * this.norm * (this.bank.process() + this.rising.process());
  }
}
return{minnaert,bubbleDecay,BubbleBank,RisingBubbles,WATER_PRESETS,WaterSource};
})();
// ---- contact.js ----
const __se_contact_js=(()=>{

/**
 * Hertz impact contact. Contact time tc = 2.87 (m^2 / (R E*^2 v))^(1/5)
 * (checked against an RK4 integration of m x'' = -k x^1.5 to 0.999).
 * With a soft fleshy pad, E* is set by the pad: packed dirt and sandstone
 * differ by 2.6% in tc, only claws (5.1x) or mud (1.55x) change it
 * (dlist/E17). Surface identity therefore comes from the surface response.
 */
function effectiveModulus(e1, e2, nu1 = 0.4, nu2 = 0.4) {
  return 1 / ((1 - nu1 * nu1) / e1 + (1 - nu2 * nu2) / e2);
}

/**
 * @param {number} mass effective impacting mass (kg)
 * @param {number} speed impact speed (m/s)
 * @param {number} radius contact radius of curvature (m)
 * @param {number} estar effective modulus (Pa)
 * @returns {number} contact duration (s)
 */
function hertzContactTime(mass, speed, radius, estar) {
  return 2.87 * ((mass * mass) / (radius * estar * estar * Math.max(speed, 1e-3))) ** 0.2;
}

/** Moduli (Pa) used by the footstep presets; game estimates. */
const MODULI = {
  pad: 2e6,
  claw: 2e9,
  mud: 1e6,
  packedDirt: 30e6,
  sand: 15e6,
  wood: 1e9,
  sandstone: 15e9,
  water: 2e6,
};
return{effectiveModulus,hertzContactTime,MODULI};
})();
// ---- delayline.js ----
const __se_delayline_js=(()=>{

/**
 * Circular delay line with fractional reads. Doppler is a read position that
 * slides by v/c samples per sample; a fraction-dependent interpolator then
 * amplitude-modulates the signal. Linear left 8 kHz spurs at -29 dB whether
 * walking or sprinting; 4-point Lagrange -43 dB, 6-point -57 dB (dlist/E23).
 */
class DelayLine {
  /** @param {number} maxSamples longest delay needed */
  constructor(maxSamples) {
    let n = 8;
    while (n < maxSamples + 8) n <<= 1;
    this.buf = new Float32Array(n);
    this.mask = n - 1;
    this.w = 0;
  }

  write(x) {
    this.buf[this.w] = x;
    this.w = (this.w + 1) & this.mask;
  }

  /**
   * Read `delay` samples behind the most recent write.
   * @param {number} delay fractional delay in samples (>= 3 for lagrange6)
   * @param {'linear'|'lagrange4'|'lagrange6'} mode
   */
  read(delay, mode = 'lagrange4') {
    const pos = this.w - 1 - delay;
    const i = Math.floor(pos);
    const a = pos - i;
    const b = this.buf, m = this.mask;
    const at = (k) => b[(i + k) & m];
    if (mode === 'linear') return (1 - a) * at(0) + a * at(1);
    if (mode === 'lagrange6') {
      let y = 0;
      for (let j = -2; j <= 3; j++) {
        let L = 1;
        for (let k = -2; k <= 3; k++) if (k !== j) L *= (a - k) / (j - k);
        y += L * at(j);
      }
      return y;
    }
    const xm1 = at(-1), x0 = at(0), x1 = at(1), x2 = at(2);
    return (-a * (a - 1) * (a - 2) / 6) * xm1
      + ((a + 1) * (a - 1) * (a - 2) / 2) * x0
      - ((a + 1) * a * (a - 2) / 2) * x1
      + ((a + 1) * a * (a - 1) / 6) * x2;
  }

  /** Integer tap, used by the reverb. */
  tap(delay) {
    return this.buf[(this.w - 1 - delay) & this.mask];
  }
}
return{DelayLine};
})();
// ---- fdn.js ----
const __se_fdn_js=(()=>{
const {DelayLine}=__se_delayline_js;
const BASE_DELAYS = [601, 691, 797, 907, 1031, 1153, 1277, 1399]; // at 16 kHz, size 1

/**
 * 8-line feedback delay network with a Householder matrix and a Jot one-pole
 * absorption filter per line. Per-line gains come from each line's own length
 * (g = 10^(-3 m / (fs T60))); per-band T60 lands within 4% of target from one
 * deterministic network, with none of the seed scatter of noise IRs
 * (dlist/E24, dlist/E19).
 */
class FDNReverb {
  constructor(fs, { size = 1, t60Low = 1.5, t60High = 0.8 } = {}) {
    this.fs = fs;
    this.n = BASE_DELAYS.length;
    this.setSize(size);
    this.setDecay(t60Low, t60High);
  }

  setSize(size) {
    this.delays = BASE_DELAYS.map((d) => Math.max(8, Math.round((d * size * this.fs) / 16000)));
    this.lines = this.delays.map((d) => new DelayLine(d + 4));
    this.lp = new Float64Array(this.n);
    if (this.t60Low) this.setDecay(this.t60Low, this.t60High);
  }

  /** Low-frequency and high-frequency T60 in seconds (applied at once). */
  setDecay(t60Low, t60High) {
    this.t60Low = t60Low;
    this.t60High = Math.min(t60High, t60Low);
    this.coef = this._coefs(this.t60Low, this.t60High);
    this.glide = null;
  }

  _coefs(lo, hi) {
    return this.delays.map((m) => {
      const kdc = 10 ** ((-3 * m) / (this.fs * lo));
      const kny = 10 ** ((-3 * m) / (this.fs * hi));
      const a = (kdc - kny) / (kdc + kny);
      return [kdc * (1 - a), a];
    });
  }

  /**
   * Glide to new T60s on the same delay lines: no rebuild, no hole in the
   * tail (a rebuild silenced the reverb for the first delay length).
   */
  glideDecay(t60Low, t60High, seconds = 0.3) {
    const hi = Math.min(t60High, t60Low);
    this.glide = { from: [this.t60Low, this.t60High], to: [t60Low, hi], n: 0, len: Math.max(1, Math.round(seconds * this.fs)) };
  }

  _stepGlide() {
    const g = this.glide;
    g.n = Math.min(g.len, g.n + 128);
    const u = g.n / g.len;
    // interpolate decay *rates* (1/T60) so the glide is even in dB/s
    const lo = 1 / ((1 - u) / g.from[0] + u / g.to[0]);
    const hi = 1 / ((1 - u) / g.from[1] + u / g.to[1]);
    this.t60Low = lo; this.t60High = Math.min(hi, lo);
    this.coef = this._coefs(this.t60Low, this.t60High);
    if (g.n >= g.len) this.glide = null;
  }

  /**
   * @param {number} x mono input
   * @param {Float64Array|number[]} out 2-element array receiving [left, right]
   */
  process(x, out) {
    if (this.glide && (this._g = (this._g || 0) + 1) % 128 === 0) this._stepGlide();
    const n = this.n;
    let sum = 0, l = 0, r = 0;
    const f = this._f || (this._f = new Float64Array(n));
    for (let i = 0; i < n; i++) {
      const tap = this.lines[i].tap(this.delays[i] - 1);
      const [b, a] = this.coef[i];
      this.lp[i] = b * tap + a * this.lp[i];
      f[i] = this.lp[i];
      sum += f[i];
      if (i & 1) r += tap; else l += tap;
    }
    const s = (2 / n) * sum;
    for (let i = 0; i < n; i++) {
      let v = f[i] - s + x;
      if (Math.abs(v) < 1e-30) v = 0;
      this.lines[i].write(v);
    }
    out[0] = l * 0.35;
    out[1] = r * 0.35;
    return out;
  }
}

/**
 * Zone presets: low/high T60 (s), network size and critical distance rc (m),
 * where the reverb equals the direct sound. Game estimates; tune by ear.
 */
const ZONES = {
  openPlain: { t60Low: 0.35, t60High: 0.15, size: 2.0, criticalDistance: 60 },
  coniferForest: { t60Low: 1.6, t60High: 0.7, size: 1.4, criticalDistance: 20 },
  fernSwamp: { t60Low: 0.6, t60High: 0.2, size: 0.8, criticalDistance: 15 },
  rockyGully: { t60Low: 1.2, t60High: 0.9, size: 1.0, criticalDistance: 8 },
  cave: { t60Low: 2.8, t60High: 1.6, size: 1.2, criticalDistance: 3 },
  room: { t60Low: 0.6, t60High: 0.4, size: 0.4, criticalDistance: 2.5 },
};

/**
 * Total stereo energy (left + right) of the network for a unit impulse in.
 * Compared against the direct sound's total power (equal-power pan keeps
 * l^2 + r^2 = 1). Measuring a mono (L+R)/2 fold instead understates the
 * decorrelated reverb by 10log10(4/(1+rho)): 5 dB for this network, 6 dB if fully uncorrelated.
 */
function reverbEnergy(fs, zone) {
  const rv = new FDNReverb(fs, zone);
  const out = [0, 0];
  let e = 0;
  const n = Math.ceil(fs * zone.t60Low * 1.3);
  for (let i = 0; i < n; i++) {
    rv.process(i === 0 ? 1 : 0, out);
    e += out[0] * out[0] + out[1] * out[1];
  }
  return e;
}

/**
 * Reverb send for a zone so D/R = 0 dB at the zone's critical distance:
 * send x sendGain(rc) = 1 / (rc * sqrt(E_rev)), where the per-source send
 * gain falls ~1 dB per doubling (rc^(-1/6.02)) and is applied before the
 * distance gain.
 */
function zoneSend(fs, zone, energy = reverbEnergy(fs, zone)) {
  const rc = zone.criticalDistance;
  return 1 / (rc ** (1 - 1 / 6.02) * Math.sqrt(energy));
}
return{FDNReverb,ZONES,reverbEnergy,zoneSend};
})();
// ---- modal.js ----
const __se_modal_js=(()=>{
const {Resonator}=__se_resonator_js;
/**
 * Bank of ringing modes. Per-mode T60 = 2.2 / (eta f) for a material loss
 * factor eta, so high modes die first, as they do in wood and stone.
 */
class ModalBank {
  /**
   * @param {number} fs sample rate
   * @param {{freq:number, gain:number, t60?:number}[]} modes
   * @param {number} lossFactor eta, used when a mode has no t60
   */
  constructor(fs, modes, lossFactor = 0.01) {
    this.modes = modes.map((m) => {
      const t60 = m.t60 ?? 2.2 / (lossFactor * m.freq);
      return { gain: m.gain, r: new Resonator(fs, m.freq, 6.907755 / t60) };
    });
  }

  /** Strike with an amplitude and a brightness 0..1 that tilts mode gains. */
  strike(amp, brightness = 0.5) {
    const n = this.modes.length;
    this.modes.forEach((m, i) => {
      const tilt = n > 1 ? brightness ** (i / (n - 1)) * (1 - brightness) ** (1 - i / (n - 1)) * 2 : 1;
      m.r.excite(amp * m.gain * Math.max(tilt, 0.05));
    });
  }

  process() {
    let y = 0;
    for (const m of this.modes) y += m.r.process();
    return y;
  }
}

/**
 * Inharmonic mode sets for game surfaces, scaled by a size factor
 * (bigger slab or log -> lower modes). Ratios loosely follow free plates and
 * bars; loss factors are game estimates (wood ~0.01, stone ~0.01-0.02).
 */
const SURFACE_MODES = {
  sandstone: { base: 900, ratios: [1, 1.59, 2.14, 2.65, 3.6, 4.15], loss: 0.015 },
  wood: { base: 260, ratios: [1, 2.76, 5.4, 8.93], loss: 0.01 },
  bone: { base: 1400, ratios: [1, 2.76, 5.4], loss: 0.02 },
};

function surfaceBank(fs, name, size = 1) {
  const s = SURFACE_MODES[name];
  if (!s) return null;
  const modes = s.ratios.map((r, i) => ({ freq: (s.base * r) / size, gain: 1 / (1 + i) }));
  return new ModalBank(fs, modes, s.loss);
}
return{ModalBank,SURFACE_MODES,surfaceBank};
})();
// ---- footstep.js ----
const __se_footstep_js=(()=>{
const {Noise}=__se_noise_js;
const {Biquad}=__se_biquad_js;
const {surfaceBank}=__se_modal_js;
const {WaterSource}=__se_bubbles_js;
const {effectiveModulus, hertzContactTime, MODULI}=__se_contact_js;
/**
 * Footsteps from physics (dlist/E17). Each step has two parts:
 *  - the pad impact: a half-sine force pulse of Hertz contact time
 *    tc ~ M^0.33 v^-0.2, low-passed contact noise riding on it. Heavier is
 *    darker; sprinting only a little brighter. Ground hardness barely moves
 *    tc under a soft pad, except mud.
 *  - the surface's own response: modes for stone/wood (rung by claw clicks),
 *    debris grains for dirt/sand, slow suction for mud, bubbles for water.
 */
const SURFACES = ['packedDirt', 'sand', 'sandstone', 'wood', 'mud', 'water'];

class FootstepSynth {
  constructor(fs, seed = 7) {
    this.fs = fs;
    this.noise = new Noise(seed);
    this.events = [];
    this.banks = {
      sandstone: surfaceBank(fs, 'sandstone'),
      wood: surfaceBank(fs, 'wood'),
    };
    this.water = new WaterSource(fs, 'splash', seed + 1);
    this.mudBubbles = new WaterSource(fs, { rate: 0, gamma: 1, minRadius: 0.004, maxRadius: 0.012, rising: 0.3 }, seed + 2);
    this.lp = new Biquad(fs).lowpass(400);
    this.debrisBp = new Biquad(fs).bandpass(3000, 0.8);
    this.suctionLp = new Biquad(fs).lowpass(500);
  }

  /**
   * @param {object} o
   * @param {number} o.mass body mass (kg)
   * @param {number} o.speed walking/running speed (m/s)
   * @param {string} o.surface one of SURFACES
   * @param {boolean} [o.claws] hard claws touch the ground
   * @param {number} [o.gain] overall level
   * @param {number} [o.delay] seconds from now
   */
  step({ mass, speed, surface = 'packedDirt', claws = false, gain = 1, delay = 0 }) {
    const footMass = 0.2 * mass;
    const radius = 0.02 * Math.cbrt(mass);
    const impactV = 0.3 + 0.25 * speed;            // foot strike speed grows with gait speed
    const ground = MODULI[surface] ?? MODULI.packedDirt;
    const tc = hertzContactTime(footMass, impactV, radius, effectiveModulus(MODULI.pad, ground));
    const level = gain * Math.min(1, Math.log10(1 + footMass * impactV) / 2.5);
    const start = Math.round(delay * this.fs);
    this.events.push({ kind: 'pad', at: start, len: Math.round(tc * this.fs), level, t: 0 });
    this.lp.lowpass(Math.min(2000, 4 / tc));

    if (claws && (surface === 'sandstone' || surface === 'wood')) {
      const tcc = hertzContactTime(footMass * 0.05, impactV, 0.002, effectiveModulus(MODULI.claw, ground));
      const brightness = Math.min(1, 0.0008 / tcc);
      for (let k = 0; k < 3; k++) {
        this.events.push({ kind: 'claw', at: start + Math.round((0.004 + 0.006 * k) * this.fs), level: level * 0.4, brightness, surface, t: 0 });
      }
    } else if (surface === 'sandstone' || surface === 'wood') {
      this.events.push({ kind: 'claw', at: start, level: level * 0.12, brightness: 0.15, surface, t: 0 });
    }
    if (surface === 'packedDirt' || surface === 'sand') {
      const grains = Math.round(6 + 10 * speed * (surface === 'sand' ? 1.6 : 1));
      for (let k = 0; k < grains; k++) {
        const dt = (0.002 + this.noise.uniform() * (surface === 'sand' ? 0.09 : 0.05)) * this.fs;
        this.events.push({ kind: 'grain', at: start + Math.round(dt), len: Math.round(0.002 * this.fs), level: level * 0.25 * this.noise.uniform(), t: 0 });
      }
    }
    if (surface === 'mud') {
      this.events.push({ kind: 'suction', at: start + Math.round(0.06 * this.fs), len: Math.round(0.25 * this.fs), level: level * 0.5, t: 0 });
      this.events.push({ kind: 'mudpop', at: start + Math.round(0.18 * this.fs), level, n: 1 + Math.round(2 * this.noise.uniform()), t: 0 });
    }
    if (surface === 'water') {
      this.events.push({ kind: 'splash', at: start, level, n: Math.round(10 + 40 * Math.min(1, footMass * impactV / 40)), t: 0 });
    }
  }

  process() {
    let y = 0;
    let padIn = 0, grainIn = 0, suctionIn = 0;
    const keep = [];
    for (const e of this.events) {
      if (e.at > 0) { e.at--; keep.push(e); continue; }
      switch (e.kind) {
        case 'pad': {
          const ph = e.t / e.len;
          padIn += e.level * Math.sin(Math.PI * ph) * (0.6 + 0.4 * this.noise.bipolar());
          if (++e.t < e.len) keep.push(e);
          break;
        }
        case 'grain':
          grainIn += e.level * this.noise.bipolar() * (1 - e.t / e.len);
          if (++e.t < e.len) keep.push(e);
          break;
        case 'suction': {
          const ph = e.t / e.len;
          suctionIn += e.level * this.noise.bipolar() * Math.sin(Math.PI * ph) ** 2;
          if (++e.t < e.len) keep.push(e);
          break;
        }
        case 'claw':
          this.banks[e.surface].strike(e.level, e.brightness);
          break;
        case 'splash':
          this.water.burst(e.n, e.level);
          break;
        case 'mudpop':
          this.mudBubbles.burst(e.n, e.level * 0.6);
          break;
      }
    }
    this.events = keep;
    y += this.lp.process(padIn) * 2;
    y += this.debrisBp.process(grainIn);
    y += this.suctionLp.process(suctionIn);
    y += (this.banks.sandstone.process() + this.banks.wood.process()) * 0.3;
    y += this.water.process() * 0.3 + this.mudBubbles.process() * 0.3;
    return y;
  }
}
return{SURFACES,FootstepSynth};
})();
// ---- occlusion.js ----
const __se_occlusion_js=(()=>{

/**
 * Terrain occlusion. Maekawa's barrier loss A = 10 log10(3 + 20 N) with
 * N = 2 delta f / c is exactly A = 4.77 dB + 10 log10(1 + f / fc),
 * fc = 3c / (40 delta) = 25.7 / delta Hz: a -3 dB/octave ("half-order")
 * low-pass. A one-pole low-pass (-6 dB/oct) misses by 1.9-3.6 dB; a chain of
 * first-order shelves tracks it within about half a dB (dlist/E21).
 */
const C = 343;

const maekawaCorner = (delta) => (3 * C) / (40 * Math.max(delta, 1e-4));

/** Exact Maekawa loss in dB (positive = attenuation). */
function maekawaLoss(f, delta) {
  if (delta <= 0) return 0;
  return 10 * Math.log10(3 + (40 * delta * f) / C);
}

/** One first-order high-shelf cut via the bilinear transform with prewarp. */
class ShelfCut {
  constructor(fs, pole, zero) {
    const k = (f) => Math.tan((Math.PI * Math.min(f, fs * 0.45)) / fs);
    const wp = k(pole), wz = k(zero);
    // H(s) = (1 + s/wz) / (1 + s/wp), mapped with s = (1 - z^-1)/(1 + z^-1)
    const b0 = 1 / wz + 1, b1 = 1 - 1 / wz;
    const a0 = 1 / wp + 1, a1 = 1 - 1 / wp;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.a1 = a1 / a0;
    this.x1 = 0; this.y1 = 0;
  }

  process(x) {
    const y = this.b0 * x + this.b1 * this.x1 - this.a1 * this.y1;
    this.x1 = x; this.y1 = y;
    return y;
  }

  /** magnitude at f, for tests */
  static analogDb(f, pole, zero) {
    return 10 * Math.log10((1 + (f / zero) ** 2) / (1 + (f / pole) ** 2));
  }
}

/**
 * Shelf layout: pole/zero pairs every 0.9 octave from fc, zero = 2^0.4275 x
 * pole, plus a fixed 5.5 dB floor (min-max fitted over 63 Hz-8 kHz for
 * delta 0.02-10 m: within about 0.6 dB of Maekawa).
 */
function shelfLayout(delta, fs = 48000) {
  const fc = maekawaCorner(delta);
  const spacing = 2 ** 0.9, ratio = 2 ** 0.4275;
  const pairs = [];
  for (let p = fc; p < Math.min(20000, fs * 0.45); p *= spacing) pairs.push([p, p * ratio]);
  return { fc, pairs, floorDb: 5.5 };
}

/** Analog response of the shelf chain in dB of loss, for tests and tooling. */
function shelfLossDb(f, delta) {
  if (delta <= 0) return 0;
  const { pairs, floorDb } = shelfLayout(delta);
  let loss = floorDb;
  for (const [p, z] of pairs) loss -= ShelfCut.analogDb(f, p, z);
  return loss;
}

/** Streaming occlusion filter. Rebuild with setDelta() when geometry changes a lot. */
class OcclusionFilter {
  constructor(fs) {
    this.fs = fs;
    this.setDelta(0);
  }

  /** @param {number} delta path difference over the obstacle (m); 0 = clear line of sight */
  setDelta(delta) {
    this.delta = delta;
    if (delta <= 0) {
      this.chain = [];
      this.gain = 1;
      return;
    }
    const { pairs, floorDb } = shelfLayout(delta, this.fs);
    this.chain = pairs.map(([p, z]) => new ShelfCut(this.fs, p, z));
    this.gain = 10 ** (-floorDb / 20);
  }

  process(x) {
    for (const s of this.chain) x = s.process(x);
    return x * this.gain;
  }
}

/** Path difference over a single ridge: source S, listener L, ridge top T (x, y). */
function ridgeDelta(s, l, t) {
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const direct = d(s, l);
  // only blocks when the ridge top is above the straight line S-L
  const u = (t[0] - s[0]) / (l[0] - s[0] || 1e-9);
  const lineY = s[1] + u * (l[1] - s[1]);
  if (u <= 0 || u >= 1 || t[1] <= lineY) return 0;
  return d(s, t) + d(t, l) - direct;
}
return{maekawaCorner,maekawaLoss,shelfLayout,shelfLossDb,OcclusionFilter,ridgeDelta};
})();
// ---- panlaw.js ----
const __se_panlaw_js=(()=>{

/**
 * Pan laws. Equal-power keeps stereo power flat but swells a centred,
 * correlated source +3.01 dB on a phone that folds to mono; linear is flat in
 * mono but dips -3.01 dB on headphones; -4.5 dB errs +-1.51 dB on both.
 * Decorrelated beds fold flat under equal-power (dlist/E26).
 */
const PAN_LAWS = ['equal-power', 'linear', '-4.5dB'];

/** Law for an output device: 'headphones' | 'stereo' | 'mono' | 'unknown'. */
function lawForDevice(device) {
  if (device === 'mono') return 'linear';
  if (device === 'unknown') return '-4.5dB';
  return 'equal-power';
}

/**
 * @param {number} pan -1 (left) .. +1 (right)
 * @param {string} law
 * @returns {[number, number]} [left gain, right gain]
 */
function panGains(pan, law = 'equal-power') {
  const p = (Math.max(-1, Math.min(1, pan)) + 1) / 2;
  const th = (p * Math.PI) / 2;
  if (law === 'linear') return [1 - p, p];
  if (law === '-4.5dB') return [Math.sqrt((1 - p) * Math.cos(th)), Math.sqrt(p * Math.sin(th))];
  return [Math.cos(th), Math.sin(th)];
}
return{PAN_LAWS,lawForDevice,panGains};
})();
// ---- smoother.js ----
const __se_smoother_js=(()=>{

/**
 * Per-sample linear ramp toward a target. Game code writes targets once per
 * frame; ramping across the next frame removes the staircase that raw
 * frame-rate writes leave (60 fps steps on a 12 dB/s fade spur at -49 dB,
 * a ramp matches per-sample gain at -72 dB; see dlist/E25).
 */
class Ramp {
  constructor(value = 0) {
    this.value = value;
    this.target = value;
    this.step = 0;
    this.remaining = 0;
  }

  /**
   * @param {number} target value to reach
   * @param {number} samples ramp length; use one frame (e.g. 800 at 48 kHz / 60 fps)
   */
  setTarget(target, samples) {
    this.target = target;
    if (samples <= 0) {
      this.value = target;
      this.remaining = 0;
      this.step = 0;
      return;
    }
    this.remaining = Math.round(samples);
    this.step = (target - this.value) / this.remaining;
  }

  /** Jump without a ramp (use only while silent). */
  reset(value) {
    this.value = this.target = value;
    this.remaining = 0;
    this.step = 0;
  }

  next() {
    if (this.remaining > 0) {
      this.value += this.step;
      if (--this.remaining === 0) this.value = this.target;
    }
    return this.value;
  }
}
return{Ramp};
})();
// ---- spatial.js ----
const __se_spatial_js=(()=>{
const {DelayLine}=__se_delayline_js;
const {Ramp}=__se_smoother_js;
const {OcclusionFilter}=__se_occlusion_js;
const {AirFilter}=__se_air_js;
const {panGains}=__se_panlaw_js;
const SPEED_OF_SOUND = 343;
const HEAD_RADIUS = 0.0875;

/** Woodworth interaural time difference (s) for a lateral angle theta (rad). */
const woodworthITD = (theta) => (HEAD_RADIUS / SPEED_OF_SOUND) * (theta + Math.sin(theta));

/**
 * Per-frame spatial parameters for one source, from world positions.
 * Pure function: safe to unit-test and to run on the main thread.
 * @param {{x:number,y:number,z?:number,yaw?:number}} listener yaw in radians, 0 = facing +y
 * @param {{x:number,y:number,z?:number}} source
 * @param {object} [o]
 * @param {number} [o.refDistance] distance with 0 dB attenuation
 * @param {number} [o.rolloff] 1 = inverse distance (-6 dB per doubling)
 * @param {number} [o.occlusionDelta] path difference over terrain (m)
 * @returns {{distance:number, gain:number, sendGain:number, pan:number, delay:number, occlusionDelta:number}}
 */
function spatialize(listener, source, { refDistance = 1, rolloff = 1, occlusionDelta = 0 } = {}) {
  const dx = source.x - listener.x, dy = source.y - listener.y, dz = (source.z ?? 0) - (listener.z ?? 0);
  const distance = Math.max(1e-3, Math.hypot(dx, dy, dz));
  const gain = refDistance / Math.max(refDistance, refDistance + rolloff * (distance - refDistance));
  // reverb send falls only ~1 dB per doubling, so the direct-to-reverberant
  // ratio carries distance (a post-distance send held it constant)
  const sendGain = (refDistance / Math.max(refDistance, distance)) ** (1 / 6.02);
  const yaw = listener.yaw ?? 0;
  const rx = Math.cos(yaw), ry = -Math.sin(yaw);   // right vector when facing (sin yaw, cos yaw)
  const pan = Math.max(-1, Math.min(1, (dx * rx + dy * ry) / (Math.hypot(dx, dy) || 1e-9)));
  return { distance, gain, sendGain, pan, delay: distance / SPEED_OF_SOUND, occlusionDelta };
}

/**
 * Streaming spatializer: mono in, stereo direct out plus a mono reverb send.
 *  - distance delay through a fractional delay line (Doppler, Lagrange)
 *  - terrain occlusion (Maekawa shelf chain), applied to direct and send
 *  - air absorption (cascaded 25 m sections) on the direct path
 *  - distance gain on the direct path only; the send is tapped before it
 *  - pan law, plus a fractional Woodworth ITD when `binaural` (headphones)
 * Every target is ramped per sample across one frame.
 */
class Spatializer {
  constructor(fs, { maxDistance = 400, interp = 'lagrange4', law = 'equal-power', binaural = false, frameSamples, atmosphere } = {}) {
    this.fs = fs;
    this.line = new DelayLine(Math.ceil((maxDistance / SPEED_OF_SOUND) * fs) + 8);
    this.maxDelay = (maxDistance / SPEED_OF_SOUND) * fs;
    this.interp = interp;
    this.law = law;
    this.binaural = binaural;
    this.frame = frameSamples ?? Math.round(fs / 60);
    this.delay = new Ramp(8);
    this.gain = new Ramp(0);
    this.sendGain = new Ramp(0);
    this.left = new Ramp(0);
    this.right = new Ramp(0);
    this.itdL = new Ramp(0);
    this.itdR = new Ramp(0);
    this.itdLine = new DelayLine(64);
    this.occ = new OcclusionFilter(fs);
    this.air = new AirFilter(fs, atmosphere);
    this.send = 0;
    this.started = false;
  }

  /** Feed the latest spatialize() result (call once per game frame). */
  update(p) {
    const d = Math.min(this.maxDelay, Math.max(4, p.delay * this.fs));
    const [l, r] = panGains(p.pan, this.law);
    let il = 0, ir = 0;
    if (this.binaural) {
      const itd = woodworthITD(Math.asin(Math.min(1, Math.abs(p.pan)))) * this.fs;
      if (p.pan > 0) il = itd; else ir = itd;   // the far ear hears it later
    }
    const targets = [[this.delay, d], [this.gain, p.gain], [this.sendGain, p.sendGain ?? 1],
      [this.left, l], [this.right, r], [this.itdL, il], [this.itdR, ir]];
    for (const [ramp, v] of targets) {
      if (this.started) ramp.setTarget(v, this.frame); else ramp.reset(v);
    }
    this.started = true;
    if (Math.abs((p.occlusionDelta ?? 0) - this.occ.delta) > 0.01) this.occ.setDelta(p.occlusionDelta ?? 0);
    this.air.setDistance(p.distance ?? p.delay * SPEED_OF_SOUND);
  }

  /**
   * @param {number} x mono sample
   * @param {number[]} out receives [left, right]; `this.send` receives the mono send
   */
  process(x, out) {
    this.line.write(x);
    const y = this.occ.process(this.line.read(this.delay.next(), this.interp));
    this.send = y * this.sendGain.next();
    const direct = this.air.process(y) * this.gain.next();
    const l = this.left.next(), r = this.right.next();
    const dl = this.itdL.next(), dr = this.itdR.next();
    if (this.binaural || dl || dr) {
      this.itdLine.write(direct);
      out[0] = this.itdLine.read(2 + dl, 'lagrange4') * l;
      out[1] = this.itdLine.read(2 + dr, 'lagrange4') * r;
    } else {
      out[0] = direct * l;
      out[1] = direct * r;
    }
    return out;
  }
}
return{SPEED_OF_SOUND,HEAD_RADIUS,woodworthITD,spatialize,Spatializer};
})();
// ---- voice.js ----
const __se_voice_js=(()=>{
const {Biquad}=__se_biquad_js;
const {Noise}=__se_noise_js;
const C = 343;

/**
 * Open-mouth tract: tube closed at the glottis, open at the mouth.
 * F_n = (2n - 1) c / (4 L).
 */
function tractFormants(length, n = 5) {
  return Array.from({ length: n }, (_, i) => ((2 * i + 1) * C) / (4 * length));
}

/**
 * Highest f0 that keeps the heard F1 within 15%: the heard peak is the nearest
 * harmonic (error up to f0 / 2F1), so cap f0 at 0.3 F1; f0 at F1/2 can read
 * 20% off and a 200 Hz roar on a 0.7 m tract reads F1 at 200 Hz (dlist/E8).
 */
const maxOpenF0 = (length) => 0.3 * tractFormants(length, 1)[0];

/**
 * Closed-mouth calls radiate through an inflated throat sac with one
 * resonance (Fletcher et al. 2004, dove coo ~600 Hz at a 35 mm sac). Scale by
 * size^-1 (wall mass ~ volume) to size^-0.5 (fixed wall thickness);
 * exponent 0.75 sits between (dlist/E16).
 */
function sacResonance(sacDiameter, exponent = 0.75) {
  return 600 * (0.035 / sacDiameter) ** exponent;
}

/**
 * Size presets: vocal tract length and throat-sac diameter in metres.
 * Game estimates for the Dlist cast plus generic sizes.
 */
const CREATURES = {
  small: { tract: 0.12, sac: 0.05 },
  eodromaeus: { tract: 0.2, sac: 0.08 },
  medium: { tract: 0.4, sac: 0.18 },
  herrerasaurus: { tract: 0.7, sac: 0.35 },
  large: { tract: 1.2, sac: 0.6 },
};

/**
 * Source-filter creature voice. Open mode: glottal pulses through a parallel
 * formant bank set by tract length, with f0 capped at 0.3 F1. Closed mode: no
 * formants, one sac resonance (Q ~10) with f0 locked within 10% of it, so the
 * call is a near pure tone (99% in the fundamental at resonance).
 */
class CreatureVoice {
  constructor(fs, { tract = 0.7, sac = 0.35, seed = 3 } = {}) {
    this.fs = fs;
    this.noise = new Noise(seed);
    this.setSize(tract, sac);
    this.calls = [];
    this.phase = 0;
    this.sub = 0;
  }

  setSize(tract, sac) {
    this.tract = tract;
    this.sac = sac;
    this.formants = tractFormants(tract);
    this.bank = this.formants.map((f, i) => ({
      g: 1 / (1 + i * 0.7),
      bq: new Biquad(this.fs).bandpass(f, f / (50 + 0.06 * f)),
    }));
    this.sacFreq = sacResonance(sac);
    this.sacBq = new Biquad(this.fs).bandpass(this.sacFreq, 10);
  }

  /**
   * Start a call.
   * @param {object} o
   * @param {'open'|'closed'} [o.mode]
   * @param {number} [o.duration] seconds
   * @param {number} [o.f0] start pitch (Hz); clamped per mode
   * @param {number} [o.f0End] end pitch
   * @param {number} [o.amp]
   * @param {number} [o.roughness] 0..1 period doubling / growl
   * @param {number} [o.breath] 0..1 aspiration noise
   * @param {number} [o.jitter] 0..1 pitch wobble
   */
  call({ mode = 'open', duration = 1.2, f0, f0End, amp = 0.8, roughness = 0.3, breath = 0.15, jitter = 0.2 } = {}) {
    let a, b;
    if (mode === 'closed') {
      const lock = (x) => Math.min(this.sacFreq * 1.1, Math.max(this.sacFreq * 0.9, x ?? this.sacFreq));
      a = lock(f0); b = lock(f0End ?? a * 0.95);
    } else {
      const cap = maxOpenF0(this.tract);
      a = Math.min(f0 ?? cap * 0.8, cap);
      b = Math.min(f0End ?? a * 0.7, cap);
    }
    this.calls.push({ mode, len: Math.round(duration * this.fs), t: 0, a, b, amp, roughness, breath, jitter, wob: 0 });
  }

  get active() {
    return this.calls.length > 0;
  }

  /** Rosenberg glottal flow derivative over one period (phase 0..1). */
  static pulse(ph) {
    const tp = 0.4, tn = 0.16;
    if (ph < tp) return Math.sin((Math.PI * ph) / tp) * (Math.PI / tp) * 0.5;
    if (ph < tp + tn) return -Math.sin((Math.PI * (ph - tp)) / (2 * tn)) * (Math.PI / (2 * tn));
    return 0;
  }

  process() {
    let open = 0, closed = 0;
    const keep = [];
    for (const c of this.calls) {
      const u = c.t / c.len;
      const env = Math.min(1, u / 0.06) * Math.min(1, (1 - u) / 0.25);
      c.wob += (this.noise.bipolar() * 0.02 - c.wob * 0.001) * c.jitter;
      const f0 = (c.a * (c.b / c.a) ** u) * (1 + c.wob * 0.05);
      this.phase += f0 / this.fs;
      if (this.phase >= 1) { this.phase -= 1; this.sub ^= 1; }
      let s = CreatureVoice.pulse(this.phase) * (1 - c.roughness * 0.5 * this.sub);
      s += c.breath * this.noise.bipolar() * 0.5;
      s *= env * c.amp;
      if (c.mode === 'closed') closed += s; else open += s;
      if (++c.t < c.len) keep.push(c);
    }
    this.calls = keep;
    let y = 0;
    for (const f of this.bank) y += f.g * f.bq.process(open);
    y += this.sacBq.process(closed) * 1.5;
    return y * 0.5;
  }
}
return{tractFormants,maxOpenF0,sacResonance,CREATURES,CreatureVoice};
})();
return{Noise:__se_noise_js.Noise,Ramp:__se_smoother_js.Ramp,Biquad:__se_biquad_js.Biquad,SteepBand:__se_biquad_js.SteepBand,Resonator:__se_resonator_js.Resonator,t60ToDecay:__se_resonator_js.t60ToDecay,DelayLine:__se_delayline_js.DelayLine,BubbleBank:__se_bubbles_js.BubbleBank,RisingBubbles:__se_bubbles_js.RisingBubbles,WaterSource:__se_bubbles_js.WaterSource,WATER_PRESETS:__se_bubbles_js.WATER_PRESETS,minnaert:__se_bubbles_js.minnaert,bubbleDecay:__se_bubbles_js.bubbleDecay,ModalBank:__se_modal_js.ModalBank,SURFACE_MODES:__se_modal_js.SURFACE_MODES,surfaceBank:__se_modal_js.surfaceBank,hertzContactTime:__se_contact_js.hertzContactTime,effectiveModulus:__se_contact_js.effectiveModulus,MODULI:__se_contact_js.MODULI,FootstepSynth:__se_footstep_js.FootstepSynth,SURFACES:__se_footstep_js.SURFACES,CreatureVoice:__se_voice_js.CreatureVoice,CREATURES:__se_voice_js.CREATURES,tractFormants:__se_voice_js.tractFormants,maxOpenF0:__se_voice_js.maxOpenF0,sacResonance:__se_voice_js.sacResonance,FDNReverb:__se_fdn_js.FDNReverb,ZONES:__se_fdn_js.ZONES,reverbEnergy:__se_fdn_js.reverbEnergy,zoneSend:__se_fdn_js.zoneSend,AirFilter:__se_air_js.AirFilter,airAbsorption:__se_air_js.airAbsorption,fitSectionCorner:__se_air_js.fitSectionCorner,modelLossDb:__se_air_js.modelLossDb,OcclusionFilter:__se_occlusion_js.OcclusionFilter,maekawaLoss:__se_occlusion_js.maekawaLoss,maekawaCorner:__se_occlusion_js.maekawaCorner,shelfLossDb:__se_occlusion_js.shelfLossDb,ridgeDelta:__se_occlusion_js.ridgeDelta,panGains:__se_panlaw_js.panGains,lawForDevice:__se_panlaw_js.lawForDevice,PAN_LAWS:__se_panlaw_js.PAN_LAWS,spatialize:__se_spatial_js.spatialize,Spatializer:__se_spatial_js.Spatializer,SPEED_OF_SOUND:__se_spatial_js.SPEED_OF_SOUND,woodworthITD:__se_spatial_js.woodworthITD,HEAD_RADIUS:__se_spatial_js.HEAD_RADIUS};
})();
