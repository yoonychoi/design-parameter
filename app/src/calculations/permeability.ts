import { CREAGER_TABLE } from '../constants/creagerTable';

export function calculateHazen(d10: number): number {
  return 1.5 * d10 * d10;
}

export function lookupCreager(d20: number): number {
  const table = CREAGER_TABLE; // D20 내림차순 정렬

  // 최대값 1.8 적용 (D20 >= 2.0)
  if (d20 >= table[0].d20) return 1.8;

  // 최솟값 미만
  if (d20 <= table[table.length - 1].d20) return table[table.length - 1].ks;

  // 정확히 일치하거나 바로 위 입경의 ks값 반영
  for (let i = 0; i < table.length; i++) {
    if (table[i].d20 === d20) return table[i].ks;
    if (table[i].d20 < d20) {
      // i-1이 바로 위 입경
      return table[i - 1].ks;
    }
  }
  return 0;
}
