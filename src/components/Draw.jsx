import { useRef, useEffect, useState } from "react";
import styles from "./Draw.module.css";

import {
  drawOscilloscopeGrid,
  drawOscilloscopeWaveform,
  getOscilloscopeAmpFromY,
  getOscilloscopeIndexFromX,
  interpolateOscilloscopeWaveform,
} from "../utils/OscilloscopeFunctions";

import {
  WAVEFORM_RESOLUTION,
  OSCILLOSCOPE_COLORS,
  GRID_LINE_COUNT,
} from "../constants/OscilloscopeConfig";

export default function Draw({ width = "100%", height = 400, onWaveUpdate }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const waveformRef = useRef(new Float32Array(WAVEFORM_RESOLUTION).fill(0));
  const prevRef = useRef({ x: 0, y: 0 });

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawOscilloscopeGrid(ctx, canvas.width, canvas.height, {
      background: OSCILLOSCOPE_COLORS.background,
      gridColor: OSCILLOSCOPE_COLORS.grid,
      midlineColor: OSCILLOSCOPE_COLORS.midline,
      lines: GRID_LINE_COUNT,
    });
    drawOscilloscopeWaveform(
      ctx,
      waveformRef.current,
      canvas.width,
      canvas.height,
      OSCILLOSCOPE_COLORS.waveform
    );
  };

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = height;
      render();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [height]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const idx = getOscilloscopeIndexFromX(x, canvas.width, WAVEFORM_RESOLUTION);
    waveformRef.current[idx] = getOscilloscopeAmpFromY(y, canvas.height);

    prevRef.current = { x: idx, y };
    setDrawing(true);

    render();
    if (onWaveUpdate) onWaveUpdate(waveformRef.current);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const idx = getOscilloscopeIndexFromX(x, canvas.width, WAVEFORM_RESOLUTION);
    const amp = getOscilloscopeAmpFromY(y, canvas.height);
    const prevIdx = prevRef.current.x;
    const prevAmp = getOscilloscopeAmpFromY(prevRef.current.y, canvas.height);

    interpolateOscilloscopeWaveform(
      waveformRef.current,
      prevIdx,
      idx,
      prevAmp,
      amp
    );
    prevRef.current = { x: idx, y };

    render();
    if (onWaveUpdate) onWaveUpdate(waveformRef.current);
  };

  const handleMouseUp = () => setDrawing(false);

  return (
    <div className={styles.canvasWrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
