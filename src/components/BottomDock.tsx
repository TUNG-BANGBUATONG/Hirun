import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  FastForward,
  Layers,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Sunrise,
} from 'lucide-react';
import {
  getStatusLabelTh,
  HUB_BY_ID,
  HubId,
  LEARNING_HUBS,
  LearnerStatus,
  LiveHubMetrics,
  StudyPeriod,
  TOTAL_ENROLLED_LEARNERS,
} from '../data/learningData';

interface BottomDockProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedHub: HubId | null;
  onSelectHub: (hub: HubId | null) => void;
  studyPeriod: StudyPeriod;
  onChangeStudyPeriod: (period: StudyPeriod) => void;
  explodeAmount: number;
  onChangeExplode: (val: number) => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onResetCamera: () => void;
  onOpenAnalytics: () => void;
  metrics: Record<HubId, LiveHubMetrics>;
}

function getStatusColorClass(status: LearnerStatus): string {
  switch (status) {
    case 'excellent':
      return 'text-emerald-400';
    case 'on-track':
      return 'text-sky-400';
    case 'at-risk':
      return 'text-amber-400';
  }
}

export function BottomDock({
  collapsed,
  onToggleCollapse,
  selectedHub,
  onSelectHub,
  studyPeriod,
  onChangeStudyPeriod,
  explodeAmount,
  onChangeExplode,
  simSpeed,
  onChangeSimSpeed,
  onResetCamera,
  onOpenAnalytics,
  metrics,
}: BottomDockProps) {
  const totalActive = LEARNING_HUBS.reduce(
    (sum, h) => sum + metrics[h.id].activeLearners,
    0,
  );
  const avgCompletion = (
    LEARNING_HUBS.reduce((sum, h) => sum + metrics[h.id].completionPct, 0) /
    LEARNING_HUBS.length
  ).toFixed(1);
  const avgScore = (
    LEARNING_HUBS.reduce((sum, h) => sum + metrics[h.id].avgScore, 0) /
    LEARNING_HUBS.length
  ).toFixed(1);
  const totalAtRisk = LEARNING_HUBS.reduce((sum, h) => sum + h.atRiskCount, 0);

  const activeHubMeta = selectedHub ? HUB_BY_ID[selectedHub] : null;
  const activeHubMetrics = selectedHub ? metrics[selectedHub] : null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-20 w-[min(960px,95vw)] pointer-events-none transition-transform duration-300 ease-out"
      style={{
        transform: collapsed
          ? 'translate(-50%, calc(100% - 34px))'
          : 'translate(-50%, 0)',
      }}
    >
      {/* Collapse / Expand Top Edge Handle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-t-lg text-xs font-medium text-slate-200 bg-[#0F172A]/95 border border-b-0 border-slate-700/80 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>แสดงแผงควบคุม (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>ซ่อนแผงควบคุม (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container — Solid/RGBA surface, zero backdrop-filter over WebGL */}
      <div className="pointer-events-auto rounded-xl bg-[#0F172A]/95 border border-slate-700/80 shadow-2xl px-4 py-3 flex flex-col gap-2.5">
        {/* Row 1: Learning KPI Strip OR Selected Hub Inspector */}
        {activeHubMeta && activeHubMetrics ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-slate-300">
                  {activeHubMeta.code}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{activeHubMeta.categoryTh}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-medium whitespace-nowrap ${getStatusColorClass(activeHubMetrics.status)}`}
                >
                  {getStatusLabelTh(activeHubMetrics.status)}
                </span>
              </div>
              <div className="text-sm font-semibold text-white truncate mt-0.5">
                {activeHubMeta.nameTh}
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <div>
                <div className="text-[11px] text-slate-400">เข้าเรียนขณะนี้</div>
                <div className="text-sm font-mono font-semibold text-white tabular-nums">
                  {activeHubMetrics.activeLearners}{' '}
                  <span className="text-[11px] font-normal text-slate-400">
                    / {activeHubMeta.enrolledLearners}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">อัตราเรียนจบ</div>
                <div className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">
                  {activeHubMetrics.completionPct}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">คะแนนเฉลี่ย</div>
                <div className="text-sm font-mono font-semibold text-sky-400 tabular-nums">
                  {activeHubMetrics.avgScore}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">ต้องติดตาม</div>
                <div className="text-sm font-mono font-semibold text-amber-400 tabular-nums">
                  {activeHubMetrics.atRiskCount} คน
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenAnalytics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>วิเคราะห์กลุ่มวิชา</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectHub(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ภาพรวม</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-2.5 border-b border-slate-800">
            <div className="flex items-baseline justify-between sm:block">
              <div className="text-[11px] text-slate-400">ผู้เรียนเข้าใช้งาน</div>
              <div className="text-base font-mono font-semibold text-sky-400 tabular-nums">
                {totalActive.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">
                  / {TOTAL_ENROLLED_LEARNERS.toLocaleString()} คน
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between sm:block">
              <div className="text-[11px] text-slate-400">อัตราเรียนจบเฉลี่ย</div>
              <div className="text-base font-mono font-semibold text-emerald-400 tabular-nums">
                {avgCompletion}{' '}
                <span className="text-xs font-normal text-slate-400">%</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between sm:block">
              <div className="text-[11px] text-slate-400">คะแนนประเมินเฉลี่ย</div>
              <div className="text-base font-mono font-semibold text-white tabular-nums">
                {avgScore}{' '}
                <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between sm:block">
              <div className="text-[11px] text-slate-400">ผู้เรียนต้องติดตาม</div>
              <div className="text-base font-mono font-semibold text-amber-400 tabular-nums">
                {totalAtRisk}{' '}
                <span className="text-xs font-normal text-slate-400">คน</span>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Consolidated Interactive 3D Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Hub Focus Presets */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                onSelectHub(null);
                onResetCamera();
              }}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedHub === null
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              ภาพรวม
            </button>
            {LEARNING_HUBS.map((hub) => {
              const active = selectedHub === hub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => onSelectHub(hub.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {hub.shortNameTh}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Exploded Cutaway + Study Period Lighting + Speed */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <label className="flex items-center gap-2 text-xs text-slate-300 whitespace-nowrap shrink-0">
              <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden md:inline">แยกชั้น</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeAmount * 100)}
                onChange={(e) => onChangeExplode(Number(e.target.value) / 100)}
                className="spatial-range w-20"
                aria-label="ปรับระดับแยกชั้นอาคาร 3 มิติ"
              />
              <span className="font-mono text-[11px] text-slate-400 w-8 text-right tabular-nums">
                {Math.round(explodeAmount * 100)}%
              </span>
            </label>

            <div
              className="flex items-center p-0.5 rounded-lg bg-slate-950/90 border border-slate-800"
              role="group"
              aria-label="ช่วงเวลาการเรียน"
            >
              <button
                type="button"
                onClick={() => onChangeStudyPeriod('morning')}
                title="ช่วงเช้า"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  studyPeriod === 'morning'
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">เช้า</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeStudyPeriod('afternoon')}
                title="ช่วงบ่าย"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  studyPeriod === 'afternoon'
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sunrise className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">บ่าย</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeStudyPeriod('evening')}
                title="ทบทวนค่ำ"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  studyPeriod === 'evening'
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ค่ำ</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (simSpeed === 1) onChangeSimSpeed(2.5);
                else if (simSpeed === 2.5) onChangeSimSpeed(0);
                else onChangeSimSpeed(1);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 text-slate-200 border border-slate-700/70 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="ปรับความเร็วการจำลอง"
            >
              {simSpeed === 0 ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>หยุด</span>
                </>
              ) : simSpeed === 1 ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1x</span>
                </>
              ) : (
                <>
                  <FastForward className="w-3.5 h-3.5 text-sky-400" />
                  <span>2.5x</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
