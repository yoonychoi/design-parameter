import { useProject } from '../../state/useProject';
import { calculateLayerSummaries } from '../../calculations/nValue';

export default function CohesionTab() {
  const { state, dispatch } = useProject();
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);
  const results = state.cohesion;

  if (results.length === 0) {
    return <p className="text-gray-500">N값 분포 탭에서 데이터를 먼저 입력해주세요.</p>;
  }

  return (
    <div className="border rounded-lg p-4 overflow-x-auto">
      <h3 className="font-semibold mb-3">점착력 (kPa)  Cu=qu/2</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-2">지층명</th>
            <th className="border px-2 py-2">대표N</th>
            <th className="border px-2 py-2">적용N</th>
            <th className="border px-2 py-2">Dunham</th>
            <th className="border px-2 py-2">Terzaghi-Peck</th>
            <th className="border px-2 py-2">Ohsaki</th>
            <th className="border px-2 py-2">평균</th>
            <th className="border px-2 py-2">범위</th>
            <th className="border px-2 py-2">시험값</th>
            <th className="border px-2 py-2">인근자료</th>
            <th className="border px-2 py-2">적용</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const s = summaries.find((x) => x.layerId === r.layerId);
            return (
              <tr key={r.layerId}>
                <td className="border px-2 py-1 bg-gray-50">{s?.layerName}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{s?.representativeN}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.appliedN}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.dunham.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.terzaghiPeck.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.ohsaki.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center font-semibold bg-blue-50">{r.average.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center text-xs bg-gray-50">{r.min.toFixed(1)}~{r.max.toFixed(1)}</td>
                <td className="border px-1 py-1">
                  <input type="number" className="w-16 px-1 py-1 text-center"
                    value={r.testValue ?? ''} placeholder="-"
                    onChange={(e) => dispatch({ type: 'UPDATE_COHESION_INPUT', layerId: r.layerId, testValue: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-1 py-1">
                  <input type="number" className="w-16 px-1 py-1 text-center"
                    value={r.nearbyData ?? ''} placeholder="-"
                    onChange={(e) => dispatch({ type: 'UPDATE_COHESION_INPUT', layerId: r.layerId, nearbyData: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-1 py-1">
                  <div className="flex items-center gap-1">
                    <select className="text-xs px-1 py-1" value={r.applyMode}
                      onChange={(e) => dispatch({ type: 'UPDATE_COHESION_INPUT', layerId: r.layerId, applyMode: e.target.value as 'formula' | 'manual' })}>
                      <option value="formula">경험식</option>
                      <option value="manual">직접입력</option>
                    </select>
                    {r.applyMode === 'manual' ? (
                      <input
                        type="number"
                        className="w-16 px-1 py-1 text-center text-xs"
                        value={r.appliedValue}
                        onChange={(e) =>
                          dispatch({ type: 'UPDATE_COHESION_INPUT', layerId: r.layerId, appliedValue: Number(e.target.value) })
                        }
                      />
                    ) : (
                      <span className="font-semibold text-blue-600">{r.appliedValue.toFixed(1)}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500 space-y-1 border-t pt-3">
        <p className="font-semibold">※ 경험식 (Cu = qu/2 환산)</p>
        <p>Dunham: qu = N/0.077 &nbsp;|&nbsp; Terzaghi-Peck: qu = N/0.082 &nbsp;|&nbsp; Ohsaki: qu = 40 + N/0.2</p>
      </div>
    </div>
  );
}
