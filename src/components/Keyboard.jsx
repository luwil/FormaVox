import { useRef } from "react";
import PianoNotesMap from "../constants/PianoNotesMap";
import styles from "./Keyboard.module.css";

export default function Keyboard({ engine, keysDown, setKeysDown }) {
  const isMouseDown = useRef(false);

  const WHITE_KEY_WIDTH = 50;
  const WHITE_KEY_HEIGHT = 150;
  const BLACK_KEY_WIDTH = 30;
  const BLACK_KEY_HEIGHT = 100;

  const WHITE_KEYS = Object.entries(PianoNotesMap)
    .filter(([_, data]) => data.type === "white")
    .map(([code]) => code);

  const BLACK_KEYS = Object.entries(PianoNotesMap)
    .filter(([_, data]) => data.type === "black")
    .map(([code]) => code);

  const keyboardWidth = WHITE_KEYS.length * WHITE_KEY_WIDTH;

  const playKey = (code) => {
    if (keysDown[code]) return;
    const freq = PianoNotesMap[code].freq;
    if (!freq) return;
    const isFirstNote = Object.values(keysDown).every((v) => !v);
    engine.playOscillator(freq, isFirstNote);
    setKeysDown((prev) => ({ ...prev, [code]: true }));
  };

  const stopKey = (code) => {
    const freq = PianoNotesMap[code].freq;
    if (!freq) return;
    engine.stopOscillator(freq);
    setKeysDown((prev) => ({ ...prev, [code]: false }));
  };

  const handleMouseDown = (code) => {
    isMouseDown.current = true;
    playKey(code);
  };
  const handleMouseUp = (code) => {
    isMouseDown.current = false;
    stopKey(code);
  };
  const handleMouseLeave = (code) => {
    if (keysDown[code]) stopKey(code);
  };
  const handleMouseEnter = (code) => {
    if (isMouseDown.current) playKey(code);
  };

  return (
    <div
      className={styles.keyboard}
      style={{ width: keyboardWidth, height: WHITE_KEY_HEIGHT }}
      onMouseUp={() => {
        isMouseDown.current = false;
      }}
    >
      {WHITE_KEYS.map((code, idx) => (
        <div
          key={code}
          className={`${styles.whiteKey} ${
            keysDown[code] ? styles.active : ""
          }`}
          style={{
            left: idx * WHITE_KEY_WIDTH,
            width: WHITE_KEY_WIDTH,
            height: WHITE_KEY_HEIGHT,
          }}
          onMouseDown={() => handleMouseDown(code)}
          onMouseUp={() => handleMouseUp(code)}
          onMouseLeave={() => handleMouseLeave(code)}
          onMouseEnter={() => handleMouseEnter(code)}
        />
      ))}

      {BLACK_KEYS.map((code) => {
        const allKeys = Object.keys(PianoNotesMap);
        const idx = allKeys.indexOf(code);
        const whiteIndex = allKeys
          .slice(0, idx)
          .filter((k) => PianoNotesMap[k].type === "white").length;

        return (
          <div
            key={code}
            className={`${styles.blackKey} ${
              keysDown[code] ? styles.active : ""
            }`}
            style={{
              left: whiteIndex * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2,
              width: BLACK_KEY_WIDTH,
              height: BLACK_KEY_HEIGHT,
            }}
            onMouseDown={() => handleMouseDown(code)}
            onMouseUp={() => handleMouseUp(code)}
            onMouseLeave={() => handleMouseLeave(code)}
            onMouseEnter={() => handleMouseEnter(code)}
          />
        );
      })}
    </div>
  );
}
