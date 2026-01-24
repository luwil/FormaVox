import { useRef } from "react";
import styles from "./Keyboard.module.css";
import {
  getWhiteKeys,
  getBlackKeys,
  getWhiteIndex,
  getKeyData,
} from "../utils/KeyboardFunctions.js";
import { KEYBOARD_LAYOUT } from "../constants/KeyboardConfig";

export default function Keyboard({ engine, keysDown, setKeysDown }) {
  const isMouseDown = useRef(false);

  const { whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight } =
    KEYBOARD_LAYOUT;

  const WHITE_KEYS = getWhiteKeys();
  const BLACK_KEYS = getBlackKeys();

  const keyboardWidth = WHITE_KEYS.length * whiteKeyWidth;

  const playKey = (code) => {
    if (keysDown[code]) return;
    const data = getKeyData(code);
    if (!data) return;

    const isFirstNote = Object.values(keysDown).every((v) => !v);
    engine.playOscillator(data.freq, isFirstNote);

    setKeysDown((prev) => ({ ...prev, [code]: true }));
  };

  const stopKey = (code) => {
    const data = getKeyData(code);
    if (!data) return;

    engine.stopOscillator(data.freq);
    setKeysDown((prev) => ({ ...prev, [code]: false }));
  };

  return (
    <div
      className={styles.keyboard}
      style={{ width: keyboardWidth, height: whiteKeyHeight }}
      onMouseUp={() => (isMouseDown.current = false)}
    >
      {WHITE_KEYS.map((code, idx) => (
        <div
          key={code}
          className={`${styles.whiteKey} ${
            keysDown[code] ? styles.active : ""
          }`}
          style={{
            left: idx * whiteKeyWidth,
            width: whiteKeyWidth,
            height: whiteKeyHeight,
          }}
          onMouseDown={() => ((isMouseDown.current = true), playKey(code))}
          onMouseUp={() => ((isMouseDown.current = false), stopKey(code))}
          onMouseLeave={() => keysDown[code] && stopKey(code)}
          onMouseEnter={() => isMouseDown.current && playKey(code)}
        />
      ))}

      {BLACK_KEYS.map((code) => {
        const whiteIndex = getWhiteIndex(code);

        return (
          <div
            key={code}
            className={`${styles.blackKey} ${
              keysDown[code] ? styles.active : ""
            }`}
            style={{
              left: whiteIndex * whiteKeyWidth - blackKeyWidth / 2,
              width: blackKeyWidth,
              height: blackKeyHeight,
            }}
            onMouseDown={() => ((isMouseDown.current = true), playKey(code))}
            onMouseUp={() => ((isMouseDown.current = false), stopKey(code))}
            onMouseLeave={() => keysDown[code] && stopKey(code)}
            onMouseEnter={() => isMouseDown.current && playKey(code)}
          />
        );
      })}
    </div>
  );
}
