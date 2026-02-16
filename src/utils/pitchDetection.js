/**
 * Normalized autocorrelation pitch detection.
 * Searches lags corresponding to 50–2000 Hz.
 * Returns period in samples or null if correlation < 0.5.
 */
export function detectPitch(buffer, sampleRate) {
  const minPeriod = Math.floor(sampleRate / 2000); // 2000 Hz upper bound
  const maxPeriod = Math.ceil(sampleRate / 50); // 50 Hz lower bound
  const n = buffer.length;

  if (maxPeriod >= n) return null;

  // RMS check — skip if signal is too quiet
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.01) return null;

  let bestLag = 0;
  let bestCorr = -1;

  for (let lag = minPeriod; lag <= maxPeriod && lag < n; lag++) {
    let num = 0;
    let denomA = 0;
    let denomB = 0;
    const limit = n - lag;

    for (let i = 0; i < limit; i++) {
      num += buffer[i] * buffer[i + lag];
      denomA += buffer[i] * buffer[i];
      denomB += buffer[i + lag] * buffer[i + lag];
    }

    const denom = Math.sqrt(denomA * denomB);
    if (denom === 0) continue;

    const corr = num / denom;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestCorr < 0.5) return null;

  // Parabolic interpolation for sub-sample accuracy
  if (bestLag > minPeriod && bestLag < maxPeriod && bestLag < n - 1) {
    const corrMinus = normalizedCorrelation(buffer, bestLag - 1);
    const corrPlus = normalizedCorrelation(buffer, bestLag + 1);
    const shift =
      (corrMinus - corrPlus) / (2 * (corrMinus - 2 * bestCorr + corrPlus));
    if (isFinite(shift)) return bestLag + shift;
  }

  return bestLag;
}

function normalizedCorrelation(buffer, lag) {
  const n = buffer.length;
  const limit = n - lag;
  let num = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < limit; i++) {
    num += buffer[i] * buffer[i + lag];
    denomA += buffer[i] * buffer[i];
    denomB += buffer[i + lag] * buffer[i + lag];
  }
  const denom = Math.sqrt(denomA * denomB);
  return denom === 0 ? 0 : num / denom;
}

/**
 * Find a zero crossing (negative→positive) near the buffer center
 * and extract exactly one period of samples from that point.
 */
export function extractOneCycle(buffer, period) {
  const intPeriod = Math.round(period);
  const center = Math.floor(buffer.length / 2);

  // Search outward from center for a negative→positive zero crossing
  let start = -1;
  const searchRadius = Math.min(intPeriod, center);

  for (let offset = 0; offset < searchRadius; offset++) {
    const idx = center + offset;
    if (idx + intPeriod < buffer.length && idx > 0) {
      if (buffer[idx - 1] <= 0 && buffer[idx] > 0) {
        start = idx;
        break;
      }
    }
    const idx2 = center - offset;
    if (idx2 + intPeriod < buffer.length && idx2 > 0) {
      if (buffer[idx2 - 1] <= 0 && buffer[idx2] > 0) {
        start = idx2;
        break;
      }
    }
  }

  // Fallback: just use center if no zero crossing found
  if (start < 0) {
    start = Math.max(0, center - Math.floor(intPeriod / 2));
  }

  return buffer.slice(start, start + intPeriod);
}

/**
 * Linear interpolation resampling to convert variable-length samples
 * to exactly targetLength samples.
 */
export function resampleToLength(samples, targetLength) {
  const out = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const t = (i / (targetLength - 1)) * (samples.length - 1);
    const i0 = Math.floor(t);
    const i1 = Math.min(samples.length - 1, i0 + 1);
    const frac = t - i0;
    out[i] = samples[i0] * (1 - frac) + samples[i1] * frac;
  }
  return out;
}
