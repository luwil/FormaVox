import { useRef, useEffect, useState } from "react";
import styles from "./Draw.module.css";

export default function Draw({ width = "100%", height = 400, onWaveUpdate }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const WAVE_RES = 2048;
  const waveformRef = useRef(new Float32Array(WAVE_RES).fill(0));
  const prevRef = useRef({ x: 0, y: 0 });

  const drawGrid = (ctx, w, h) => {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const lines = 10;
    for (let i = 1; i < lines; i++) {
      const y = (h / lines) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Midline
    ctx.strokeStyle = "#555";
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  };

  const drawWaveform = (ctx, w, h) => {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < waveformRef.current.length; i++) {
      const x = (i / (waveformRef.current.length - 1)) * w;
      const y = h / 2 - waveformRef.current[i] * (h / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawGrid(ctx, canvas.width, canvas.height);
    drawWaveform(ctx, canvas.width, canvas.height);
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

  const getAmpFromY = (y, h) =>
    Math.max(-1, Math.min(1, (h / 2 - y) / (h / 2)));
  const getIndexFromX = (x, w) =>
    Math.max(0, Math.min(WAVE_RES - 1, Math.round((x / w) * (WAVE_RES - 1))));

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const idx = getIndexFromX(x, canvas.width);
    waveformRef.current[idx] = getAmpFromY(y, canvas.height);
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

    const idx = getIndexFromX(x, canvas.width);
    const amp = getAmpFromY(y, canvas.height);
    const prevIdx = prevRef.current.x;
    const prevAmp = getAmpFromY(prevRef.current.y, canvas.height);
    const dx = idx - prevIdx;

    if (dx !== 0) {
      for (let i = 0; i <= Math.abs(dx); i++) {
        const t = i / Math.abs(dx);
        const ix = prevIdx + Math.sign(dx) * i;
        waveformRef.current[ix] = prevAmp + (amp - prevAmp) * t;
      }
    }

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
