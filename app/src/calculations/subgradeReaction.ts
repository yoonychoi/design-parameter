import type { SoilType } from '../types';

/**
 * 수평지반반력계수 산정
 * 모래/자갈(사질토): Hukuoka  kh = 6910 × N^0.406 (kN/m³)
 * 점토/실트(점성토): Soletanche  kh = 500 × (10 + Cu/4) (kN/m³)
 */
export function calculateSubgradeReaction(
  n: number,
  soilType: SoilType | null,
  cohesion: number
): number {
  if (soilType === '모래' || soilType === '자갈') {
    // Hukuoka: kh = 6910 × N^0.406 (kN/m³)
    return Math.round(6910 * Math.pow(n, 0.406));
  }
  if (soilType === '점토' || soilType === '실트') {
    // Soletanche: kh = 500 × (10 + Cu/4) (kN/m³)
    return Math.round(500 * (10 + cohesion / 4));
  }
  return 0;
}
