// Frequencies + key type for a standard piano octave range

/** @type {Record<string, { freq: number, type: "white" | "black" }>} */
export const KeyboardConfig = {
  KeyA: { freq: 261.63, type: "white" }, // C4
  KeyW: { freq: 277.18, type: "black" }, // C#4
  KeyS: { freq: 293.66, type: "white" }, // D4
  KeyE: { freq: 311.13, type: "black" }, // D#4
  KeyD: { freq: 329.63, type: "white" }, // E4
  KeyF: { freq: 349.23, type: "white" }, // F4
  KeyT: { freq: 369.99, type: "black" }, // F#4
  KeyG: { freq: 392.0, type: "white" }, // G4
  KeyY: { freq: 415.3, type: "black" }, // G#4
  KeyH: { freq: 440.0, type: "white" }, // A4
  KeyU: { freq: 466.16, type: "black" }, // A#4
  KeyJ: { freq: 493.88, type: "white" }, // B4
  KeyK: { freq: 523.25, type: "white" }, // C5

  // Next octave
  KeyO: { freq: 554.37, type: "black" }, // C#5
  KeyL: { freq: 587.33, type: "white" }, // D5
  KeyP: { freq: 622.25, type: "black" }, // D#5
  Semicolon: { freq: 659.25, type: "white" }, // E5
  Quote: { freq: 698.46, type: "white" }, // F5
};

// Key sizes + colors
export const KEYBOARD_LAYOUT = {
  whiteKeyWidth: 50,
  whiteKeyHeight: 150,
  blackKeyWidth: 30,
  blackKeyHeight: 100,
};
