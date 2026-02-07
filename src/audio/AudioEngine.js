export class AudioEngine {
  constructor() {
    this.audioContext = new AudioContext();

    // analyser used ONLY for oscilloscope (debug path)
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // polyphony output gain (prevents clipping)
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.2;
    this.masterGain.connect(this.audioContext.destination);

    this.oscillators = {}; // freq -> osc
    this.periodicWave = null;

    // The latest drawn waveform (one cycle), stored for oscilloscope alignment
    this.scopeWaveform = null;

    // --- Debug oscillator for oscilloscope only ---
    this.debugOsc = this.audioContext.createOscillator();
    this.debugOsc.type = "sine";
    this.debugOsc.frequency.value = 440;

    this.debugGain = this.audioContext.createGain();
    this.debugGain.gain.value = 0;

    // Scope sees the debug osc
    this.debugOsc.connect(this.analyser);

    // Silent output (avoid accidental sound)
    this.debugOsc.connect(this.debugGain);
    this.debugGain.connect(this.audioContext.destination);

    this.debugOsc.start();
  }

  ensureRunning() {
    if (this.audioContext.state !== "running") {
      this.audioContext.resume();
    }
  }

  hasWaveform() {
    return !!this.periodicWave;
  }

  /**
   * Resample the stored drawing waveform to exactly `numSamples` points.
   * This is used by the Oscilloscope to align the captured audio to the drawing.
   * @param {number} numSamples
   * @returns {Float32Array|null}
   */
  getScopeReferenceSamples(numSamples) {
    if (!this.scopeWaveform || numSamples < 2) return null;

    const src = this.scopeWaveform;
    const out = new Float32Array(numSamples);

    // Linear resample src -> out across one full cycle
    for (let i = 0; i < numSamples; i++) {
      const t = (i / (numSamples - 1)) * (src.length - 1);
      const i0 = Math.floor(t);
      const i1 = Math.min(src.length - 1, i0 + 1);
      const frac = t - i0;
      out[i] = src[i0] * (1 - frac) + src[i1] * frac;
    }

    return out;
  }

  /**
   * Convert a waveform Float32Array (samples in [-1,1]) into a PeriodicWave
   */
  setWaveform(waveform, harmonics = 64) {
    if (!waveform || waveform.length < 2) return;

    this.ensureRunning();

    // Make sure we store a Float32Array copy for the oscilloscope reference
    // (so it doesn't get mutated elsewhere)
    this.scopeWaveform = new Float32Array(waveform);

    const N = waveform.length;

    // real[n] = cosine coefficient (a_n)
    // imag[n] = sine coefficient   (b_n)
    const real = new Float32Array(harmonics + 1);
    const imag = new Float32Array(harmonics + 1);

    // DC offset (a_0)
    let dc = 0;
    for (let k = 0; k < N; k++) dc += waveform[k];
    real[0] = dc / N;
    imag[0] = 0;

    // Harmonics
    for (let n = 1; n <= harmonics; n++) {
      let a = 0;
      let b = 0;

      for (let k = 0; k < N; k++) {
        const phase = (2 * Math.PI * n * k) / N;
        const x = waveform[k];
        a += x * Math.cos(phase);
        b += x * Math.sin(phase);
      }

      // scale for Fourier series
      real[n] = (2 / N) * a;
      imag[n] = (2 / N) * b;
    }

    this.periodicWave = this.audioContext.createPeriodicWave(real, imag, {
      disableNormalization: false,
    });

    // Update debug osc so oscilloscope always shows the drawn shape at 440Hz
    this.debugOsc.setPeriodicWave(this.periodicWave);
    this.debugOsc.frequency.setValueAtTime(440, this.audioContext.currentTime);
  }

  // Play a note using the current periodic wave (falls back to sine)
  playNote(freq, setReference = false) {
    this.ensureRunning();

    const osc = this.audioContext.createOscillator();

    if (this.periodicWave) osc.setPeriodicWave(this.periodicWave);
    else osc.type = "sine";

    osc.frequency.value = freq;
    osc.connect(this.masterGain);
    osc.start();

    this.oscillators[freq] = osc;

    // setReference kept for compatibility but oscilloscope is locked to debugOsc@440
  }

  stopNote(freq) {
    const osc = this.oscillators[freq];
    if (!osc) return;
    osc.stop();
    osc.disconnect();
    delete this.oscillators[freq];
  }

  stopAll() {
    Object.keys(this.oscillators).forEach((f) => this.stopNote(Number(f)));
  }
}
