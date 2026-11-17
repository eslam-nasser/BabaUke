/**
 * Monophonic pitch detection for the tuner, using the normalised square
 * difference function (the core of the McLeod Pitch Method).
 * Returns the frequency in Hz, or null when there is no clear note.
 */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  minHz = 110,
  maxHz = 900,
): { hz: number; clarity: number } | null {
  const n = samples.length;

  let energy = 0;
  for (let i = 0; i < n; i++) energy += samples[i] * samples[i];
  if (Math.sqrt(energy / n) < 0.01) return null; // too quiet

  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxLag = Math.min(n >> 1, Math.ceil(sampleRate / minHz));
  const nsdf = new Float32Array(maxLag + 2);

  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) {
    let acf = 0;
    let norm = 0;
    for (let i = 0; i < n - lag; i++) {
      const a = samples[i];
      const b = samples[i + lag];
      acf += a * b;
      norm += a * a + b * b;
    }
    nsdf[lag] = norm > 0 ? (2 * acf) / norm : 0;
  }

  // Collect the local maxima, then take the first one that is nearly as
  // strong as the best. Picking the first avoids jumping down an octave.
  let best = 0;
  const peaks: number[] = [];
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (nsdf[lag] > 0 && nsdf[lag] > nsdf[lag - 1] && nsdf[lag] >= nsdf[lag + 1]) {
      peaks.push(lag);
      if (nsdf[lag] > best) best = nsdf[lag];
    }
  }
  if (best < 0.82) return null; // not a clean, pitched sound

  const lag = peaks.find((p) => nsdf[p] >= best * 0.92)!;

  // Parabolic interpolation between samples for sub-sample accuracy.
  const a = nsdf[lag - 1];
  const b = nsdf[lag];
  const c = nsdf[lag + 1];
  const denom = a - 2 * b + c;
  const shift = denom === 0 ? 0 : (0.5 * (a - c)) / denom;

  return { hz: sampleRate / (lag + shift), clarity: b };
}

export const UKE_STRINGS = [
  { name: "G", label: "4th string", midi: 67, hz: 392.0 },
  { name: "C", label: "3rd string", midi: 60, hz: 261.63 },
  { name: "E", label: "2nd string", midi: 64, hz: 329.63 },
  { name: "A", label: "1st string", midi: 69, hz: 440.0 },
] as const;

/** How far `hz` is from `target`, in cents (100 cents = one fret). */
export function centsOff(hz: number, target: number): number {
  return 1200 * Math.log2(hz / target);
}
