import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Oscilloscope from "../components/Oscilloscope";
import Keyboard from "../components/Keyboard";
import { KeyboardConfig } from "../constants/KeyboardConfig";

export default function Synth({ engine }) {
  const [keysDown, setKeysDown] = useState({});

  // --- make oscilloscope responsive ---
  const oscWrapRef = useRef(null);
  const [oscWidth, setOscWidth] = useState(0);

  useLayoutEffect(() => {
    const el = oscWrapRef.current;
    if (!el) return;

    const update = () => {
      setOscWidth(el.clientWidth);
    };

    update();

    // ResizeObserver updates when the container changes size (best for responsive layouts)
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  // --- handle physical keyboard ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keysDown[e.code]) return;

      const note = KeyboardConfig[e.code];
      if (!note) return;

      const isFirstNote = Object.values(keysDown).every((v) => !v);
      engine.playOscillator(note.freq, isFirstNote);
      setKeysDown((prev) => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      const note = KeyboardConfig[e.code];
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

        {/* Oscilloscope: responsive to container width */}
        <div className="oscilloscope-wrapper" ref={oscWrapRef}>
          {oscWidth > 0 && (
            <Oscilloscope engine={engine} width={oscWidth} height={300} />
          )}
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
