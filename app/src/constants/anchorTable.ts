// 앵커주면마찰저항 참조테이블 (건설공사 비탈면 설계기준)
// 극한주면마찰저항 τu (kN/m²)

export const ANCHOR_ROCK_TABLE: { type: string; min: number; max: number }[] = [
  { type: '경암', min: 1500, max: 2500 },
  { type: '연암', min: 1000, max: 1500 },
  { type: '풍화암', min: 600, max: 1000 },
  { type: '파쇄대', min: 600, max: 1200 },
];

export const ANCHOR_SAND_GRAVEL_TABLE: { nValue: number; min: number; max: number }[] = [
  { nValue: 10, min: 100, max: 200 },
  { nValue: 20, min: 170, max: 250 },
  { nValue: 30, min: 250, max: 350 },
  { nValue: 40, min: 350, max: 450 },
  { nValue: 50, min: 450, max: 700 },
];

export const ANCHOR_SAND_TABLE: { nValue: number; min: number; max: number }[] = [
  { nValue: 10, min: 100, max: 140 },
  { nValue: 20, min: 180, max: 220 },
  { nValue: 30, min: 230, max: 270 },
  { nValue: 40, min: 290, max: 350 },
  { nValue: 50, min: 300, max: 400 },
];

// 점성토: τu = 1.0 × C (C는 점착력)
