import { useProject } from '../../state/useProject';
import { exportToExcel } from '../../export/excelExport';
import { Download } from 'lucide-react';

export default function SummaryTab() {
  const { state, dispatch } = useProject();
  const results = state.finalSummary;

  if (results.length === 0) {
    return <p className="text-gray-500">N값 분포 탭에서 데이터를 먼저 입력해주세요.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 overflow-x-auto">
        <h3 className="font-semibold mb-3">설계지반정수 요약</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-3 py-2">지층명</th>
              <th className="border px-3 py-2">대표N</th>
              <th className="border px-3 py-2">적용N</th>
              <th className="border px-3 py-2">단위중량<br/>(kN/m³)</th>
              <th className="border px-3 py-2">점착력<br/>c(kPa)</th>
              <th className="border px-3 py-2">내부마찰각<br/>φ(°)</th>
              <th className="border px-3 py-2">변형계수<br/>E(MPa)</th>
              <th className="border px-3 py-2">수평지반반력<br/>kh(kN/m³)</th>
              <th className="border px-3 py-2">앵커주면마찰<br/>(kN/m²)</th>
              <th className="border px-3 py-2">투수계수<br/>k(cm/sec)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.layerId}>
                <td className="border px-3 py-1 bg-gray-50 font-medium">{r.layerName}</td>
                <td className="border px-3 py-1 text-center bg-gray-50">{r.representativeN}</td>
                <td className="border px-3 py-1 text-center bg-gray-50">{r.appliedN}</td>
                <td className="border px-1 py-1">
                  <input type="number" step="0.1" className="w-16 px-1 py-1 text-center"
                    value={r.unitWeight ?? ''} placeholder="-"
                    onChange={(e) => dispatch({ type: 'UPDATE_UNIT_WEIGHT', layerId: r.layerId, unitWeight: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="border px-3 py-1 text-center">{r.cohesion.toFixed(1)}</td>
                <td className="border px-3 py-1 text-center">{r.frictionAngle}</td>
                <td className="border px-3 py-1 text-center">{r.deformationModulus.toFixed(1)}</td>
                <td className="border px-3 py-1 text-center">{r.subgradeReaction.toLocaleString()}</td>
                <td className="border px-3 py-1 text-center">{r.anchorFriction}</td>
                <td className="border px-3 py-1 text-center text-xs">
                  {(() => {
                    const v = r.permeability;
                    if (v === null || v === 0) return '-';
                    const exp = v.toExponential(3);
                    const [mantissa, rawExp] = exp.split('e');
                    const expNum = parseInt(rawExp);
                    const sign = expNum >= 0 ? '+' : '-';
                    const absExp = Math.abs(expNum).toString().padStart(2, '0');
                    return `${mantissa}E${sign}${absExp}`;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => exportToExcel(state)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <Download size={16} /> 엑셀 다운로드
        </button>
      </div>
    </div>
  );
}
