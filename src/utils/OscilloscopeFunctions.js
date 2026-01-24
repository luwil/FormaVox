/**
 * Draw grid and midline for an oscilloscope / waveform canvas
 */
export function drawOscilloscopeGrid(ctx, width, height, options = {}) {
  const {
    background = "#111",
    gridColor = "#333",
    midlineColor = "#555",
    lines = 10,
  } = options;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < lines; i++) {
    const y = (height / lines) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);

    const x = (width / lines) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  ctx.stroke();

  ctx.strokeStyle = midlineColor;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

/**
 * Draw a waveform on the canvas
 */
export function drawOscilloscopeWaveform(
  ctx,
  waveform,
  width,
  height,
  color = "cyan",
  lineWidth = 2
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i < waveform.length; i++) {
    const x = (i / (waveform.length - 1)) * width;
    const y = height / 2 - waveform[i] * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/**
 * Map mouse X/Y to waveform index and amplitude
 */
export const getOscilloscopeIndexFromX = (x, width, resolution) =>
  Math.max(
    0,
    Math.min(resolution - 1, Math.round((x / width) * (resolution - 1)))
  );

export const getOscilloscopeAmpFromY = (y, height) =>
  Math.max(-1, Math.min(1, (height / 2 - y) / (height / 2)));

/**
 * Linear interpolation for waveform editing
 */
export function interpolateOscilloscopeWaveform(
  waveform,
  startIdx,
  endIdx,
  startAmp,
  endAmp
) {
  const dx = endIdx - startIdx;
  if (dx === 0) return;
  for (let i = 0; i <= Math.abs(dx); i++) {
    const t = i / Math.abs(dx);
    const ix = startIdx + Math.sign(dx) * i;
    waveform[ix] = startAmp + (endAmp - startAmp) * t;
  }
}
