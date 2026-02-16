import { Routes, Route, NavLink } from "react-router-dom";
import { useRef } from "react";
import { AudioEngine } from "./audio/AudioEngine";
import "./App.css";

import Home from "./pages/Home";
import Synth from "./pages/Synth";
import Voice from "./pages/Voice";

function App() {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();

  return (
    <div className="app-shell">
      <nav className="nav">
        <span className="nav-brand">FormaVox</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Home
        </NavLink>
        <span className="nav-sep">/</span>
        <NavLink
          to="/synth"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Synth
        </NavLink>
        <span className="nav-sep">/</span>
        <NavLink
          to="/voice"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Voice
        </NavLink>
      </nav>

      <div className="app-content">
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
