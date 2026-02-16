import { useEffect, useState, useRef, useLayoutEffect } from "react";
import Draw from "../components/Draw";
import Keyboard from "../components/Keyboard";
import Oscilloscope from "../components/Oscilloscope";
import { KeyboardConfig } from "../constants/KeyboardConfig";

export default function Synth({ engine }) {
  const [keysDown, setKeysDown] = useState({});

  // --- responsive oscilloscope width ---
  const oscWrapRef = useRef(null);
  const [oscWidth, setOscWidth] = useState(0);

  useLayoutEffect(() => {
    const el = oscWrapRef.current;
    if (!el) return;

    const update = () => setOscWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- physical keyboard -> play/stop notes ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keysDown[e.code]) return;

      const note = KeyboardConfig[e.code];
      if (!note) return;

      engine.playNote(note.freq);
      setKeysDown((prev) => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      const note = KeyboardConfig[e.code];
      if (!note) return;

      engine.stopNote(note.freq);
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
        <h2 className="synth-title">Synth + Draw</h2>

        {/* 1) Draw on top */}
        <div className="section-panel">
          <div className="section-label">Waveform Editor</div>
          <Draw
            height={320}
            onWaveUpdate={(wf) => {
              engine.setWaveform(new Float32Array(wf));
            }}
          />
        </div>

        {/* 2) Keyboard under it */}
        <div className="section-panel">
          <div className="section-label">Keyboard</div>
          <div className="keyboard-wrapper">
            <Keyboard
              engine={engine}
              keysDown={keysDown}
              setKeysDown={setKeysDown}
            />
          </div>
        </div>

        {/* 3) Oscilloscope at bottom */}
        <div className="section-panel">
          <div className="section-label">Oscilloscope</div>
          <div className="oscilloscope-wrapper" ref={oscWrapRef}>
            {oscWidth > 0 && (
              <Oscilloscope engine={engine} width={oscWidth} height={260} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
