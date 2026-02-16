import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./VoiceCapture.module.css";

import {
  drawOscilloscopeGrid,
  drawOscilloscopeWaveform,
} from "../utils/OscilloscopeFunctions";

import {
  WAVEFORM_RESOLUTION,
  OSCILLOSCOPE_COLORS,
  GRID_LINE_COUNT,
} from "../constants/OscilloscopeConfig";

import {
  detectPitch,
  extractOneCycle,
  resampleToLength,
} from "../utils/pitchDetection";

const LIVE_COLOR = "#00f0ff";
const RECORD_DURATION_MS = 500;

export default function VoiceCapture({ height = 320, onWaveUpdate }) {
  const canvasRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | requesting | listening | countdown | recording | captured | error
  const [errorMsg, setErrorMsg] = useState("");
  const [warning, setWarning] = useState("");
  const [countdownNum, setCountdownNum] = useState(null);

  // Refs for mic resources (cleaned up on unmount / state change)
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const capturedWaveRef = useRef(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // Resize canvas to fill parent
  useEffect(() => {
    const renderGrid = (canvas) => {
      const ctx = canvas.getContext("2d");
      drawOscilloscopeGrid(ctx, canvas.width, canvas.height, {
        background: OSCILLOSCOPE_COLORS.background,
        gridColor: OSCILLOSCOPE_COLORS.grid,
        midlineColor: OSCILLOSCOPE_COLORS.midline,
        lines: GRID_LINE_COUNT,
      });
      return ctx;
    };

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = height;

      if (state === "captured" && capturedWaveRef.current) {
        const ctx = renderGrid(canvas);
        drawOscilloscopeWaveform(
          ctx,
          capturedWaveRef.current,
          canvas.width,
          canvas.height,
          OSCILLOSCOPE_COLORS.waveform,
        );
      } else if (state === "idle" || state === "error") {
        renderGrid(canvas);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [height, state]);

  const startMic = async () => {
    setState("requesting");
    setWarning("");
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;

      setState("listening");
      startLivePreview();
    } catch {
      setState("error");
      setErrorMsg("Microphone access denied or unavailable.");
    }
  };

  const startLivePreview = () => {
    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      const buffer = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buffer);

      drawOscilloscopeGrid(ctx, canvas.width, canvas.height, {
        background: OSCILLOSCOPE_COLORS.background,
        gridColor: OSCILLOSCOPE_COLORS.grid,
        midlineColor: OSCILLOSCOPE_COLORS.midline,
        lines: GRID_LINE_COUNT,
      });
      drawOscilloscopeWaveform(
        ctx,
        buffer,
        canvas.width,
        canvas.height,
        LIVE_COLOR,
      );

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const startCountdown = () => {
    setWarning("");
    setState("countdown");
    setCountdownNum(3);

    let count = 3;
    const tick = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearInterval(tick);
        setCountdownNum(null);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = () => {
    const stream = streamRef.current;
    const audioCtx = audioCtxRef.current;
    if (!stream || !audioCtx) return;

    setState("recording");

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const arrayBuffer = await blob.arrayBuffer();

      let audioBuffer;
      try {
        // Need a live AudioContext for decoding — create a temporary one
        // since the original may still be open
        const decodeCtx = new AudioContext();
        audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
        await decodeCtx.close();
      } catch {
        setWarning("Could not decode audio");
        setState("listening");
        return;
      }

      const samples = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      const period = detectPitch(samples, sampleRate);
      let resampled;
      if (period) {
        const cycle = extractOneCycle(samples, period);
        resampled = resampleToLength(cycle, WAVEFORM_RESOLUTION);
      } else {
        // Fallback: squash entire buffer into one "cycle"
        resampled = resampleToLength(samples, WAVEFORM_RESOLUTION);
      }

      capturedWaveRef.current = resampled;

      // Stop mic resources
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      analyserRef.current = null;

      setState("captured");
      if (onWaveUpdate) onWaveUpdate(resampled);
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }, RECORD_DURATION_MS);
  };

  const recapture = () => {
    capturedWaveRef.current = null;
    startMic();
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.canvas} height={height} />
        {state === "countdown" && countdownNum && (
          <span key={countdownNum} className={styles.countdown}>
            {countdownNum}
          </span>
        )}
      </div>

      <div className={styles.controls}>
        {state === "idle" && (
          <button className={styles.btn} onClick={startMic}>
            Start Microphone
          </button>
        )}

        {state === "requesting" && <span>Requesting mic access...</span>}

        {state === "listening" && (
          <button className={styles.btn} onClick={startCountdown}>
            Capture
          </button>
        )}

        {state === "countdown" && (
          <button className={styles.btn} disabled>
            {countdownNum}...
          </button>
        )}

        {state === "recording" && (
          <button className={styles.btn} disabled>
            Recording...
          </button>
        )}

        {state === "captured" && (
          <button className={styles.btn} onClick={recapture}>
            Re-capture
          </button>
        )}

        {state === "error" && (
          <button className={styles.btn} onClick={startMic}>
            Retry
          </button>
        )}
      </div>

      {warning && <span className={styles.warning}>{warning}</span>}
      {state === "error" && errorMsg && (
        <span className={styles.error}>{errorMsg}</span>
      )}
    </div>
  );
}
