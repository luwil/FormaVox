import { useEffect, useState } from "react";
import Oscilloscope from "../components/Oscilloscope";
import Keyboard from "../components/Keyboard";

export default function Synth({ engine }) {
  const NOTE_MAP = {
    KeyA: 261.63,
    KeyW: 277.18,
    KeyS: 293.66,
    KeyE: 311.13,
    KeyD: 329.63,
    KeyF: 349.23,
    KeyT: 369.99,
    KeyG: 392.0,
    KeyY: 415.3,
    KeyH: 440.0,
    KeyU: 466.16,
    KeyJ: 493.88,
    KeyK: 523.25,
  };

  // centralize pressed keys state
  const [keysDown, setKeysDown] = useState({});

  // --- handle physical keyboard ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keysDown[e.code]) return; // already pressed
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
    <div style={{ padding: 40 }}>
      <h2>Synth</h2>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => engine.playOscillator(440, true)}>
          Play 440 Hz
        </button>
        <button onClick={() => engine.stopAll()}>Stop All</button>
      </div>

      <Oscilloscope engine={engine} />

      <Keyboard
        engine={engine}
        noteMap={NOTE_MAP}
        keysDown={keysDown}
        setKeysDown={setKeysDown}
      />
    </div>
  );
}
