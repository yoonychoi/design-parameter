import { useProject } from '../../state/useProject';
import { calculateLayerSummaries } from '../../calculations/nValue';
import type { GroundType } from '../../types';

const GROUND_TYPES: GroundType[] = ['모래', '점토', '모래자갈', '경암', '연암', '풍화암', '파쇄대'];

export default function AnchorTab() {
  const { state, dispatch } = useProject();
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);
  const results = state.anchorFriction;

  if (results.length === 0) {
    return <p className="text-gray-500">N값 분포 탭에서 데이터를 먼저 입력해주세요.</p>;
  }

  return (
    <div className="border rounded-lg p-4 overflow-x-auto">
      <h3 className="font-semibold mb-3">앵커주면마찰저항 (kN/m²)</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-3 py-2">지층명</th>
            <th className="border px-3 py-2">적용N</th>
            <th className="border px-3 py-2">지층구분</th>
            <th className="border px-3 py-2">지반의 종류</th>
            <th className="border px-3 py-2">점착력(kPa)</th>
            <th className="border px-3 py-2">산정값</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const s = summaries.find((x) => x.layerId === r.layerId);
            return (
              <tr key={r.layerId}>
                <td className="border px-3 py-1 bg-gray-50">{s?.layerName}</td>
                <td className="border px-3 py-1 text-center bg-gray-50">{r.appliedN}</td>
                <td className="border px-3 py-1 text-center bg-gray-50">{r.soilType ?? '-'}</td>
                <td className="border px-1 py-1">
                  <select className="w-full text-xs px-1 py-1" value={r.groundType}
                    onChange={(e) => dispatch({ type: 'UPDATE_ANCHOR_INPUT', layerId: r.layerId, groundType: e.target.value as GroundType })}>
                    {GROUND_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="border px-3 py-1 text-center bg-gray-50">{r.cohesion.toFixed(1)}</td>
                <td className="border px-3 py-1 text-center font-semibold bg-blue-50">{r.calculatedValue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 경험값 참조 표 */}
      <div className="mt-6">
        <h4 className="font-semibold text-sm mb-2">※ 앵커주면마찰저항 경험값 참조 (건설공사 비탈면 설계기준)</h4>
        <div className="flex gap-6 text-xs">
          <table className="border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-1" colSpan={3}>토사</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border px-3 py-1">지반 종류</th>
                <th className="border px-3 py-1">N값</th>
                <th className="border px-3 py-1">τu (kN/m²)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-3 py-1">모래</td><td className="border px-3 py-1 text-center">10</td><td className="border px-3 py-1 text-center">100~140</td></tr>
              <tr><td className="border px-3 py-1">모래</td><td className="border px-3 py-1 text-center">20</td><td className="border px-3 py-1 text-center">180~220</td></tr>
              <tr><td className="border px-3 py-1">모래</td><td className="border px-3 py-1 text-center">30</td><td className="border px-3 py-1 text-center">230~270</td></tr>
              <tr><td className="border px-3 py-1">모래</td><td className="border px-3 py-1 text-center">40</td><td className="border px-3 py-1 text-center">290~350</td></tr>
              <tr><td className="border px-3 py-1">모래</td><td className="border px-3 py-1 text-center">50</td><td className="border px-3 py-1 text-center">300~400</td></tr>
              <tr><td className="border px-3 py-1">모래자갈</td><td className="border px-3 py-1 text-center">10</td><td className="border px-3 py-1 text-center">100~200</td></tr>
              <tr><td className="border px-3 py-1">모래자갈</td><td className="border px-3 py-1 text-center">20</td><td className="border px-3 py-1 text-center">170~250</td></tr>
              <tr><td className="border px-3 py-1">모래자갈</td><td className="border px-3 py-1 text-center">30</td><td className="border px-3 py-1 text-center">250~350</td></tr>
              <tr><td className="border px-3 py-1">모래자갈</td><td className="border px-3 py-1 text-center">40</td><td className="border px-3 py-1 text-center">350~450</td></tr>
              <tr><td className="border px-3 py-1">모래자갈</td><td className="border px-3 py-1 text-center">50</td><td className="border px-3 py-1 text-center">450~700</td></tr>
              <tr><td className="border px-3 py-1">점토</td><td className="border px-3 py-1 text-center">-</td><td className="border px-3 py-1 text-center">1.0 × Cu</td></tr>
            </tbody>
          </table>
          <table className="border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-1" colSpan={2}>암반</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border px-3 py-1">지반 종류</th>
                <th className="border px-3 py-1">τu (kN/m²)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-3 py-1">경암</td><td className="border px-3 py-1 text-center">1,500~2,500</td></tr>
              <tr><td className="border px-3 py-1">연암</td><td className="border px-3 py-1 text-center">1,000~1,500</td></tr>
              <tr><td className="border px-3 py-1">풍화암</td><td className="border px-3 py-1 text-center">600~1,000</td></tr>
              <tr><td className="border px-3 py-1">파쇄대</td><td className="border px-3 py-1 text-center">600~1,200</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
