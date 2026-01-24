import { useRef } from "react";

export default function Keyboard({ engine, noteMap, keysDown, setKeysDown }) {
  const isMouseDown = useRef(false);

  // --- layout constants ---
  const WHITE_KEY_WIDTH = 50;
  const WHITE_KEY_HEIGHT = 150;
  const BLACK_KEY_WIDTH = 30;
  const BLACK_KEY_HEIGHT = 100;

  // Ordered keys (2 octaves)
  const KEY_ORDER = [
    // Octave 4
    "KeyA", // C
    "KeyW", // C#
    "KeyS", // D
    "KeyE", // D#
    "KeyD", // E
    "KeyF", // F
    "KeyT", // F#
    "KeyG", // G
    "KeyY", // G#
    "KeyH", // A
    "KeyU", // A#
    "KeyJ", // B
    "KeyK", // C

    // Octave 5
    "KeyO", // C#
    "KeyL", // D
    "KeyP", // D#
    "Semicolon", // E
    "Quote", // F
  ];

  const BLACK_KEYS = ["KeyW", "KeyE", "KeyT", "KeyY", "KeyU", "KeyO", "KeyP"];

  // derive white keys in order
  const WHITE_KEYS = KEY_ORDER.filter((k) => !BLACK_KEYS.includes(k));

  const keyboardWidth = WHITE_KEYS.length * WHITE_KEY_WIDTH;

  // --- audio helpers ---
  const playKey = (code) => {
    if (keysDown[code]) return;
    const freq = noteMap[code];
    if (!freq) return;

    const isFirstNote = Object.values(keysDown).every((v) => !v);
    engine.playOscillator(freq, isFirstNote);
    setKeysDown((prev) => ({ ...prev, [code]: true }));
  };

  const stopKey = (code) => {
    const freq = noteMap[code];
    if (!freq) return;
    engine.stopOscillator(freq);
    setKeysDown((prev) => ({ ...prev, [code]: false }));
  };

  // --- mouse handling ---
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
      {KEY_ORDER.map((code, idx) => {
        if (!BLACK_KEYS.includes(code)) return null;

        // count how many white keys come before this key
        const whiteIndex = KEY_ORDER.slice(0, idx).filter(
          (k) => !BLACK_KEYS.includes(k)
        ).length;

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
