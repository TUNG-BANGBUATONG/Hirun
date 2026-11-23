import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  computeLiveLearningMetrics,
  HubId,
  StudyPeriod,
} from './data/learningData';
import { CampusViewport } from './scene/CampusViewport';
import { BottomDock } from './components/BottomDock';
import { AnalyticsModal } from './components/AnalyticsModal';
import { LearnerTableModal } from './components/LearnerTableModal';

type ActiveView = 'scene' | 'analytics' | 'learners';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('scene');
  const [selectedHub, setSelectedHub] = useState<HubId | null>(null);
  const [studyPeriod, setStudyPeriod] = useState<StudyPeriod>('morning');
  const [explodeAmount, setExplodeAmount] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [resetCameraNonce, setResetCameraNonce] = useState<number>(0);
  const [simPhase, setSimPhase] = useState<number>(0);

  useEffect(() => {
    if (simSpeed === 0) return;
    const interval = window.setInterval(() => {
      setSimPhase((prev) => prev + 0.35 * simSpeed);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [simSpeed]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (activeView !== 'scene') {
          setActiveView('scene');
        } else {
          setSelectedHub(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView]);

  const metrics = useMemo(
    () => computeLiveLearningMetrics(studyPeriod, simPhase),
    [studyPeriod, simPhase],
  );

  const handleFocusHubFromSheet = useCallback((hubId: HubId) => {
    setSelectedHub(hubId);
    setActiveView('scene');
    setDockCollapsed(false);
  }, []);

  const handleResetCamera = useCallback(() => {
    setResetCameraNonce((n) => n + 1);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0B1120] text-slate-100">
      {/* Full-bleed isolated Three.js 3D Campus Viewport */}
      <CampusViewport
        selectedHub={selectedHub}
        onSelectHub={setSelectedHub}
        studyPeriod={studyPeriod}
        explodeAmount={explodeAmount}
        simSpeed={simSpeed}
        resetCameraNonce={resetCameraNonce}
      />

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 px-5 sm:px-6 flex items-center justify-between gap-8 bg-[#0B1120]/94 border-b border-slate-800/90">
        {/* Zone 1: Single-line Brand Title */}
        <button
          type="button"
          onClick={() => {
            setActiveView('scene');
            setSelectedHub(null);
            handleResetCamera();
          }}
          className="text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          แดชบอร์ดวิเคราะห์การเรียนรู้ 3 มิติ
        </button>

        {/* Zone 2: Single-Line Navigation Links */}
        <nav
          className="flex items-center gap-6 text-sm font-medium"
          aria-label="เมนูหลักแดชบอร์ดวิเคราะห์ผู้เรียน"
        >
          <button
            type="button"
            onClick={() => setActiveView('scene')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'scene'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            ภาพรวม 3 มิติ
          </button>
          <button
            type="button"
            onClick={() => setActiveView('analytics')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'analytics'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            กราฟวิเคราะห์การเรียน
          </button>
          <button
            type="button"
            onClick={() => setActiveView('learners')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'learners'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            ข้อมูลผู้เรียน
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeView !== 'scene') {
                setActiveView('scene');
              } else {
                setDockCollapsed((prev) => !prev);
              }
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {activeView !== 'scene'
              ? 'กลับสู่ 3 มิติ'
              : dockCollapsed
                ? 'แสดงแผงควบคุม'
                : 'โหมดเต็มจอ'}
          </button>
        </div>
      </header>

      {/* Collapsible Bottom Control Dock (visible in 3D view) */}
      {activeView === 'scene' && (
        <BottomDock
          collapsed={dockCollapsed}
          onToggleCollapse={() => setDockCollapsed((prev) => !prev)}
          selectedHub={selectedHub}
          onSelectHub={setSelectedHub}
          studyPeriod={studyPeriod}
          onChangeStudyPeriod={setStudyPeriod}
          explodeAmount={explodeAmount}
          onChangeExplode={setExplodeAmount}
          simSpeed={simSpeed}
          onChangeSimSpeed={setSimSpeed}
          onResetCamera={handleResetCamera}
          onOpenAnalytics={() => setActiveView('analytics')}
          metrics={metrics}
        />
      )}

      {/* Learning Analytics Graphs & Insights Sheet */}
      {activeView === 'analytics' && (
        <AnalyticsModal
          onClose={() => setActiveView('scene')}
          onFocusHub={handleFocusHubFromSheet}
          metrics={metrics}
          initialHubFilter={selectedHub}
        />
      )}

      {/* Learner Roster & Learning Hub Summary Table */}
      {activeView === 'learners' && (
        <LearnerTableModal
          onClose={() => setActiveView('scene')}
          onFocusHub={handleFocusHubFromSheet}
          metrics={metrics}
          initialHubFilter={selectedHub}
        />
      )}
    </div>
  );
}
