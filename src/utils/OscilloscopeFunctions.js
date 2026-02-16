/**
 * Draw grid and midline for an oscilloscope / waveform canvas
 */
export function drawOscilloscopeGrid(ctx, width, height, options = {}) {
  const {
    background = "#07060d",
    gridColor = "#1a1840",
    midlineColor = "#3d3580",
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
 * Draw a waveform with neon glow effect
 */
export function drawOscilloscopeWaveform(
  ctx,
  waveform,
  width,
  height,
  color = "#ff2d95",
  lineWidth = 2,
) {
  // Outer glow pass
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth + 6;
  ctx.globalAlpha = 0.15;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  for (let i = 0; i < waveform.length; i++) {
    const x = (i / (waveform.length - 1)) * width;
    const y = height / 2 - waveform[i] * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // Inner glow pass
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth + 2;
  ctx.globalAlpha = 0.4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  for (let i = 0; i < waveform.length; i++) {
    const x = (i / (waveform.length - 1)) * width;
    const y = height / 2 - waveform[i] * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // Core line
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  for (let i = 0; i < waveform.length; i++) {
    const x = (i / (waveform.length - 1)) * width;
    const y = height / 2 - waveform[i] * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/**
 * Map mouse X/Y to waveform index and amplitude
 */
export const getOscilloscopeIndexFromX = (x, width, resolution) =>
  Math.max(
    0,
    Math.min(resolution - 1, Math.round((x / width) * (resolution - 1))),
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
  endAmp,
) {
  const dx = endIdx - startIdx;
  if (dx === 0) return;
  for (let i = 0; i <= Math.abs(dx); i++) {
    const t = i / Math.abs(dx);
    const ix = startIdx + Math.sign(dx) * i;
    waveform[ix] = startAmp + (endAmp - startAmp) * t;
  }
}
