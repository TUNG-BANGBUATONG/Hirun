export type HubId =
  | 'stem'
  | 'media'
  | 'library'
  | 'assessment'
  | 'workshop'
  | 'advising';

export type StudyPeriod = 'morning' | 'afternoon' | 'evening';

export type TimeRange = 'week' | 'month' | 'term';

export type LearnerStatus = 'excellent' | 'on-track' | 'at-risk';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export interface LearningHub {
  id: HubId;
  code: string;
  nameTh: string;
  shortNameTh: string;
  categoryTh: string;
  leadInstructor: string;
  status: LearnerStatus;
  enrolledLearners: number;
  baseActiveLearners: number;
  baseCompletionPct: number;
  baseAvgScore: number;
  baseStudyHoursPerWeek: number;
  atRiskCount: number;
  descriptionTh: string;
  position: [number, number, number];
  camera: CameraPreset;
  accentHex: string;
}

export interface LiveHubMetrics {
  hubId: HubId;
  activeLearners: number;
  completionPct: number;
  avgScore: number;
  studyHoursPerWeek: number;
  engagementPct: number;
  atRiskCount: number;
  status: LearnerStatus;
}

export interface LearningTimePoint {
  label: string;
  activeLearners: number;
  completionPct: number;
  avgScore: number;
  studyHours: number;
  submissions: number;
}

export interface LearnerRecord {
  id: string;
  nameTh: string;
  hubId: HubId;
  courseNameTh: string;
  status: LearnerStatus;
  avgScore: number;
  progressPct: number;
  weeklyHours: number;
  quizzesPassed: number;
  quizzesTotal: number;
  lastActiveTh: string;
  advisorNoteTh: string;
}

export interface LearningAlert {
  id: string;
  time: string;
  hubId: HubId;
  hubNameTh: string;
  severity: LearnerStatus;
  messageTh: string;
  metricNote: string;
}

export const OVERVIEW_CAMERA: CameraPreset = {
  position: [20.5, 14.5, 21.5],
  target: [0, 1.4, 0],
};

export const LEARNING_HUBS: LearningHub[] = [
  {
    id: 'stem',
    code: 'LRN-01',
    nameTh: 'ศูนย์วิทยาการข้อมูลและ STEM',
    shortNameTh: 'วิทย์และข้อมูล',
    categoryTh: 'วิเคราะห์ข้อมูลและการเขียนโปรแกรม',
    leadInstructor: 'ผศ.ดร.กิตติพงศ์ วัฒนากุล',
    status: 'excellent',
    enrolledLearners: 620,
    baseActiveLearners: 438,
    baseCompletionPct: 88.4,
    baseAvgScore: 84.2,
    baseStudyHoursPerWeek: 9.6,
    atRiskCount: 11,
    descriptionTh: 'กลุ่มวิชาวิทยาการข้อมูล อัลกอริทึม และสถิติประยุกต์ พร้อมห้องจำลองชุดข้อมูลจริง',
    position: [0, 0, -2.5],
    camera: {
      position: [8.5, 7.6, 8.2],
      target: [0, 2.8, -2.5],
    },
    accentHex: '#38BDF8',
  },
  {
    id: 'media',
    code: 'LRN-02',
    nameTh: 'สตูดิโอเรียนออนไลน์และวิดีโอ',
    shortNameTh: 'เรียนออนไลน์',
    categoryTh: 'บทเรียนวิดีโอและห้องเรียนเสมือน',
    leadInstructor: 'อ.พิมพ์ชนก อรุณรุ่ง',
    status: 'on-track',
    enrolledLearners: 540,
    baseActiveLearners: 392,
    baseCompletionPct: 82.5,
    baseAvgScore: 79.8,
    baseStudyHoursPerWeek: 7.4,
    atRiskCount: 14,
    descriptionTh: 'ระบบสตรีมมิงบทเรียนแบบอินเทอร์แอกทีฟ ติดตามอัตราการรับชมและการตอบคำถามระหว่างเรียน',
    position: [-8.2, 0, -5.8],
    camera: {
      position: [-0.8, 9.8, 5.2],
      target: [-8.2, 4.2, -5.8],
    },
    accentHex: '#22C55E',
  },
  {
    id: 'library',
    code: 'LRN-03',
    nameTh: 'คลังบทเรียนและห้องสมุดดิจิทัล',
    shortNameTh: 'คลังบทเรียน',
    categoryTh: 'สื่อการเรียนรู้และแบบฝึกหัดทบทวน',
    leadInstructor: 'ดร.นภัสสร จันทรโชติ',
    status: 'excellent',
    enrolledLearners: 410,
    baseActiveLearners: 284,
    baseCompletionPct: 91.2,
    baseAvgScore: 86.5,
    baseStudyHoursPerWeek: 8.2,
    atRiskCount: 5,
    descriptionTh: 'แหล่งรวมตำราดิจิทัล บทความวิจัย และชุดทบทวนความรู้แบบปรับระดับตามผู้เรียน',
    position: [-6.5, 0, 4.6],
    camera: {
      position: [0.5, 6.2, 12.6],
      target: [-6.5, 1.5, 4.6],
    },
    accentHex: '#F59E0B',
  },
  {
    id: 'assessment',
    code: 'LRN-04',
    nameTh: 'ศูนย์ประเมินผลและแบบทดสอบ',
    shortNameTh: 'ประเมินผล',
    categoryTh: 'วัดสมรรถนะและวิเคราะห์ข้อสอบ',
    leadInstructor: 'รศ.ดร.ธนกฤต สุขสวัสดิ์',
    status: 'at-risk',
    enrolledLearners: 360,
    baseActiveLearners: 214,
    baseCompletionPct: 76.4,
    baseAvgScore: 74.6,
    baseStudyHoursPerWeek: 6.1,
    atRiskCount: 19,
    descriptionTh: 'คลังข้อสอบวินิจฉัยรายบท วิเคราะห์จุดอ่อนของผู้เรียนและแจ้งเตือนกลุ่มที่ควรเสริมทักษะ',
    position: [7.6, 0, 5.2],
    camera: {
      position: [14.2, 6.8, 12.8],
      target: [7.6, 1.3, 5.2],
    },
    accentHex: '#EAB308',
  },
  {
    id: 'workshop',
    code: 'LRN-05',
    nameTh: 'โดมปฏิบัติการและโครงงาน',
    shortNameTh: 'เวิร์กชอป',
    categoryTh: 'เรียนรู้ผ่านการลงมือทำและโปรเจกต์',
    leadInstructor: 'อ.วรเมธ ภักดีวงศ์',
    status: 'excellent',
    enrolledLearners: 320,
    baseActiveLearners: 228,
    baseCompletionPct: 85.0,
    baseAvgScore: 83.1,
    baseStudyHoursPerWeek: 10.2,
    atRiskCount: 8,
    descriptionTh: 'ห้องปฏิบัติการกลุ่มและประเมินผลงานโปรเจกต์จริงตามเกณฑ์รูบริกส์รายสัปดาห์',
    position: [8.0, 0, -4.6],
    camera: {
      position: [15.4, 7.6, 3.6],
      target: [8.0, 2.3, -4.6],
    },
    accentHex: '#06B6D4',
  },
  {
    id: 'advising',
    code: 'LRN-06',
    nameTh: 'ศูนย์แนะแนวและติดตามผู้เรียน',
    shortNameTh: 'แนะแนว',
    categoryTh: 'ให้คำปรึกษาและวางแผนการเรียน',
    leadInstructor: 'อ.ชญานิศ รัตนประภา',
    status: 'on-track',
    enrolledLearners: 230,
    baseActiveLearners: 162,
    baseCompletionPct: 89.6,
    baseAvgScore: 85.4,
    baseStudyHoursPerWeek: 6.8,
    atRiskCount: 7,
    descriptionTh: 'ทีมอาจารย์ที่ปรึกษาและระบบติดตามการเข้าเรียนเพื่อช่วยเหลือผู้เรียนกลุ่มเสี่ยงได้ทันเวลา',
    position: [0.4, 0, 7.6],
    camera: {
      position: [7.4, 6.2, 15.6],
      target: [0.4, 1.4, 7.6],
    },
    accentHex: '#A78BFA',
  },
];

export const HUB_BY_ID: Record<HubId, LearningHub> = LEARNING_HUBS.reduce(
  (acc, hub) => {
    acc[hub.id] = hub;
    return acc;
  },
  {} as Record<HubId, LearningHub>,
);

export const TOTAL_ENROLLED_LEARNERS = LEARNING_HUBS.reduce(
  (sum, h) => sum + h.enrolledLearners,
  0,
);

export function getStatusLabelTh(status: LearnerStatus): string {
  switch (status) {
    case 'excellent':
      return 'ดีเยี่ยม';
    case 'on-track':
      return 'ตามแผน';
    case 'at-risk':
      return 'ต้องติดตาม';
  }
}

export function computeLiveLearningMetrics(
  period: StudyPeriod,
  phase: number,
): Record<HubId, LiveHubMetrics> {
  // Realistic learner activity shifts across morning lectures, afternoon workshops, and evening self-study
  const periodMultipliers: Record<StudyPeriod, Record<HubId, number>> = {
    morning: {
      stem: 1.08,
      media: 0.92,
      library: 0.88,
      assessment: 1.05,
      workshop: 0.96,
      advising: 1.04,
    },
    afternoon: {
      stem: 1.02,
      media: 1.04,
      library: 1.06,
      assessment: 0.98,
      workshop: 1.14,
      advising: 1.1,
    },
    evening: {
      stem: 0.84,
      media: 1.18,
      library: 1.16,
      assessment: 0.9,
      workshop: 0.78,
      advising: 0.72,
    },
  };

  const result = {} as Record<HubId, LiveHubMetrics>;

  for (let i = 0; i < LEARNING_HUBS.length; i++) {
    const h = LEARNING_HUBS[i];
    const wave = Math.sin(phase * 0.65 + i * 1.25) * 0.025;
    const mult = periodMultipliers[period][h.id];

    const activeLearners = Math.min(
      h.enrolledLearners,
      Math.max(40, Math.round(h.baseActiveLearners * mult * (1 + wave))),
    );
    const completionPct = Number(
      Math.min(99.5, Math.max(55, h.baseCompletionPct + wave * 28)).toFixed(1),
    );
    const avgScore = Number(
      Math.min(99.0, Math.max(55, h.baseAvgScore + wave * 22)).toFixed(1),
    );
    const studyHoursPerWeek = Number(
      Math.max(3.5, h.baseStudyHoursPerWeek + wave * 6).toFixed(1),
    );
    const engagementPct = Math.min(
      100,
      Math.round((activeLearners / h.enrolledLearners) * 100),
    );

    result[h.id] = {
      hubId: h.id,
      activeLearners,
      completionPct,
      avgScore,
      studyHoursPerWeek,
      engagementPct,
      atRiskCount: h.atRiskCount,
      status: h.status,
    };
  }

  return result;
}

export function getLearningTimeSeries(range: TimeRange): LearningTimePoint[] {
  if (range === 'week') {
    const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
    const active = [1640, 1785, 1820, 1760, 1695, 1410, 1520];
    const completion = [81.2, 82.4, 83.8, 84.1, 84.6, 85.2, 85.8];
    const score = [79.4, 80.1, 81.2, 81.6, 81.9, 82.4, 82.8];
    const hours = [7.6, 8.1, 8.4, 8.2, 7.9, 6.8, 7.3];
    const subs = [420, 485, 512, 494, 468, 390, 446];
    return days.map((label, i) => ({
      label,
      activeLearners: active[i],
      completionPct: completion[i],
      avgScore: score[i],
      studyHours: hours[i],
      submissions: subs[i],
    }));
  }

  if (range === 'month') {
    const weeks = ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'];
    const active = [1590, 1715, 1805, 1862];
    const completion = [77.5, 80.4, 83.1, 85.6];
    const score = [78.2, 79.8, 81.4, 82.6];
    const hours = [7.4, 7.9, 8.3, 8.6];
    const subs = [1840, 2060, 2210, 2385];
    return weeks.map((label, i) => ({
      label,
      activeLearners: active[i],
      completionPct: completion[i],
      avgScore: score[i],
      studyHours: hours[i],
      submissions: subs[i],
    }));
  }

  const months = ['ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.'];
  const active = [1480, 1650, 1790, 1895];
  const completion = [71.4, 76.8, 82.2, 85.8];
  const score = [76.5, 78.9, 81.1, 83.0];
  const hours = [6.9, 7.6, 8.2, 8.7];
  const subs = [6820, 7940, 8610, 9180];
  return months.map((label, i) => ({
    label,
    activeLearners: active[i],
    completionPct: completion[i],
    avgScore: score[i],
    studyHours: hours[i],
    submissions: subs[i],
  }));
}

export const LEARNER_RECORDS: LearnerRecord[] = [
  {
    id: '67010412',
    nameTh: 'ณัฐภัทร กิตติเจริญ',
    hubId: 'stem',
    courseNameTh: 'วิทยาการข้อมูลประยุกต์',
    status: 'excellent',
    avgScore: 93.5,
    progressPct: 96,
    weeklyHours: 11.4,
    quizzesPassed: 12,
    quizzesTotal: 12,
    lastActiveTh: '12 นาทีที่แล้ว',
    advisorNoteTh: 'ส่งโครงงานก่อนกำหนดและได้คะแนนสูงสุดในรุ่น',
  },
  {
    id: '67010428',
    nameTh: 'ปวีณ์ธิดา ศิริวัฒน์',
    hubId: 'library',
    courseNameTh: 'การวิเคราะห์เชิงสถิติ',
    status: 'excellent',
    avgScore: 91.2,
    progressPct: 94,
    weeklyHours: 9.8,
    quizzesPassed: 11,
    quizzesTotal: 12,
    lastActiveTh: '25 นาทีที่แล้ว',
    advisorNoteTh: 'ทบทวนบทเรียนสม่ำเสมอ อัตราความแม่นยำแบบฝึกหัดสูง',
  },
  {
    id: '67010435',
    nameTh: 'ธนากร รุ่งเรืองสิน',
    hubId: 'assessment',
    courseNameTh: 'คณิตศาสตร์และตรรกะข้อมูล',
    status: 'at-risk',
    avgScore: 58.4,
    progressPct: 48,
    weeklyHours: 3.2,
    quizzesPassed: 5,
    quizzesTotal: 12,
    lastActiveTh: '4 วันที่แล้ว',
    advisorNoteTh: 'ขาดส่งแบบทดสอบ 2 ชุดล่าสุด นัดพบอาจารย์ที่ปรึกษาแล้ว',
  },
  {
    id: '67010449',
    nameTh: 'กัญญารัตน์ วงศ์สุวรรณ',
    hubId: 'workshop',
    courseNameTh: 'โครงงานพัฒนาเว็บแอปพลิเคชัน',
    status: 'excellent',
    avgScore: 89.8,
    progressPct: 92,
    weeklyHours: 12.1,
    quizzesPassed: 10,
    quizzesTotal: 10,
    lastActiveTh: '8 นาทีที่แล้ว',
    advisorNoteTh: 'โดดเด่นด้านการออกแบบระบบและการทำงานเป็นทีม',
  },
  {
    id: '67010461',
    nameTh: 'พชรพล นิลประดับ',
    hubId: 'media',
    courseNameTh: 'การสื่อสารข้อมูลและแดชบอร์ด',
    status: 'on-track',
    avgScore: 81.6,
    progressPct: 84,
    weeklyHours: 7.5,
    quizzesPassed: 9,
    quizzesTotal: 11,
    lastActiveTh: '1 ชม. ที่แล้ว',
    advisorNoteTh: 'ดูวิดีโอบทเรียนครบทุกตอนและมีส่วนร่วมในกระดานถามตอบ',
  },
  {
    id: '67010474',
    nameTh: 'ชนิกานต์ ประเสริฐกุล',
    hubId: 'assessment',
    courseNameTh: 'พื้นฐานการเรียนรู้ของเครื่อง',
    status: 'at-risk',
    avgScore: 62.0,
    progressPct: 54,
    weeklyHours: 3.8,
    quizzesPassed: 6,
    quizzesTotal: 12,
    lastActiveTh: '3 วันที่แล้ว',
    advisorNoteTh: 'คะแนนสอบกลางภาคต่ำกว่าเกณฑ์ แนะนำเข้าคลาสทบทวนเสริม',
  },
  {
    id: '67010488',
    nameTh: 'ศุภวิชญ์ เตชะไพบูลย์',
    hubId: 'stem',
    courseNameTh: 'โครงสร้างข้อมูลและอัลกอริทึม',
    status: 'on-track',
    avgScore: 83.4,
    progressPct: 86,
    weeklyHours: 8.9,
    quizzesPassed: 10,
    quizzesTotal: 12,
    lastActiveTh: '34 นาทีที่แล้ว',
    advisorNoteTh: 'ความก้าวหน้าคงที่ตามแผนการเรียนรายสัปดาห์',
  },
  {
    id: '67010492',
    nameTh: 'วริศรา บุญญฤทธิ์',
    hubId: 'advising',
    courseNameTh: 'การวางแผนอาชีพสายเทคโนโลยี',
    status: 'excellent',
    avgScore: 90.4,
    progressPct: 95,
    weeklyHours: 7.2,
    quizzesPassed: 8,
    quizzesTotal: 8,
    lastActiveTh: '19 นาทีที่แล้ว',
    advisorNoteTh: 'ผ่านเกณฑ์สมรรถนะครบทุกด้านและช่วยติวเพื่อนร่วมรุ่น',
  },
  {
    id: '67010506',
    nameTh: 'จิรภัทร อัศวเมธา',
    hubId: 'media',
    courseNameTh: 'การออกแบบประสบการณ์ผู้เรียน',
    status: 'at-risk',
    avgScore: 64.5,
    progressPct: 59,
    weeklyHours: 4.1,
    quizzesPassed: 6,
    quizzesTotal: 11,
    lastActiveTh: '2 วันที่แล้ว',
    advisorNoteTh: 'อัตราการรับชมวิดีโอลดลงในสัปดาห์ที่ 3 กำลังติดตามผล',
  },
  {
    id: '67010519',
    nameTh: 'พิชญาดา สุวรรณมาลี',
    hubId: 'workshop',
    courseNameTh: 'ปฏิบัติการสร้างแบบจำลอง 3 มิติ',
    status: 'on-track',
    avgScore: 84.2,
    progressPct: 82,
    weeklyHours: 9.5,
    quizzesPassed: 8,
    quizzesTotal: 10,
    lastActiveTh: '46 นาทีที่แล้ว',
    advisorNoteTh: 'ส่งชิ้นงานเวิร์กชอปครบถ้วนตรงตามกำหนดเวลา',
  },
  {
    id: '67010533',
    nameTh: 'อภิวิชญ์ ธรรมรักษ์',
    hubId: 'library',
    courseNameTh: 'การจัดการฐานข้อมูลสมัยใหม่',
    status: 'on-track',
    avgScore: 80.8,
    progressPct: 88,
    weeklyHours: 8.0,
    quizzesPassed: 10,
    quizzesTotal: 12,
    lastActiveTh: '52 นาทีที่แล้ว',
    advisorNoteTh: 'ใช้งานคลังแบบฝึกหัดทบทวนสม่ำเสมอในช่วงค่ำ',
  },
  {
    id: '67010547',
    nameTh: 'ลลิตา เจริญพงศ์',
    hubId: 'advising',
    courseNameTh: 'การวิเคราะห์พฤติกรรมการเรียน',
    status: 'on-track',
    avgScore: 86.0,
    progressPct: 89,
    weeklyHours: 6.9,
    quizzesPassed: 7,
    quizzesTotal: 8,
    lastActiveTh: '1 ชม. ที่แล้ว',
    advisorNoteTh: 'เข้าร่วมกิจกรรมแนะแนวและวางแผนการเรียนครบตามกำหนด',
  },
  {
    id: '67010562',
    nameTh: 'ภานุพงศ์ สิริโชติ',
    hubId: 'stem',
    courseNameTh: 'วิทยาการข้อมูลประยุกต์',
    status: 'at-risk',
    avgScore: 60.2,
    progressPct: 51,
    weeklyHours: 3.5,
    quizzesPassed: 6,
    quizzesTotal: 12,
    lastActiveTh: '5 วันที่แล้ว',
    advisorNoteTh: 'ไม่ได้เข้าสู่ระบบเกิน 4 วัน ส่งข้อความแจ้งเตือนอัตโนมัติแล้ว',
  },
  {
    id: '67010578',
    nameTh: 'นันท์นภัส พิทักษ์ธรรม',
    hubId: 'workshop',
    courseNameTh: 'โครงงานวิเคราะห์ข้อมูลการศึกษา',
    status: 'excellent',
    avgScore: 92.1,
    progressPct: 97,
    weeklyHours: 11.8,
    quizzesPassed: 10,
    quizzesTotal: 10,
    lastActiveTh: '5 นาทีที่แล้ว',
    advisorNoteTh: 'ผ่านการนำเสนอโครงงานรอบแรกด้วยคะแนนระดับดีเยี่ยม',
  },
];

export const LEARNING_ALERTS: LearningAlert[] = [
  {
    id: 'al-1',
    time: '14:15 น.',
    hubId: 'assessment',
    hubNameTh: 'ศูนย์ประเมินผลและแบบทดสอบ',
    severity: 'at-risk',
    messageTh: 'พบผู้เรียน 19 คนมีคะแนนแบบทดสอบบทที่ 4 ต่ำกว่า 65% ระบบจัดชุดแบบฝึกหัดเสริมให้อัตโนมัติ',
    metricNote: 'เฉลี่ย 74.6 คะแนน · กลุ่มเสี่ยง 19 คน',
  },
  {
    id: 'al-2',
    time: '13:30 น.',
    hubId: 'stem',
    hubNameTh: 'ศูนย์วิทยาการข้อมูลและ STEM',
    severity: 'excellent',
    messageTh: 'อัตราการส่งโครงงานวิทยาการข้อมูลสูงกว่าเป้าหมายประจำภาคเรียน (+6.4%)',
    metricNote: 'เรียนจบ 88.4% · เฉลี่ย 84.2 คะแนน',
  },
  {
    id: 'al-3',
    time: '11:45 น.',
    hubId: 'library',
    hubNameTh: 'คลังบทเรียนและห้องสมุดดิจิทัล',
    severity: 'excellent',
    messageTh: 'ผู้เรียนเข้าทบทวนชุดเอกสารสรุปก่อนสอบเพิ่มขึ้น 28% เทียบกับสัปดาห์ก่อนหน้า',
    metricNote: 'เรียนจบ 91.2% · 8.2 ชม./สัปดาห์',
  },
  {
    id: 'al-4',
    time: '10:20 น.',
    hubId: 'media',
    hubNameTh: 'สตูดิโอเรียนออนไลน์และวิดีโอ',
    severity: 'on-track',
    messageTh: 'อัตราการรับชมวิดีโอบทเรียนจนจบเฉลี่ยอยู่ที่ 82.5% สูงสุดในช่วงเวลา 19:00–21:00 น.',
    metricNote: 'เข้าเรียน 392 คน · เฉลี่ย 79.8 คะแนน',
  },
  {
    id: 'al-5',
    time: '09:10 น.',
    hubId: 'advising',
    hubNameTh: 'ศูนย์แนะแนวและติดตามผู้เรียน',
    severity: 'on-track',
    messageTh: 'อาจารย์ที่ปรึกษานัดติดตามผู้เรียนที่ขาดเรียนเกิน 3 วันครบ 100% ของรายการแจ้งเตือน',
    metricNote: 'ติดตามแล้ว 7 ราย · พร้อมดูแลต่อ',
  },
];
