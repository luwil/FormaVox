import { useRef } from "react";

export default function Keyboard({ engine, noteMap, keysDown, setKeysDown }) {
  const isMouseDown = useRef(false);

  const KEY_ORDER = [
    "KeyA",
    "KeyW",
    "KeyS",
    "KeyE",
    "KeyD",
    "KeyF",
    "KeyT",
    "KeyG",
    "KeyY",
    "KeyH",
    "KeyU",
    "KeyJ",
    "KeyK",
  ];
  const BLACK_KEYS = ["KeyW", "KeyE", "KeyT", "KeyY", "KeyU"];

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
        width: 700,
        height: 150,
        marginBottom: 20,
      }}
      onMouseUp={() => {
        isMouseDown.current = false;
      }}
    >
      {/* White keys */}
      {KEY_ORDER.filter((k) => !BLACK_KEYS.includes(k)).map((code, idx) => (
        <div
          key={code}
          onMouseDown={() => handleMouseDown(code)}
          onMouseUp={() => handleMouseUp(code)}
          onMouseLeave={() => handleMouseLeave(code)}
          onMouseEnter={() => handleMouseEnter(code)}
          style={{
            position: "absolute",
            left: idx * 50,
            width: 50,
            height: 150,
            background: keysDown[code] ? "#ccc" : "white",
            border: "1px solid black",
            borderRadius: 4,
            zIndex: 1,
            boxSizing: "border-box",
            userSelect: "none",
          }}
        />
      ))}

      {/* Black keys */}
      {BLACK_KEYS.map((code, idx) => {
        let leftOffset = 50 * idx + 35;
        if (idx >= 2) leftOffset += 50;
        return (
          <div
            key={code}
            onMouseDown={() => handleMouseDown(code)}
            onMouseUp={() => handleMouseUp(code)}
            onMouseLeave={() => handleMouseLeave(code)}
            onMouseEnter={() => handleMouseEnter(code)}
            style={{
              position: "absolute",
              left: leftOffset,
              width: 30,
              height: 100,
              background: keysDown[code] ? "#555" : "black",
              borderRadius: 4,
              zIndex: 2,
              boxSizing: "border-box",
              userSelect: "none",
            }}
          />
        );
      })}
    </div>
  );
}
