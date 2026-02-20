import { useProject } from '../../state/useProject';
import { calculateLayerSummaries } from '../../calculations/nValue';

export default function PermeabilityTab() {
  const { state, dispatch } = useProject();
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);
  const results = state.permeability;

  if (results.length === 0) {
    return <p className="text-gray-500">N값 분포 탭에서 데이터를 먼저 입력해주세요.</p>;
  }

  const fmtSci = (v: number | null) => {
    if (v === null) return '-';
    if (v === 0) return '0.000E+00';
    const exp = v.toExponential(3); // e.g. "4.500e-2"
    const [mantissa, rawExp] = exp.split('e');
    const expNum = parseInt(rawExp);
    const sign = expNum >= 0 ? '+' : '-';
    const absExp = Math.abs(expNum).toString().padStart(2, '0');
    return `${mantissa}E${sign}${absExp}`;
  };

  return (
    <div className="border rounded-lg p-4 overflow-x-auto">
      <h3 className="font-semibold mb-3">투수계수 (cm/sec)</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-2">지층명</th>
            <th className="border px-2 py-2">지층구분</th>
            <th className="border px-2 py-2">D10(mm)</th>
            <th className="border px-2 py-2">D20(mm)</th>
            <th className="border px-2 py-2">Hazen</th>
            <th className="border px-2 py-2">Creager</th>
            <th className="border px-2 py-2">현장시험</th>
            <th className="border px-2 py-2">인근자료</th>
            <th className="border px-2 py-2">적용</th>
            <th className="border px-2 py-2">비고</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const s = summaries.find((x) => x.layerId === r.layerId);
            return (
              <tr key={r.layerId}>
                <td className="border px-2 py-1 bg-gray-50">{s?.layerName}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.soilType ?? '-'}</td>
                <td className="border px-1 py-1">
                  <input type="number" step="0.001" className="w-16 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.d10 ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_PERMEABILITY_INPUT', layerId: r.layerId, d10: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-1 py-1">
                  <input type="number" step="0.001" className="w-16 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.d20 ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_PERMEABILITY_INPUT', layerId: r.layerId, d20: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-2 py-1 text-center bg-gray-50 text-xs">{fmtSci(r.hazen)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50 text-xs">{fmtSci(r.creager)}</td>
                <td className="border px-1 py-1">
                  <input type="number" step="0.0001" className="w-16 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.fieldTest ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_PERMEABILITY_INPUT', layerId: r.layerId, fieldTest: e.target.value ? Number(e.target.value) : null })}
                  />
                  {r.fieldTest !== null && <div className="text-xs text-gray-400 text-center">{fmtSci(r.fieldTest)}</div>}
                </td>
                <td className="border px-1 py-1">
                  <input type="number" step="0.0001" className="w-16 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.nearbyData ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_PERMEABILITY_INPUT', layerId: r.layerId, nearbyData: e.target.value ? Number(e.target.value) : null })}
                  />
                  {r.nearbyData !== null && <div className="text-xs text-gray-400 text-center">{fmtSci(r.nearbyData)}</div>}
                </td>
                <td className="border px-1 py-1">
                  <div className="flex items-center gap-1">
                    <select className="text-xs px-1 py-1" value={r.applyMode}
                      onChange={(e) => dispatch({ type: 'UPDATE_PERMEABILITY_INPUT', layerId: r.layerId, applyMode: e.target.value as 'formula' | 'manual' })}>
                      <option value="formula">경험식</option>
                      <option value="manual">직접입력</option>
                    </select>
                    {r.applyMode === 'manual' ? (
                      <input type="number" step="0.0001" className="w-20 px-1 py-1 text-center text-xs"
                        value={r.appliedValue}
                        onChange={(e) => dispatch({ type: 'UPDATE_PERMEABILITY_INPUT', layerId: r.layerId, appliedValue: Number(e.target.value) })}
                      />
                    ) : (
                      <span className="font-semibold text-blue-600 text-xs">{fmtSci(r.appliedValue)}</span>
                    )}
                  </div>
                </td>
                <td className="border px-2 py-1 text-center text-xs bg-gray-50">{r.remark}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500 space-y-1 border-t pt-3">
        <p className="font-semibold">※ 경험식</p>
        <p>Hazen (모래 조건만 적용): K = C·(D10)² cm/s &nbsp;— C = 1.5 (상수)</p>
        <p>Creager: D20 기반 참조표 이용 (해당 입경 없을 시 바로 위 입경 ks 적용, 최대 1.8)</p>
      </div>
    </div>
  );
}
