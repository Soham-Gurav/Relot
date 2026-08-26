/**
 * Beaufort-based Speed Reduction & Weather ETA Physics Engine
 * Exported from SaltyTaro/maritime-routing (IMO Kwon 2008 Model)
 */

export type VesselType = 'container' | 'bulk' | 'tanker' | 'lng' | 'general';
export type LoadCondition = 'laden' | 'ballast';

export interface SpeedModelInput {
  baseSpeedKnots: number;
  waveHeightM: number;
  windSpeedKt: number;
  swellHeightM: number;
  vesselType: VesselType;
  loadCondition: LoadCondition;
  waveDirectionDeg?: number;
  vesselHeadingDeg?: number;
}

export interface SpeedModelOutput {
  effectiveSpeedKnots: number;
  speedReductionPct: number;
  beaufortNumber: number;
  seaStateFactor: number;
  limitingFactor: 'wave' | 'wind' | 'swell' | 'none';
}

const BEAUFORT_WIND_KT = [1, 3, 6, 10, 16, 21, 27, 33, 40, 47, 55, 63, 999];

export function windToBeaufort(windKt: number): number {
  if (windKt < 0) return 0;
  for (let bf = 0; bf < BEAUFORT_WIND_KT.length; bf++) {
    if (windKt < BEAUFORT_WIND_KT[bf]!) return bf;
  }
  return 12;
}

const BEAUFORT_WAVE_M = [0, 0.1, 0.3, 0.6, 1.0, 2.0, 3.0, 4.0, 5.5, 7.0, 9.0, 11.5, 14.0];

export function waveToBeaufort(waveM: number): number {
  if (waveM < 0) return 0;
  for (let bf = 0; bf < BEAUFORT_WAVE_M.length; bf++) {
    if (waveM < BEAUFORT_WAVE_M[bf]!) return Math.max(0, bf - 1);
  }
  return 12;
}

const SEA_STATE_FACTORS: Record<VesselType, Record<LoadCondition, number[]>> = {
  container: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.97, 0.93, 0.87, 0.79, 0.68, 0.55, 0.40, 0.25, 0.10],
    ballast: [1.00, 1.00, 0.99, 0.97, 0.94, 0.88, 0.80, 0.70, 0.58, 0.44, 0.30, 0.18, 0.07],
  },
  bulk: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.96, 0.91, 0.84, 0.75, 0.63, 0.50, 0.36, 0.22, 0.09],
    ballast: [1.00, 1.00, 0.98, 0.96, 0.92, 0.83, 0.73, 0.61, 0.48, 0.34, 0.22, 0.12, 0.05],
  },
  tanker: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.97, 0.94, 0.89, 0.82, 0.72, 0.60, 0.46, 0.30, 0.12],
    ballast: [1.00, 1.00, 0.99, 0.97, 0.93, 0.86, 0.77, 0.66, 0.53, 0.39, 0.26, 0.15, 0.06],
  },
  lng: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.96, 0.92, 0.86, 0.78, 0.67, 0.54, 0.39, 0.24, 0.10],
    ballast: [1.00, 1.00, 0.99, 0.97, 0.93, 0.87, 0.79, 0.69, 0.56, 0.42, 0.28, 0.16, 0.06],
  },
  general: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.96, 0.91, 0.84, 0.75, 0.63, 0.50, 0.36, 0.22, 0.09],
    ballast: [1.00, 1.00, 0.98, 0.96, 0.92, 0.85, 0.76, 0.65, 0.52, 0.38, 0.25, 0.14, 0.06],
  },
};

export function computeSeaStateFactor(input: SpeedModelInput): SpeedModelOutput {
  const windBf = windToBeaufort(input.windSpeedKt);
  const waveBf = waveToBeaufort(input.waveHeightM);
  const swellBf = waveToBeaufort(input.swellHeightM);

  const maxBf = Math.max(windBf, waveBf, swellBf);
  let limitingFactor: SpeedModelOutput['limitingFactor'] = 'none';
  if (maxBf > 0) {
    if (windBf >= waveBf && windBf >= swellBf) limitingFactor = 'wind';
    else if (waveBf >= swellBf) limitingFactor = 'wave';
    else limitingFactor = 'swell';
  }

  const factors = SEA_STATE_FACTORS[input.vesselType][input.loadCondition];
  const seaStateFactor = factors[Math.min(12, maxBf)] ?? 1.0;
  const effectiveSpeedKnots = Math.max(0.5, input.baseSpeedKnots * seaStateFactor);

  return {
    effectiveSpeedKnots: Math.round(effectiveSpeedKnots * 10) / 10,
    speedReductionPct: Math.round((1 - seaStateFactor) * 100),
    beaufortNumber: maxBf,
    seaStateFactor: Math.round(seaStateFactor * 1000) / 1000,
    limitingFactor,
  };
}
