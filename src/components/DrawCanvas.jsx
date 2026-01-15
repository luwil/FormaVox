import { useRef, useEffect } from "react";

export default function DrawCanvas({
  width = 800,
  height = 300,
  onPathChange,
}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const pathRef = useRef([]); // stores points for later waveform conversion

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Canvas styling
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0ff";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Midline (optional)
    ctx.beginPath();
    ctx.strokeStyle = "#444";
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.strokeStyle = "#0ff";

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return { x, y };
    };

    const startDraw = (e) => {
      isDrawing.current = true;
      const pos = getPos(e);
      lastPoint.current = pos;
      pathRef.current.push(pos);
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPoint.current = pos;
      pathRef.current.push(pos);

      if (onPathChange) onPathChange(pathRef.current);
    };

    const endDraw = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
    };
  }, [width, height, onPathChange]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // redraw midline
    ctx.beginPath();
    ctx.strokeStyle = "#444";
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.strokeStyle = "#0ff";

    pathRef.current = [];
    if (onPathChange) onPathChange(pathRef.current);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid #888", background: "#1e1e1e" }}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={clearCanvas} style={{ padding: "5px 10px" }}>
          Clear
        </button>
      </div>
    </div>
  );
}
