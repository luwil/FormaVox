import { useRef, useEffect } from "react";
import styles from "./Oscilloscope.module.css";

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

      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridLines = 10;
      for (let i = 1; i < gridLines; i++) {
        ctx.moveTo(0, (canvas.height / gridLines) * i);
        ctx.lineTo(canvas.width, (canvas.height / gridLines) * i);
        ctx.moveTo((canvas.width / gridLines) * i, 0);
        ctx.lineTo((canvas.width / gridLines) * i, canvas.height);
      }
      ctx.stroke();

      const displayedFrequency = 440;
      const sampleRate = engine.audioContext.sampleRate;
      const numSamples = Math.floor(sampleRate / displayedFrequency);

      const buffer = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buffer);
      const waveform = Array.from(buffer, (b) => b / 128 - 1);

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

      const sliceWidth = canvas.width / numSamples;
      let x = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0ff";
      ctx.beginPath();
      for (let i = 0; i < numSamples; i++) {
        const v = dataArray[i];
        const y = (v * canvas.height) / 2 + canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

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
