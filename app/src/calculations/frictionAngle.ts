export function calculateFrictionAngle(n: number) {
  const dunham = Math.sqrt(12 * n) + 15;
  const peck = 0.3 * n + 27;
  const meyerhof = n >= 10 ? 0.25 * n + 32.5 : null;
  const ohsaki = Math.sqrt(20 * n) + 15;
  const roadBridge = Math.sqrt(15 * n) + 15;

  const values = [dunham, peck, meyerhof, ohsaki, roadBridge].filter(
    (v): v is number => v !== null
  );

  const average = Math.floor(values.reduce((a, b) => a + b, 0) / values.length);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { dunham, peck, meyerhof, ohsaki, roadBridge, average, min, max };
}
