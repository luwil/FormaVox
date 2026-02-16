# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FormaVox is a web-based synthesizer where users draw custom waveforms on a canvas and play them via an interactive piano keyboard. Built with React 19, Vite, and the Web Audio API (no audio libraries).

## Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build to dist/
npm run lint       # ESLint
npm run preview    # Serve production build locally
```

No test framework is configured.

## Architecture

**Data flow:** App.jsx holds a single `AudioEngine` ref (singleton) and passes it to route pages via props.

```
App.jsx (AudioEngine ref, React Router)
  ├─ /       → Home (static info page)
  ├─ /synth  → Synth page
  │             ├─ Draw component → engine.setWaveform()
  │             ├─ Keyboard component → engine.playNote/stopNote
  │             └─ Oscilloscope component ← engine.analyser
  └─ /draw   → DrawPage (standalone drawing canvas)
```

**Waveform pipeline:** User draws on canvas → Float32Array → DFT computes Fourier coefficients (64 harmonics) → Web Audio PeriodicWave → applied to all active oscillators. The reference waveform is also stored for oscilloscope cross-correlation alignment.

**AudioEngine** (`src/audio/AudioEngine.js`) manages the Web Audio context, polyphonic oscillators (frequency-keyed map), PeriodicWave generation, and an analyser node for visualization. It is the only class that touches the Web Audio API.

**Constants** in `src/constants/` define piano key layout (24 keys, C4–F5 with physical keyboard mappings) and oscilloscope rendering config (colors, grid, resolution).

**Utilities** in `src/utils/` contain pure helper functions for keyboard layout calculations and oscilloscope canvas drawing/math.

## Code Conventions

- JavaScript (JSX), no TypeScript
- CSS Modules for component styles (`*.module.css`)
- ESLint v9 flat config with React Hooks and React Refresh plugins
- ES modules throughout (`"type": "module"`)
