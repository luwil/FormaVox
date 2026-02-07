import { useRef, useEffect } from "react";
import styles from "./Oscilloscope.module.css";

import {
  drawOscilloscopeGrid,
  drawOscilloscopeWaveform,
} from "../utils/OscilloscopeFunctions";

import {
  OSCILLOSCOPE_COLORS,
  GRID_LINE_COUNT,
  OSCILLOSCOPE_REFERENCE_FREQUENCY,
} from "../constants/OscilloscopeConfig";

export default function Oscilloscope({ engine, width = 600, height = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!engine) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let rafId;

    // Helper: convert analyser bytes -> [-1, 1]
    const bytesToFloat = (b) => b / 128 - 1;

    // Helper: normalized cross-correlation-ish score (bigger = better)
    const scoreOffset = (captured, reference, offset) => {
      let score = 0;
      for (let i = 0; i < reference.length; i++) {
        score += reference[i] * captured[(i + offset) % captured.length];
      }
      return score;
    };

    // Helper: find best offset so captured period matches the reference shape
    const findBestOffset = (captured, reference) => {
      if (!reference || reference.length < 2) return 0;

      // We only search offsets inside one captured period.
      // (captured.length is usually analyser.fftSize, like 2048)
      const limit = Math.min(captured.length, 2048);

      let bestOffset = 0;
      let bestScore = -Infinity;

      for (let off = 0; off < limit; off++) {
        const s = scoreOffset(captured, reference, off);
        if (s > bestScore) {
          bestScore = s;
          bestOffset = off;
        }
      }

      return bestOffset;
    };

    const draw = () => {
      const analyser = engine.analyser;
      if (!analyser) return;

      // Clear + grid
      drawOscilloscopeGrid(ctx, canvas.width, canvas.height, {
        background: OSCILLOSCOPE_COLORS.background,
        gridColor: OSCILLOSCOPE_COLORS.grid,
        midlineColor: OSCILLOSCOPE_COLORS.midline,
        lines: GRID_LINE_COUNT,
      });

      // If nothing has been drawn yet, don't render a waveform (prevents sine flutter)
      if (!engine.hasWaveform?.()) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      // We lock the scope to a fixed reference frequency (debugOsc is also 440)
      const displayedFrequency = OSCILLOSCOPE_REFERENCE_FREQUENCY ?? 440;

      const sampleRate = engine.audioContext.sampleRate;
      const numSamples = Math.floor(sampleRate / displayedFrequency);

      // 1) Grab live analyser buffer
      const buffer = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buffer);

      // Convert to float waveform [-1..1]
      const captured = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++)
        captured[i] = bytesToFloat(buffer[i]);

      // 2) Ask engine for the *drawing* reference, resampled to the same period length
      const reference = engine.getScopeReferenceSamples?.(numSamples);

      // 3) Choose alignment offset by matching captured audio to the drawing reference
      const offset = findBestOffset(captured, reference);

      // 4) Extract exactly one period, starting at the best offset
      const period = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        period[i] = captured[(offset + i) % captured.length];
      }

      // Draw waveform
      drawOscilloscopeWaveform(
        ctx,
        period,
        canvas.width,
        canvas.height,
        OSCILLOSCOPE_COLORS.waveform,
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
