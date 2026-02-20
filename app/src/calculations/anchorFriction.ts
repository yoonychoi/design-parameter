import type { GroundType } from '../types';
import {
  ANCHOR_ROCK_TABLE,
  ANCHOR_SAND_GRAVEL_TABLE,
  ANCHOR_SAND_TABLE,
} from '../constants/anchorTable';

function interpolateTable(
  table: { nValue: number; min: number; max: number }[],
  n: number
): number {
  if (n <= table[0].nValue) return table[0].min;
  if (n >= table[table.length - 1].nValue) return table[table.length - 1].min;

  for (let i = 0; i < table.length - 1; i++) {
    const low = table[i];
    const high = table[i + 1];
    if (n >= low.nValue && n <= high.nValue) {
      const ratio = (n - low.nValue) / (high.nValue - low.nValue);
      return Math.round(low.min + ratio * (high.min - low.min));
    }
  }
  return 0;
}

export function calculateAnchorFriction(
  n: number,
  groundType: GroundType,
  cohesion: number
): number {
  switch (groundType) {
    case '경암':
    case '연암':
    case '풍화암':
    case '파쇄대': {
      const row = ANCHOR_ROCK_TABLE.find((r) => r.type === groundType);
      return row ? row.min : 0;
    }
    case '모래자갈':
      return interpolateTable(ANCHOR_SAND_GRAVEL_TABLE, n);
    case '모래':
      return interpolateTable(ANCHOR_SAND_TABLE, n);
    case '점토':
      return Math.round(cohesion);
    default:
      return 0;
  }
}
