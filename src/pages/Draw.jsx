import { useRef, useState, useEffect } from "react";

export default function Draw() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const waveformRef = useRef(Array(600).fill(0)); // store waveform y-values, one per x
  const prevPosRef = useRef({ x: 0, y: 0 });

  const WIDTH = 600;
  const HEIGHT = 200;
  const GRID_LINES = 10;

  // --- Draw grid on canvas ---
  const drawGrid = (ctx) => {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < GRID_LINES; i++) {
      ctx.moveTo(0, (HEIGHT / GRID_LINES) * i);
      ctx.lineTo(WIDTH, (HEIGHT / GRID_LINES) * i);
      ctx.moveTo((WIDTH / GRID_LINES) * i, 0);
      ctx.lineTo((WIDTH / GRID_LINES) * i, HEIGHT);
    }
    ctx.stroke();

    // midline
    ctx.strokeStyle = "#666";
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT / 2);
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
  };

  // --- Draw the waveform line ---
  const drawWaveformCanvas = (ctx) => {
    const wf = waveformRef.current;
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < wf.length; i++) {
      const x = i;
      const y = HEIGHT / 2 - wf[i] * (HEIGHT / 2); // map [-1,1] to canvas
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawGrid(ctx);
    drawWaveformCanvas(ctx);
  };

  useEffect(() => {
    render(); // initial render
  }, []);

  // --- Map mouse Y to amplitude [-1,1] ---
  const getMouseAmp = (y) => {
    return Math.max(-1, Math.min(1, (HEIGHT / 2 - y) / (HEIGHT / 2)));
  };

  // --- Mouse events ---
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = e.clientY - rect.top;

    setDrawing(true);
    prevPosRef.current = { x, y };
    waveformRef.current[x] = getMouseAmp(y);
    render();
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = e.clientY - rect.top;

    const prevX = prevPosRef.current.x;
    const prevY = prevPosRef.current.y;

    const dx = x - prevX;
    if (dx === 0) return;

    // interpolate between previous and current position for smoothness
    for (let i = 0; i <= Math.abs(dx); i++) {
      const ix = prevX + (dx > 0 ? i : -i);
      const iy = prevY + ((y - prevY) * i) / Math.abs(dx);
      if (ix >= 0 && ix < WIDTH) {
        waveformRef.current[ix] = getMouseAmp(iy);
      }
    }

    prevPosRef.current = { x, y };
    render();
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
    <div>
      <h2>Draw Waveform</h2>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ border: "1px solid #888", cursor: "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <p>
        Draw one period of a waveform. You can lift the mouse and continue
        editing the same waveform.
      </p>
    </div>
  );
}
