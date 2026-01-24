import { useEffect, useState } from "react";
import Oscilloscope from "../components/Oscilloscope";
import Keyboard from "../components/Keyboard";
import PianoNotesMap from "../constants/PianoNotesMap";

export default function Synth({ engine }) {
  const [keysDown, setKeysDown] = useState({});

  // --- handle physical keyboard ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keysDown[e.code]) return;

      const note = PianoNotesMap[e.code];
      if (!note) return;

      const isFirstNote = Object.values(keysDown).every((v) => !v);
      engine.playOscillator(note.freq, isFirstNote);
      setKeysDown((prev) => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      const note = PianoNotesMap[e.code];
      if (!note) return;

      engine.stopOscillator(note.freq);
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
    <div className="synth-container">
      <div className="synth-inner">
        <h2 className="synth-title">Synth</h2>

        {/* Oscilloscope scales with width */}
        <div className="oscilloscope-wrapper">
          <Oscilloscope engine={engine} width={1100} height={300} />
        </div>

        {/* Keyboard centered */}
        <div className="keyboard-wrapper">
          <Keyboard
            engine={engine}
            keysDown={keysDown}
            setKeysDown={setKeysDown}
          />
        </div>
      </div>
    </div>
  );
}
