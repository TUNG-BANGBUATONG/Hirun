import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Download,
  Info,
  X,
} from 'lucide-react';
import {
  getLearningTimeSeries,
  getStatusLabelTh,
  HubId,
  LEARNING_ALERTS,
  LEARNING_HUBS,
  LearnerStatus,
  LiveHubMetrics,
  TimeRange,
  TOTAL_ENROLLED_LEARNERS,
} from '../data/learningData';

interface AnalyticsModalProps {
  onClose: () => void;
  onFocusHub: (hubId: HubId) => void;
  metrics: Record<HubId, LiveHubMetrics>;
  initialHubFilter: HubId | null;
}

function StatusIcon({ status }: { status: LearnerStatus }) {
  if (status === 'excellent') {
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }
  if (status === 'at-risk') {
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }
  return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
}

export function AnalyticsModal({
  onClose,
  onFocusHub,
  metrics,
  initialHubFilter,
}: AnalyticsModalProps) {
  const [range, setRange] = useState<TimeRange>('week');
  const [hubFilter, setHubFilter] = useState<HubId | 'all'>(
    initialHubFilter ?? 'all',
  );
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const series = useMemo(() => getLearningTimeSeries(range), [range]);

  const totalActive = LEARNING_HUBS.reduce(
    (sum, h) => sum + metrics[h.id].activeLearners,
    0,
  );
  const activeRatePct = Math.round((totalActive / TOTAL_ENROLLED_LEARNERS) * 100);
  const avgCompletion = (
    LEARNING_HUBS.reduce((sum, h) => sum + metrics[h.id].completionPct, 0) /
    LEARNING_HUBS.length
  ).toFixed(1);
  const avgScore = (
    LEARNING_HUBS.reduce((sum, h) => sum + metrics[h.id].avgScore, 0) /
    LEARNING_HUBS.length
  ).toFixed(1);
  const avgHours = (
    LEARNING_HUBS.reduce((sum, h) => sum + metrics[h.id].studyHoursPerWeek, 0) /
    LEARNING_HUBS.length
  ).toFixed(1);

  const filteredAlerts = useMemo(() => {
    if (hubFilter === 'all') return LEARNING_ALERTS;
    return LEARNING_ALERTS.filter((al) => al.hubId === hubFilter);
  }, [hubFilter]);

  // SVG Dual-Series Chart Geometry (0–100% scale for Completion % and Avg Score %)
  const chartW = 760;
  const chartH = 230;
  const padL = 48;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const minY = 50;
  const maxY = 100;

  const getX = (idx: number) =>
    padL +
    (series.length <= 1 ? innerW / 2 : (idx / (series.length - 1)) * innerW);
  const getY = (val: number) =>
    padT + innerH - ((val - minY) / (maxY - minY)) * innerH;

  const completionLine = series
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.completionPct)}`)
    .join(' ');
  const completionArea = `${completionLine} L ${getX(series.length - 1)} ${padT + innerH} L ${getX(0)} ${padT + innerH} Z`;

  const scoreLine = series
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.avgScore)}`)
    .join(' ');
  const scoreArea = `${scoreLine} L ${getX(series.length - 1)} ${padT + innerH} L ${getX(0)} ${padT + innerH} Z`;

  const activePoint =
    hoverIdx !== null && series[hoverIdx]
      ? series[hoverIdx]
      : series[series.length - 1];

  const handleExportCsv = () => {
    const header = [
      'ช่วงเวลา',
      'ผู้เรียนเข้าใช้งาน (คน)',
      'อัตราเรียนจบ (%)',
      'คะแนนเฉลี่ย (%)',
      'ชั่วโมงเรียนเฉลี่ย/สัปดาห์',
      'จำนวนงานที่ส่ง (ชิ้น)',
    ];
    const rows = series.map((p) => [
      p.label,
      p.activeLearners,
      p.completionPct,
      p.avgScore,
      p.studyHours,
      p.submissions,
    ]);
    const csvContent =
      '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-analytics-${range}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-x-0 top-14 bottom-0 z-30 flex justify-center p-4 sm:p-6 bg-[#060A14]/88 overflow-y-auto dashboard-scroll"
      role="dialog"
      aria-modal="true"
      aria-label="กราฟวิเคราะห์ผลการเรียนรู้และพฤติกรรมผู้เรียน"
    >
      <div className="w-full max-w-[1160px] h-fit rounded-xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-semibold text-white">
              วิเคราะห์ผลการเรียนรู้และพฤติกรรมผู้เรียน
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ติดตามอัตราการเรียนจบ · แนวโน้มคะแนนประเมิน · เปรียบเทียบสมรรถนะทั้ง 6 ศูนย์การเรียนรู้
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
              {(
                [
                  { id: 'week', label: 'รายสัปดาห์' },
                  { id: 'month', label: 'รายเดือน' },
                  { id: 'term', label: 'รายภาคเรียน' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setRange(opt.id);
                    setHoverIdx(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    range === opt.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่างกราฟวิเคราะห์การเรียน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Column Learning KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 border-b border-slate-800">
          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">ผู้เรียนเข้าใช้งานปัจจุบัน</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-semibold text-sky-400 tabular-nums">
                {totalActive.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">คน</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              คิดเป็น {activeRatePct}% จากทั้งหมด {TOTAL_ENROLLED_LEARNERS.toLocaleString()} คน
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">อัตราเรียนจบหลักสูตรเฉลี่ย</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-semibold text-emerald-400 tabular-nums">
                {avgCompletion}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              เป้าหมายภาคเรียน ≥ 82.0%
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">คะแนนประเมินผลเฉลี่ย</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-semibold text-white tabular-nums">
                {avgScore}
              </span>
              <span className="text-xs text-slate-400">/ 100 คะแนน</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              เกณฑ์ผ่านมาตรฐาน 70.0 คะแนน
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">เวลาเรียนเฉลี่ยต่อสัปดาห์</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-semibold text-amber-400 tabular-nums">
                {avgHours}
              </span>
              <span className="text-xs text-slate-400">ชม. / คน</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              รวมบทเรียนออนไลน์และปฏิบัติการ
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left 8 Columns: Interactive Completion & Avg Score Trend Chart */}
          <div className="lg:col-span-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  แนวโน้มอัตราการเรียนจบและคะแนนเฉลี่ยของผู้เรียน
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 tabular-nums">
                  <span>ช่วงเวลา: {activePoint.label}</span>
                  <span className="text-emerald-400">
                    เรียนจบ {activePoint.completionPct}%
                  </span>
                  <span className="text-sky-400">
                    คะแนนเฉลี่ย {activePoint.avgScore}
                  </span>
                  <span className="text-amber-400">
                    เข้าเรียน {activePoint.activeLearners.toLocaleString()} คน
                  </span>
                  <span className="text-slate-300">
                    ส่งงาน {activePoint.submissions.toLocaleString()} ชิ้น
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
                  อัตราเรียนจบ (%)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
                  คะแนนเฉลี่ย (%)
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto min-w-[520px]"
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.26" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[50, 62.5, 75, 87.5, 100].map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="rgba(148,163,184,0.14)"
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 8}
                        y={y + 4}
                        textAnchor="end"
                        fill="#64748B"
                        fontSize="11"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {Math.round(val)}%
                      </text>
                    </g>
                  );
                })}

                <path d={completionArea} fill="url(#compGrad)" />
                <path d={scoreArea} fill="url(#scoreGrad)" />

                <path
                  d={completionLine}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path
                  d={scoreLine}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />

                {hoverIdx !== null && series[hoverIdx] && (
                  <g>
                    <line
                      x1={getX(hoverIdx)}
                      y1={padT}
                      x2={getX(hoverIdx)}
                      y2={padT + innerH}
                      stroke="rgba(226,232,240,0.35)"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={getX(hoverIdx)}
                      cy={getY(series[hoverIdx].completionPct)}
                      r="4.5"
                      fill="#22C55E"
                      stroke="#0F172A"
                      strokeWidth="2"
                    />
                    <circle
                      cx={getX(hoverIdx)}
                      cy={getY(series[hoverIdx].avgScore)}
                      r="4.5"
                      fill="#38BDF8"
                      stroke="#0F172A"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {series.map((pt, idx) => {
                  const x = getX(idx);
                  const colW = innerW / Math.max(1, series.length);
                  return (
                    <g key={pt.label}>
                      <text
                        x={x}
                        y={chartH - 10}
                        textAnchor="middle"
                        fill={hoverIdx === idx ? '#F8FAFC' : '#64748B'}
                        fontSize="11"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {pt.label}
                      </text>
                      <rect
                        x={x - colW / 2}
                        y={padT}
                        width={colW}
                        height={innerH}
                        fill="transparent"
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoverIdx(idx)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right 4 Columns: 6-Hub Completion Comparison */}
          <div className="lg:col-span-4 p-6">
            <h2 className="text-sm font-semibold text-white mb-1">
              ผลสัมฤทธิ์แยกตามศูนย์การเรียนรู้
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              เปรียบเทียบอัตราเรียนจบและคะแนนเฉลี่ย พร้อมปุ่มโฟกัสอาคาร 3 มิติ
            </p>

            <div className="space-y-3.5">
              {LEARNING_HUBS.map((hub) => {
                const m = metrics[hub.id];
                return (
                  <div key={hub.id}>
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="font-medium text-slate-200 truncate">
                        {hub.shortNameTh}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-slate-300 tabular-nums">
                          {m.completionPct}%
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {m.avgScore} คะแนน
                        </span>
                        <button
                          type="button"
                          onClick={() => onFocusHub(hub.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-sky-300 hover:bg-sky-500 hover:text-slate-950 transition-colors cursor-pointer"
                          title={`โฟกัส 3 มิติที่${hub.nameTh}`}
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>3D</span>
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${m.completionPct}%`,
                          backgroundColor: hub.accentHex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Academic Alerts & Insights Feed */}
        <div className="border-t border-slate-800 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-white">
              ข้อค้นพบและการแจ้งเตือนด้านการเรียนรู้
            </h2>
            <div className="flex items-center gap-1 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setHubFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  hubFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ทุกศูนย์
              </button>
              {LEARNING_HUBS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHubFilter(h.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    hubFilter === h.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h.shortNameTh}
                </button>
              ))}
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              ไม่มีรายการแจ้งเตือนเฉพาะสำหรับศูนย์การเรียนรู้ที่เลือกในช่วงเวลานี้
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredAlerts.map((al) => (
                <div
                  key={al.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <StatusIcon status={al.severity} />
                    <div className="min-w-0">
                      <div className="text-slate-200">{al.messageTh}</div>
                      <div className="text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono tabular-nums">{al.time}</span>
                        <span aria-hidden="true">·</span>
                        <span>{al.hubNameTh}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getStatusLabelTh(al.severity)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {al.metricNote}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFocusHub(al.hubId)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/90 text-slate-200 hover:bg-sky-500 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    ดูใน 3 มิติ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
