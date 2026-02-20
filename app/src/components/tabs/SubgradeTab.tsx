import { useProject } from '../../state/useProject';
import { calculateLayerSummaries } from '../../calculations/nValue';

export default function SubgradeTab() {
  const { state, dispatch } = useProject();
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);
  const results = state.subgradeReaction;

  if (results.length === 0) {
    return <p className="text-gray-500">N값 분포 탭에서 데이터를 먼저 입력해주세요.</p>;
  }

  return (
    <div className="border rounded-lg p-4 overflow-x-auto">
      <h3 className="font-semibold mb-3">수평지반반력계수 (kN/m³)</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-3 py-2">지층명</th>
            <th className="border px-3 py-2">적용N</th>
            <th className="border px-3 py-2">지층구분</th>
            <th className="border px-3 py-2">점착력(kPa)</th>
            <th className="border px-3 py-2">경험식 산정값</th>
            <th className="border px-3 py-2">적용</th>
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
                <td className="border px-3 py-1 text-center bg-gray-50">{r.cohesion.toFixed(1)}</td>
                <td className="border px-3 py-1 text-center bg-blue-50 font-semibold">{r.calculatedValue.toLocaleString()}</td>
                <td className="border px-1 py-1">
                  <div className="flex items-center gap-1">
                    <select className="text-xs px-1 py-1" value={r.applyMode}
                      onChange={(e) => dispatch({ type: 'UPDATE_SUBGRADE_INPUT', layerId: r.layerId, applyMode: e.target.value as 'formula' | 'manual' })}>
                      <option value="formula">경험식</option>
                      <option value="manual">직접입력</option>
                    </select>
                    {r.applyMode === 'manual' ? (
                      <input type="number" className="w-20 px-1 py-1 text-center text-xs"
                        value={r.appliedValue}
                        onChange={(e) => dispatch({ type: 'UPDATE_SUBGRADE_INPUT', layerId: r.layerId, appliedValue: Number(e.target.value), applyMode: 'manual' })}
                      />
                    ) : (
                      <span className="font-semibold text-blue-600">{r.appliedValue.toLocaleString()}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500 space-y-1 border-t pt-3">
        <p className="font-semibold">※ 경험식</p>
        <p>사질토(모래·자갈) — Hukuoka: kh = 6910·N^0.406 (kN/m³)</p>
        <p>점성토(점토·실트) — Soletanche: kh = 500·(10 + Cu/4) (kN/m³)</p>
      </div>
    </div>
  );
}
