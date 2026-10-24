/** In-place radix-2 FFT. Inverse is normalized on each axis. */
export function fft(re: Float64Array, im: Float64Array, inverse = false) {
  const n = re.length;
  if (n < 1 || n & (n - 1)) throw Error("FFT requiere una potencia de dos");
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = ((inverse ? 2 : -2) * Math.PI) / len,
      wr0 = Math.cos(a),
      wi0 = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let wr = 1,
        wi = 0;
      for (let j = 0; j < len / 2; j++) {
        const u = i + j,
          v = u + len / 2,
          tr = re[v] * wr - im[v] * wi,
          ti = re[v] * wi + im[v] * wr;
        re[v] = re[u] - tr;
        im[v] = im[u] - ti;
        re[u] += tr;
        im[u] += ti;
        const w = wr * wr0 - wi * wi0;
        wi = wr * wi0 + wi * wr0;
        wr = w;
      }
    }
  }
  if (inverse)
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
}
export function fft2(
  re: Float64Array,
  im: Float64Array,
  n: number,
  inverse = false,
) {
  const r = new Float64Array(n),
    m = new Float64Array(n);
  for (let y = 0; y < n; y++) {
    r.set(re.subarray(y * n, (y + 1) * n));
    m.set(im.subarray(y * n, (y + 1) * n));
    fft(r, m, inverse);
    re.set(r, y * n);
    im.set(m, y * n);
  }
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      r[y] = re[y * n + x];
      m[y] = im[y * n + x];
    }
    fft(r, m, inverse);
    for (let y = 0; y < n; y++) {
      re[y * n + x] = r[y];
      im[y * n + x] = m[y];
    }
  }
}
