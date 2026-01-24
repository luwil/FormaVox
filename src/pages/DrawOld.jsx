import { useRef, useEffect, useState } from "react";

export default function Draw() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  // 🔊 Waveform resolution (audio-quality)
  const WAVE_RES = 2048;

  // 🎨 Canvas visual size (responsive)
  const HEIGHT = 400;

  const waveformRef = useRef(new Float32Array(WAVE_RES).fill(0));
  const prevRef = useRef({ x: 0, y: 0 });

  const drawGrid = (ctx, width, height) => {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const lines = 10;
    ctx.beginPath();
    for (let i = 1; i < lines; i++) {
      const y = (height / lines) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // midline
    ctx.strokeStyle = "#555";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawWaveform = (ctx, width, height) => {
    const wf = waveformRef.current;
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < wf.length; i++) {
      const x = (i / (wf.length - 1)) * width;
      const y = height / 2 - wf[i] * (height / 2);
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
      if (!canvas) return;

      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = HEIGHT;
      render();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getAmpFromY = (y, height) =>
    Math.max(-1, Math.min(1, (height / 2 - y) / (height / 2)));

  const getIndexFromX = (x, width) =>
    Math.max(
      0,
      Math.min(WAVE_RES - 1, Math.round((x / width) * (WAVE_RES - 1)))
    );

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
      // 🖌️ Smooth interpolation = broader brush feel
      for (let i = 0; i <= Math.abs(dx); i++) {
        const t = i / Math.abs(dx);
        const ix = prevIdx + Math.sign(dx) * i;
        waveformRef.current[ix] = prevAmp + (amp - prevAmp) * t;
      }
    }

    prevRef.current = { x: idx, y };
    render();
  };

  const handleMouseUp = () => setDrawing(false);

  return (
    <div>
      <h2>Draw Waveform</h2>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: HEIGHT,
          border: "1px solid #888",
          cursor: "crosshair",
          display: "block",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <p style={{ opacity: 0.7 }}>
        Draw one continuous waveform. You can lift and continue refining.
      </p>
    </div>
  );
}
