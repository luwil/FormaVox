import { useRef } from "react";
import PianoNotesMap from "../constants/PianoNotesMap";

export default function Keyboard({ engine, keysDown, setKeysDown }) {
  const isMouseDown = useRef(false);

  const WHITE_KEY_WIDTH = 50;
  const WHITE_KEY_HEIGHT = 150;
  const BLACK_KEY_WIDTH = 30;
  const BLACK_KEY_HEIGHT = 100;

  // Split keys from map
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
      style={{
        position: "relative",
        width: keyboardWidth,
        height: WHITE_KEY_HEIGHT,
        margin: "0 auto",
        userSelect: "none",
      }}
      onMouseUp={() => {
        isMouseDown.current = false;
      }}
    >
      {/* White keys */}
      {WHITE_KEYS.map((code, idx) => (
        <div
          key={code}
          onMouseDown={() => handleMouseDown(code)}
          onMouseUp={() => handleMouseUp(code)}
          onMouseLeave={() => handleMouseLeave(code)}
          onMouseEnter={() => handleMouseEnter(code)}
          style={{
            position: "absolute",
            left: idx * WHITE_KEY_WIDTH,
            width: WHITE_KEY_WIDTH,
            height: WHITE_KEY_HEIGHT,
            background: keysDown[code] ? "#ccc" : "white",
            border: "1px solid black",
            borderRadius: 4,
            zIndex: 1,
            boxSizing: "border-box",
          }}
        />
      ))}

      {/* Black keys */}
      {BLACK_KEYS.map((code) => {
        const allKeys = Object.keys(PianoNotesMap);
        const idx = allKeys.indexOf(code);
        const whiteIndex = allKeys
          .slice(0, idx)
          .filter((k) => PianoNotesMap[k].type === "white").length;

        return (
          <div
            key={code}
            onMouseDown={() => handleMouseDown(code)}
            onMouseUp={() => handleMouseUp(code)}
            onMouseLeave={() => handleMouseLeave(code)}
            onMouseEnter={() => handleMouseEnter(code)}
            style={{
              position: "absolute",
              left: whiteIndex * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2,
              width: BLACK_KEY_WIDTH,
              height: BLACK_KEY_HEIGHT,
              background: keysDown[code] ? "#555" : "black",
              borderRadius: 4,
              zIndex: 2,
            }}
          />
        );
      })}
    </div>
  );
}
