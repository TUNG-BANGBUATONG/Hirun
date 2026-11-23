import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Crosshair,
  Download,
  Info,
  Search,
  X,
} from 'lucide-react';
import {
  getStatusLabelTh,
  HUB_BY_ID,
  HubId,
  LEARNER_RECORDS,
  LEARNING_HUBS,
  LearnerStatus,
  LiveHubMetrics,
} from '../data/learningData';

interface LearnerTableModalProps {
  onClose: () => void;
  onFocusHub: (hubId: HubId) => void;
  metrics: Record<HubId, LiveHubMetrics>;
  initialHubFilter: HubId | null;
}

type TableViewMode = 'learners' | 'hubs';
type LearnerSortKey = 'id' | 'avgScore' | 'progressPct' | 'weeklyHours';
type HubSortKey = 'code' | 'activeLearners' | 'completionPct' | 'avgScore' | 'atRiskCount';

function StatusCell({ status }: { status: LearnerStatus }) {
  if (status === 'excellent') {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{getStatusLabelTh(status)}</span>
      </span>
    );
  }
  if (status === 'at-risk') {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{getStatusLabelTh(status)}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium">
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>{getStatusLabelTh(status)}</span>
    </span>
  );
}

export function LearnerTableModal({
  onClose,
  onFocusHub,
  metrics,
  initialHubFilter,
}: LearnerTableModalProps) {
  const [mode, setMode] = useState<TableViewMode>('learners');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LearnerStatus>('all');
  const [hubFilter, setHubFilter] = useState<HubId | 'all'>(
    initialHubFilter ?? 'all',
  );
  const [learnerSortKey, setLearnerSortKey] = useState<LearnerSortKey>('avgScore');
  const [learnerSortAsc, setLearnerSortAsc] = useState(false);

  const [hubSortKey, setHubSortKey] = useState<HubSortKey>('code');
  const [hubSortAsc, setHubSortAsc] = useState(true);

  const toggleLearnerSort = (key: LearnerSortKey) => {
    if (learnerSortKey === key) {
      setLearnerSortAsc((prev) => !prev);
    } else {
      setLearnerSortKey(key);
      setLearnerSortAsc(key === 'id');
    }
  };

  const toggleHubSort = (key: HubSortKey) => {
    if (hubSortKey === key) {
      setHubSortAsc((prev) => !prev);
    } else {
      setHubSortKey(key);
      setHubSortAsc(key === 'code');
    }
  };

  const filteredLearners = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = LEARNER_RECORDS.filter((st) => {
      if (statusFilter !== 'all' && st.status !== statusFilter) return false;
      if (hubFilter !== 'all' && st.hubId !== hubFilter) return false;
      if (!q) return true;
      const hubName = HUB_BY_ID[st.hubId].nameTh.toLowerCase();
      return (
        st.id.toLowerCase().includes(q) ||
        st.nameTh.toLowerCase().includes(q) ||
        st.courseNameTh.toLowerCase().includes(q) ||
        hubName.includes(q)
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (learnerSortKey === 'id') cmp = a.id.localeCompare(b.id);
      else if (learnerSortKey === 'avgScore') cmp = a.avgScore - b.avgScore;
      else if (learnerSortKey === 'progressPct')
        cmp = a.progressPct - b.progressPct;
      else cmp = a.weeklyHours - b.weeklyHours;
      return learnerSortAsc ? cmp : -cmp;
    });

    return list;
  }, [query, statusFilter, hubFilter, learnerSortKey, learnerSortAsc]);

  const filteredHubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = LEARNING_HUBS.map((hub) => ({
      hub,
      m: metrics[hub.id],
    })).filter(({ hub, m }) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        hub.nameTh.toLowerCase().includes(q) ||
        hub.code.toLowerCase().includes(q) ||
        hub.categoryTh.toLowerCase().includes(q) ||
        hub.leadInstructor.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (hubSortKey === 'code') cmp = a.hub.code.localeCompare(b.hub.code);
      else if (hubSortKey === 'activeLearners')
        cmp = a.m.activeLearners - b.m.activeLearners;
      else if (hubSortKey === 'completionPct')
        cmp = a.m.completionPct - b.m.completionPct;
      else if (hubSortKey === 'avgScore') cmp = a.m.avgScore - b.m.avgScore;
      else cmp = a.m.atRiskCount - b.m.atRiskCount;
      return hubSortAsc ? cmp : -cmp;
    });

    return list;
  }, [metrics, query, statusFilter, hubSortKey, hubSortAsc]);

  const handleExportLearnersCsv = () => {
    const header = [
      'รหัสผู้เรียน',
      'ชื่อ-นามสกุล',
      'ศูนย์การเรียนรู้',
      'รายวิชา',
      'สถานะ',
      'คะแนนเฉลี่ย',
      'ความคืบหน้า (%)',
      'ชั่วโมงเรียน/สัปดาห์',
      'แบบทดสอบที่ผ่าน',
      'ใช้งานล่าสุด',
    ];
    const rows = filteredLearners.map((s) => [
      s.id,
      s.nameTh,
      HUB_BY_ID[s.hubId].shortNameTh,
      s.courseNameTh,
      getStatusLabelTh(s.status),
      s.avgScore,
      s.progressPct,
      s.weeklyHours,
      `${s.quizzesPassed}/${s.quizzesTotal}`,
      s.lastActiveTh,
    ]);
    const csvContent =
      '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learner-roster-analytics.csv';
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
      aria-label="ข้อมูลผู้เรียนและตารางสรุปรายศูนย์การเรียนรู้"
    >
      <div className="w-full max-w-[1160px] h-fit rounded-xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-semibold text-white">
              ฐานข้อมูลผู้เรียนและผลสัมฤทธิ์รายกลุ่มวิชา
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ติดตามความก้าวหน้ารายบุคคล คัดกรองผู้เรียนที่ต้องดูแลพิเศษ และเชื่อมโยงไปยังอาคารในฉาก 3 มิติ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('learners')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'learners'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                รายชื่อผู้เรียน ({LEARNER_RECORDS.length})
              </button>
              <button
                type="button"
                onClick={() => setMode('hubs')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'hubs'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                สรุปรายศูนย์ (6)
              </button>
            </div>

            {mode === 'learners' && (
              <button
                type="button"
                onClick={handleExportLearnersCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออกรายชื่อ CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่างข้อมูลผู้เรียน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'learners'
                    ? 'ค้นหารหัสผู้เรียน ชื่อ หรือรายวิชา...'
                    : 'ค้นหารหัสศูนย์ ชื่อศูนย์ หรืออาจารย์ผู้ดูแล...'
                }
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {mode === 'learners' && (
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value as HubId | 'all')}
                className="px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                aria-label="กรองตามศูนย์การเรียนรู้"
              >
                <option value="all">ทุกศูนย์การเรียนรู้</option>
                {LEARNING_HUBS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortNameTh}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            {(
              [
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'excellent', label: 'ดีเยี่ยม' },
                { id: 'on-track', label: 'ตามแผน' },
                { id: 'at-risk', label: 'ต้องติดตาม' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode 1: Individual Learner Roster Table */}
        {mode === 'learners' ? (
          filteredLearners.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-slate-300 font-medium">
                ไม่พบข้อมูลผู้เรียนที่ตรงกับเงื่อนไข
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ลองล้างคำค้นหาหรือเปลี่ยนตัวกรองสถานะเพื่อแสดงผู้เรียนทั้งหมด
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('all');
                  setHubFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-medium text-slate-400 bg-slate-950/30">
                    <th className="py-3 pl-6 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleLearnerSort('id')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>ผู้เรียน / รหัสประจำตัว</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3">รายวิชา · ศูนย์</th>
                    <th className="py-3 px-3">สถานะ</th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleLearnerSort('avgScore')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>คะแนนเฉลี่ย</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleLearnerSort('progressPct')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>ความคืบหน้า</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleLearnerSort('weeklyHours')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>เวลาเรียน/สัปดาห์</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3">เข้าใช้งานล่าสุด</th>
                    <th className="py-3 pl-3 pr-6 text-right">ศูนย์ 3 มิติ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {filteredLearners.map((st) => {
                    const hub = HUB_BY_ID[st.hubId];
                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-800/45 transition-colors"
                      >
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="font-medium text-slate-100">
                            {st.nameTh}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span className="font-mono text-slate-400">
                              {st.id}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[230px]">
                              {st.advisorNoteTh}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-200">{st.courseNameTh}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {hub.shortNameTh} · สอบผ่าน {st.quizzesPassed}/
                            {st.quizzesTotal}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <StatusCell status={st.status} />
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-100 whitespace-nowrap">
                          {st.avgScore.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${st.progressPct}%`,
                                  backgroundColor:
                                    st.status === 'at-risk'
                                      ? '#F59E0B'
                                      : st.status === 'excellent'
                                        ? '#22C55E'
                                        : '#38BDF8',
                                }}
                              />
                            </div>
                            <span className="font-mono tabular-nums text-slate-200 w-9 text-right">
                              {st.progressPct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                          {st.weeklyHours.toFixed(1)} ชม.
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                          {st.lastActiveTh}
                        </td>
                        <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onFocusHub(st.hubId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-slate-950 transition-colors cursor-pointer"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>โฟกัส 3D</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : filteredHubs.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-slate-300 font-medium">
              ไม่พบศูนย์การเรียนรู้ที่ตรงกับเงื่อนไข
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-medium text-slate-400 bg-slate-950/30">
                  <th className="py-3 pl-6 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleHubSort('code')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>รหัส / ศูนย์การเรียนรู้</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3">อาจารย์ผู้รับผิดชอบ</th>
                  <th className="py-3 px-3">สถานะ</th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleHubSort('activeLearners')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>เข้าใช้งาน (คน)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleHubSort('completionPct')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>อัตราเรียนจบ</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleHubSort('avgScore')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>คะแนนเฉลี่ย</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleHubSort('atRiskCount')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>กลุ่มต้องติดตาม</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 pl-3 pr-6 text-right">มุมมอง 3 มิติ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredHubs.map(({ hub, m }) => (
                  <tr
                    key={hub.id}
                    className="hover:bg-slate-800/45 transition-colors"
                  >
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="font-medium text-slate-100">
                        {hub.nameTh}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-400">
                          {hub.code}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span>{hub.categoryTh}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                      {hub.leadInstructor}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusCell status={m.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-100 whitespace-nowrap">
                      {m.activeLearners}{' '}
                      <span className="text-slate-500">
                        / {hub.enrolledLearners}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-emerald-400 whitespace-nowrap">
                      {m.completionPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-sky-400 whitespace-nowrap">
                      {m.avgScore.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-amber-400 whitespace-nowrap">
                      {m.atRiskCount} คน
                    </td>
                    <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onFocusHub(hub.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>โฟกัส 3D</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
