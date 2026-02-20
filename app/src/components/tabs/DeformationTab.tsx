import { useProject } from '../../state/useProject';
import { calculateLayerSummaries } from '../../calculations/nValue';
import type { SoilType, BowlesType } from '../../types';

export default function DeformationTab() {
  const { state, dispatch } = useProject();
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);
  const results = state.deformationModulus;

  if (results.length === 0) {
    return <p className="text-gray-500">N값 분포 탭에서 데이터를 먼저 입력해주세요.</p>;
  }

  const fmt = (v: number | null) => (v !== null ? v.toFixed(1) : '-');

  return (
    <div className="border rounded-lg p-4 overflow-x-auto">
      <h3 className="font-semibold mb-3">변형계수 (MPa)</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-2">지층명</th>
            <th className="border px-2 py-2">적용N</th>
            <th className="border px-2 py-2">지층구분</th>
            <th className="border px-2 py-2">α</th>
            <th className="border px-2 py-2">Bowles</th>
            <th className="border px-2 py-2">Schm.</th>
            <th className="border px-2 py-2">Bowles</th>
            <th className="border px-2 py-2">Yoshi.</th>
            <th className="border px-2 py-2">Hisa.</th>
            <th className="border px-2 py-2">도로교</th>
            <th className="border px-2 py-2">구조물</th>
            <th className="border px-2 py-2">평균</th>
            <th className="border px-2 py-2">범위</th>
            <th className="border px-2 py-2">시험값</th>
            <th className="border px-2 py-2">인근</th>
            <th className="border px-2 py-2">적용</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const s = summaries.find((x) => x.layerId === r.layerId);
            return (
              <tr key={r.layerId}>
                <td className="border px-2 py-1 bg-gray-50">{s?.layerName}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.appliedN}</td>
                <td className="border px-1 py-1">
                  <select className="w-full text-xs px-1 py-1" value={r.soilType ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, soilType: (e.target.value || null) as SoilType | null })}>
                    <option value="">선택</option>
                    <option value="점토">점토</option>
                    <option value="실트">실트</option>
                    <option value="모래">모래</option>
                    <option value="자갈">자갈</option>
                  </select>
                </td>
                <td className="border px-1 py-1">
                  <input type="number" className="w-12 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.schmertmannAlpha ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, schmertmannAlpha: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-1 py-1">
                  <select className="w-full text-xs px-1 py-1" value={r.bowlesType ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, bowlesType: (e.target.value ? Number(e.target.value) : null) as BowlesType | null })}>
                    <option value="">선택</option>
                    <option value="1">모래</option>
                    <option value="2">점토질모래</option>
                    <option value="3">실트질모래</option>
                    <option value="4">자갈섞인모래</option>
                  </select>
                </td>
                <td className="border px-2 py-1 text-center bg-gray-50">{fmt(r.schmertmann)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{fmt(r.bowles)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.yoshinaka.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.hisatake.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{r.roadBridge.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center bg-gray-50">{fmt(r.foundationStd)}</td>
                <td className="border px-2 py-1 text-center font-semibold bg-blue-50">{r.average.toFixed(1)}</td>
                <td className="border px-2 py-1 text-center text-xs bg-gray-50">{r.min.toFixed(1)}~{r.max.toFixed(1)}</td>
                <td className="border px-1 py-1">
                  <input type="number" className="w-14 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.testValue ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, testValue: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-1 py-1">
                  <input type="number" className="w-14 px-1 py-1 text-center text-xs" placeholder="-"
                    value={r.nearbyData ?? ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, nearbyData: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-1 py-1">
                  <div className="flex items-center gap-1">
                    <select className="text-xs px-1 py-1" value={r.applyMode}
                      onChange={(e) => dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, applyMode: e.target.value as 'formula' | 'manual' })}>
                      <option value="formula">경험식</option>
                      <option value="manual">직접입력</option>
                    </select>
                    {r.applyMode === 'manual' ? (
                      <input
                        type="number"
                        step="0.1"
                        className="w-16 px-1 py-1 text-center text-xs"
                        value={r.appliedValue}
                        onChange={(e) =>
                          dispatch({ type: 'UPDATE_DEFORMATION_INPUT', layerId: r.layerId, appliedValue: Number(e.target.value) })
                        }
                      />
                    ) : (
                      <span className="font-semibold text-blue-600 text-xs">{r.appliedValue.toFixed(1)}</span>
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
        <p>Schmertmann: E = αN × 0.1 (MPa) &nbsp;— α: 실트 4 / 세립·중립모래 7 / 조립모래 10 / 자갈 12~15</p>
        <p>Bowles: 모래 E = 0.5(N+15) / 점토질모래 E = 0.32(N+15) / 실트질모래 E = 0.3(N+6) / 자갈섞인모래 E = 1.2(N+6) (MPa)</p>
        <p>Yoshinaka: E = 0.678·N^0.993 (MPa) &nbsp;|&nbsp; Hisatake: E = (5N+70) × 0.1 (MPa) &nbsp;|&nbsp; 도로교시방서: E = 2.8N (MPa)</p>
        <p>구조물기초설계기준: 모래 E = 0.766N / 자갈 E = 1.2(N+6) (MPa) — 모래·자갈층에만 산정</p>
      </div>
    </div>
  );
}
