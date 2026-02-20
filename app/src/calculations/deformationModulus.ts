import type { SoilType, BowlesType } from '../types';

export function calculateDeformationModulus(
  n: number,
  soilType: SoilType | null,
  schmertmannAlpha: number | null,
  bowlesType: BowlesType | null
) {
  const schmertmann = schmertmannAlpha !== null ? schmertmannAlpha * n * 0.1 : null;

  let bowles: number | null = null;
  if (bowlesType === 1) bowles = 0.5 * (n + 15);
  else if (bowlesType === 2) bowles = 0.32 * (n + 15);
  else if (bowlesType === 3) bowles = 0.3 * (n + 6);
  else if (bowlesType === 4) bowles = 1.2 * (n + 6);

  const yoshinaka = 0.678 * Math.pow(n, 0.993);
  const hisatake = (5 * n + 70) * 0.1;
  const roadBridge = 2.8 * n;

  let foundationStd: number | null = null;
  if (soilType === '모래') foundationStd = 0.766 * n;
  else if (soilType === '자갈') foundationStd = 1.2 * (n + 6);

  const values = [schmertmann, bowles, yoshinaka, hisatake, roadBridge, foundationStd].filter(
    (v): v is number => v !== null
  );

  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  return {
    schmertmann, bowles, yoshinaka, hisatake, roadBridge, foundationStd,
    average, min, max,
  };
}
