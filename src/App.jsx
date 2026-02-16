import { Routes, Route, Link } from "react-router-dom";
import { useRef } from "react";
import { AudioEngine } from "./audio/AudioEngine";

import Home from "./pages/Home";
import Synth from "./pages/Synth";
import Voice from "./pages/Voice";

function App() {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        background: "#111",
        color: "white",
        boxSizing: "border-box",
      }}
    >
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 20, color: "cyan" }}>
          Home
        </Link>
        <Link to="/synth" style={{ marginRight: 20, color: "cyan" }}>
          Synth
        </Link>
        <Link to="/voice" style={{ marginRight: 20, color: "cyan" }}>
          Voice
        </Link>
      </nav>

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/synth" element={<Synth engine={engineRef.current} />} />
          <Route path="/voice" element={<Voice engine={engineRef.current} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
