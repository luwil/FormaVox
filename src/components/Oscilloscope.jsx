import { useRef, useEffect } from "react";
import styles from "./Oscilloscope.module.css";

import {
  drawOscilloscopeGrid,
  drawOscilloscopeWaveform,
} from "../utils/OscilloscopeFunctions";

import {
  OSCILLOSCOPE_COLORS,
  GRID_LINE_COUNT,
} from "../constants/OscilloscopeConfig";

export default function Oscilloscope({ engine, width = 600, height = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!engine) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let rafId;

    const draw = () => {
      const analyser = engine.analyser;
      if (!analyser) return;

      // Clear canvas + draw grid
      drawOscilloscopeGrid(ctx, canvas.width, canvas.height, {
        background: OSCILLOSCOPE_COLORS.background,
        gridColor: OSCILLOSCOPE_COLORS.grid,
        midlineColor: OSCILLOSCOPE_COLORS.midline,
        lines: GRID_LINE_COUNT,
      });

      // Get waveform data
      const displayedFrequency = 440;
      const sampleRate = engine.audioContext.sampleRate;
      const numSamples = Math.floor(sampleRate / displayedFrequency);

      const buffer = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buffer);
      const waveform = Array.from(buffer, (b) => b / 128 - 1);

      // Align to zero-crossing
      let startIndex = 0;
      for (let i = 1; i < waveform.length; i++) {
        if (waveform[i - 1] < 0 && waveform[i] >= 0) {
          startIndex = i;
          break;
        }
      }

      const dataArray = [];
      for (let i = 0; i < numSamples; i++) {
        dataArray.push(waveform[(startIndex + i) % waveform.length]);
      }

      // Draw waveform
      drawOscilloscopeWaveform(
        ctx,
        dataArray,
        canvas.width,
        canvas.height,
        OSCILLOSCOPE_COLORS.waveform
      );

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={styles.canvasOsc}
    />
  );
}
