import { useEffect, useState } from "react";
import Oscilloscope from "../components/Oscilloscope";
import Keyboard from "../components/Keyboard";

export default function Synth({ engine }) {
  const NOTE_MAP = {
    KeyA: 261.63, // C4
    KeyW: 277.18, // C#4
    KeyS: 293.66, // D4
    KeyE: 311.13, // D#4
    KeyD: 329.63, // E4
    KeyF: 349.23, // F4
    KeyT: 369.99, // F#4
    KeyG: 392.0, // G4
    KeyY: 415.3, // G#4
    KeyH: 440.0, // A4
    KeyU: 466.16, // A#4
    KeyJ: 493.88, // B4
    KeyK: 523.25, // C5

    // New octave keys
    KeyO: 554.37, // C#5
    KeyL: 587.33, // D5
    KeyP: 622.25, // D#5
    Semicolon: 659.25, // E5
    Quote: 698.46, // F5
  };

  // centralize pressed keys state
  const [keysDown, setKeysDown] = useState({});

  // --- handle physical keyboard ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keysDown[e.code]) return;
      const freq = NOTE_MAP[e.code];
      if (!freq) return;

      const isFirstNote = Object.values(keysDown).every((v) => !v);
      engine.playOscillator(freq, isFirstNote);
      setKeysDown((prev) => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      const freq = NOTE_MAP[e.code];
      if (!freq) return;
      engine.stopOscillator(freq);
      setKeysDown((prev) => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [engine, keysDown]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <h2 style={{ margin: 0 }}>Synth</h2>

        {/* Oscilloscope scales with width */}
        <div style={{ width: "100%" }}>
          <Oscilloscope engine={engine} width={1100} height={300} />
        </div>

        {/* Keyboard centered */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Keyboard
            engine={engine}
            noteMap={NOTE_MAP}
            keysDown={keysDown}
            setKeysDown={setKeysDown}
          />
        </div>
      </div>
    </div>
  );
}
