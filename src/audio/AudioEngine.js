export class AudioEngine {
  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    this.oscillators = {}; // { freq: { osc, gainNode } }
    this.currentFrequency = 440; // reference for oscilloscope

    // --- Debug oscillator for oscilloscope ---
    this.debugOsc = this.audioContext.createOscillator();
    this.debugOsc.type = "sine";
    this.debugOsc.frequency.value = 440; // always 440 Hz
    this.debugGain = this.audioContext.createGain();
    this.debugGain.gain.value = 0; // silent
    this.debugOsc.connect(this.analyser); // scope sees it
    this.debugOsc.connect(this.debugGain); // prevent sound
    this.debugOsc.start();
  }

  playOscillator(frequency = 440, setReference = false) {
    if (this.oscillators[frequency]) return; // already playing

    const osc = this.audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 1 / (Object.keys(this.oscillators).length + 1);
    // simple polyphony normalization

    osc.connect(gainNode).connect(this.audioContext.destination);
    osc.start();

    this.oscillators[frequency] = { osc, gainNode };

    // Update existing gains for all other oscillators
    const activeCount = Object.keys(this.oscillators).length;
    Object.values(this.oscillators).forEach(({ gainNode }) => {
      gainNode.gain.value = 1 / activeCount;
    });

    if (setReference) this.currentFrequency = frequency;
  }

  stopOscillator(frequency) {
    const entry = this.oscillators[frequency];
    if (!entry) return;
    entry.osc.stop();
    entry.osc.disconnect();
    entry.gainNode.disconnect();
    delete this.oscillators[frequency];

    // Update remaining gains
    const activeCount = Object.keys(this.oscillators).length;
    Object.values(this.oscillators).forEach(({ gainNode }) => {
      gainNode.gain.value = 1 / (activeCount || 1);
    });
  }

  stopAll() {
    Object.keys(this.oscillators).forEach((freq) => this.stopOscillator(freq));
  }

  getCurrentFrequency() {
    return this.currentFrequency;
  }

  setDebugFrequency(freq) {
    this.debugOsc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    this.currentFrequency = freq;
  }
}
