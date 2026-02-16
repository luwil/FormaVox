import { fft } from "../utils/fft.js";

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
    this.debugOsc.frequency.value = 55;

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
  setWaveform(waveform) {
    if (!waveform || waveform.length < 2) return;

    this.ensureRunning();

    // Make sure we store a Float32Array copy for the oscilloscope reference
    // (so it doesn't get mutated elsewhere)
    this.scopeWaveform = new Float32Array(waveform);

    const N = waveform.length; // 2048 (power of 2)
    const harmonics = N / 2; // 1024 harmonics from N samples

    // Copy waveform into Float64Arrays for FFT
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = waveform[i];

    fft(re, im);

    // Convert FFT output to PeriodicWave coefficients.
    // FFT bin k: X[k] = sum x[n] * e^{-j2pi nk/N}
    // PeriodicWave expects Fourier series coefficients:
    //   real[k] = a_k (cosine), imag[k] = b_k (sine)
    // Relationship: a_k = 2*Re(X[k])/N, b_k = -2*Im(X[k])/N  (for k>0)
    const pwReal = new Float32Array(harmonics + 1);
    const pwImag = new Float32Array(harmonics + 1);

    // DC component
    pwReal[0] = re[0] / N;
    pwImag[0] = 0;

    for (let k = 1; k <= harmonics; k++) {
      pwReal[k] = (2 * re[k]) / N;
      pwImag[k] = (-2 * im[k]) / N;
    }

    this.periodicWave = this.audioContext.createPeriodicWave(pwReal, pwImag, {
      disableNormalization: false,
    });

    // Update debug osc so oscilloscope always shows the drawn shape
    this.debugOsc.setPeriodicWave(this.periodicWave);
    this.debugOsc.frequency.setValueAtTime(55, this.audioContext.currentTime);
  }

  // Play a note using the current periodic wave (falls back to sine)
  playNote(freq) {
    this.ensureRunning();

    const osc = this.audioContext.createOscillator();

    if (this.periodicWave) osc.setPeriodicWave(this.periodicWave);
    else osc.type = "sine";

    osc.frequency.value = freq;
    osc.connect(this.masterGain);
    osc.start();

    this.oscillators[freq] = osc;
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
