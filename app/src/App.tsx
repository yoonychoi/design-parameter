import { useRef } from 'react';
import { useProject } from './state/useProject';
import NValueTab from './components/tabs/NValueTab';
import FrictionAngleTab from './components/tabs/FrictionAngleTab';
import CohesionTab from './components/tabs/CohesionTab';
import DeformationTab from './components/tabs/DeformationTab';
import SubgradeTab from './components/tabs/SubgradeTab';
import AnchorTab from './components/tabs/AnchorTab';
import PermeabilityTab from './components/tabs/PermeabilityTab';
import SummaryTab from './components/tabs/SummaryTab';
import { ChevronLeft, ChevronRight, Save, FolderOpen } from 'lucide-react';
import type { ProjectState } from './types';

const TABS = [
  { label: 'N값 분포', component: NValueTab },
  { label: '내부마찰각', component: FrictionAngleTab },
  { label: '점착력', component: CohesionTab },
  { label: '변형계수', component: DeformationTab },
  { label: '수평지반반력', component: SubgradeTab },
  { label: '앵커주면마찰', component: AnchorTab },
  { label: '투수계수', component: PermeabilityTab },
  { label: '최종 요약', component: SummaryTab },
];

export default function App() {
  const { state, dispatch } = useProject();
  const activeTab = state.activeTab;
  const ActiveComponent = TABS[activeTab].component;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로젝트 저장 (JSON 다운로드)
  const handleSave = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `설계지반정수_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 프로젝트 불러오기 (JSON 파일 선택)
  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const loaded = JSON.parse(ev.target?.result as string) as ProjectState;
        dispatch({ type: 'LOAD_STATE', payload: loaded });
      } catch {
        alert('파일을 읽는 중 오류가 발생했습니다. 올바른 프로젝트 파일인지 확인해주세요.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 같은 파일 재선택 허용
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">설계지반정수 산정 프로그램</h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleLoad}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              <FolderOpen size={15} /> 불러오기
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save size={15} /> 저장
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => dispatch({ type: 'SET_TAB', tab: i })}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === i
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <ActiveComponent />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between">
          <button
            disabled={activeTab === 0}
            onClick={() => dispatch({ type: 'SET_TAB', tab: activeTab - 1 })}
            className="flex items-center gap-1 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> 이전
          </button>
          <span className="text-sm text-gray-500 self-center">
            {activeTab + 1} / {TABS.length}
          </span>
          <button
            disabled={activeTab === TABS.length - 1}
            onClick={() => dispatch({ type: 'SET_TAB', tab: activeTab + 1 })}
            className="flex items-center gap-1 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음 <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
