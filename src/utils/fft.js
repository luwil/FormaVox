/**
 * In-place radix-2 Cooley-Tukey FFT.
 *
 * @param {Float64Array} re  Real parts (length must be a power of 2)
 * @param {Float64Array} im  Imaginary parts (same length)
 *
 * On return, re[k] and im[k] hold the complex DFT coefficient X[k].
 */
export function fft(re, im) {
  const N = re.length;

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;

    if (i < j) {
      let tmp = re[i];
      re[i] = re[j];
      re[j] = tmp;
      tmp = im[i];
      im[i] = im[j];
      im[j] = tmp;
    }
  }

  // Butterfly stages
  for (let size = 2; size <= N; size *= 2) {
    const half = size / 2;
    const angle = (-2 * Math.PI) / size;

    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let start = 0; start < N; start += size) {
      let curRe = 1;
      let curIm = 0;

      for (let k = 0; k < half; k++) {
        const evenIdx = start + k;
        const oddIdx = start + k + half;

        const tRe = curRe * re[oddIdx] - curIm * im[oddIdx];
        const tIm = curRe * im[oddIdx] + curIm * re[oddIdx];

        re[oddIdx] = re[evenIdx] - tRe;
        im[oddIdx] = im[evenIdx] - tIm;
        re[evenIdx] += tRe;
        im[evenIdx] += tIm;

        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
}
