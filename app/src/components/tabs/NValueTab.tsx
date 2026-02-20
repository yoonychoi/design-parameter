import { useState } from 'react';
import { useProject } from '../../state/useProject';
import { calculateLayerSummaries } from '../../calculations/nValue';
import { Plus, Trash2 } from 'lucide-react';
import {
  Chart as ChartJS, LinearScale, PointElement,
  Title, Tooltip, Legend, ScatterController,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(ScatterController, LinearScale, PointElement, Title, Tooltip, Legend);

// 지층별 색상 팔레트
const LAYER_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#84cc16', '#6366f1', '#14b8a6', '#f43f5e',
];

export default function NValueTab() {
  const { state, dispatch } = useProject();
  const [newLayerName, setNewLayerName] = useState('');
  const [newBhName, setNewBhName] = useState('');
  const [selectedBhId, setSelectedBhId] = useState<string | null>(null);

  const summaries = calculateLayerSummaries(state.layers, state.boreholes);
  const selectedBh = state.boreholes.find((bh) => bh.id === selectedBhId) ?? state.boreholes[0] ?? null;

  const addLayer = () => {
    if (!newLayerName.trim()) return;
    dispatch({ type: 'ADD_LAYER', name: newLayerName.trim() });
    setNewLayerName('');
  };
  const addBorehole = () => {
    if (!newBhName.trim()) return;
    dispatch({ type: 'ADD_BOREHOLE', name: newBhName.trim() });
    setNewBhName('');
  };

  // 차트 데이터: 지층별 분산형 — 전체 시추공 측정값을 지층으로 그룹핑
  const chartData = {
    datasets: state.layers.map((layer, i) => {
      const points: { x: number; y: number }[] = [];
      for (const bh of state.boreholes) {
        for (const m of bh.measurements) {
          if (m.layerId === layer.id) {
            points.push({ x: m.nValue, y: m.depth });
          }
        }
      }
      const color = LAYER_COLORS[i % LAYER_COLORS.length];
      return {
        label: layer.name,
        data: points,
        backgroundColor: color,
        borderColor: color,
        pointRadius: 5,
        pointHoverRadius: 7,
      };
    }).filter((d) => d.data.length > 0),
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        type: 'linear' as const,
        reverse: true,
        min: 0,
        title: { display: true, text: '심도 (m)' },
        grid: { color: '#e5e7eb' },
      },
      x: {
        type: 'linear' as const,
        title: { display: true, text: 'N값' },
        min: 0,
        grid: { color: '#e5e7eb' },
      },
    },
    plugins: {
      title: { display: false },
      legend: { position: 'right' as const },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'scatter'>) =>
            `${ctx.dataset.label}: 심도 ${ctx.parsed.y}m, N=${ctx.parsed.x}`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* 프로젝트 설정 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 지층 설정 */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">지층 목록</h3>
          <div className="flex gap-2 mb-3">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="지층명 입력"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLayer()}
            />
            <button onClick={addLayer} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.layers.map((l) => (
              <span key={l.id} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                {l.name}
                <button onClick={() => dispatch({ type: 'REMOVE_LAYER', layerId: l.id })} className="text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 시추공 설정 */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">시추공 목록</h3>
          <div className="flex gap-2 mb-3">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="공번 입력 (예: BH-01)"
              value={newBhName}
              onChange={(e) => setNewBhName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBorehole()}
            />
            <button onClick={addBorehole} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.boreholes.map((bh) => (
              <span key={bh.id} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                {bh.name}
                <button onClick={() => dispatch({ type: 'REMOVE_BOREHOLE', boreholeId: bh.id })} className="text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* N값 입력 */}
      {state.boreholes.length > 0 && state.layers.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">N값 입력</h3>
          <div className="flex gap-2 mb-4">
            {state.boreholes.map((bh) => (
              <button
                key={bh.id}
                onClick={() => setSelectedBhId(bh.id)}
                className={`px-3 py-1 rounded text-sm ${(selectedBh?.id === bh.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {bh.name}
              </button>
            ))}
          </div>

          {selectedBh && (
            <>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 w-16">심도</th>
                    <th className="border px-3 py-2">지층</th>
                    <th className="border px-3 py-2 w-24">N값</th>
                    <th className="border px-3 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBh.measurements.map((m) => (
                    <tr key={m.id}>
                      <td className="border px-3 py-1 text-center bg-gray-50">{m.depth}</td>
                      <td className="border px-1 py-1">
                        <select
                          className="w-full px-2 py-1"
                          value={m.layerId}
                          onChange={(e) =>
                            dispatch({ type: 'UPDATE_MEASUREMENT', boreholeId: selectedBh.id, measurementId: m.id, layerId: e.target.value })
                          }
                        >
                          {state.layers.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-1 py-1">
                        <input
                          type="number"
                          className="w-full px-2 py-1 text-center"
                          value={m.nValue}
                          onChange={(e) =>
                            dispatch({ type: 'UPDATE_MEASUREMENT', boreholeId: selectedBh.id, measurementId: m.id, nValue: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="border px-1 py-1 text-center">
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_MEASUREMENT', boreholeId: selectedBh.id, measurementId: m.id })}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() =>
                  dispatch({ type: 'ADD_MEASUREMENT', boreholeId: selectedBh.id, layerId: state.layers[0].id, nValue: 0 })
                }
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> 측정 행 추가
              </button>
            </>
          )}
        </div>
      )}

      {/* 산출 결과 */}
      {summaries.length > 0 && summaries.some((s) => s.count > 0) && (
        <div className="grid grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">지층별 대표 N값</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2">지층명</th>
                  <th className="border px-3 py-2">측정치 수</th>
                  <th className="border px-3 py-2">대표 N값</th>
                </tr>
              </thead>
              <tbody>
                {summaries.filter((s) => s.count > 0).map((s) => (
                  <tr key={s.layerId}>
                    <td className="border px-3 py-1">{s.layerName}</td>
                    <td className="border px-3 py-1 text-center">{s.count}</td>
                    <td className="border px-3 py-1 text-center font-semibold">{s.representativeN}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border rounded-lg p-4">
            <Scatter data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
