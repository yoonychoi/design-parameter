export function calculateCohesion(n: number) {
  // qu 산정 후 c = qu / 2
  const dunhamQu = n / 0.077;
  const terzaghiPeckQu = n / 0.082;
  const ohsakiQu = 40 + n / 0.2;

  const dunham = dunhamQu / 2;
  const terzaghiPeck = terzaghiPeckQu / 2;
  const ohsaki = ohsakiQu / 2;

  const values = [dunham, terzaghiPeck, ohsaki];
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { dunham, terzaghiPeck, ohsaki, average, min, max };
}
