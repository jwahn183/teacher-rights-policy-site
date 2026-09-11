import React, { useState } from "react";
import {
  LayoutDashboard, ShieldCheck, FileWarning, HeartHandshake, Building2, RotateCcw,
  BarChart3, BookOpen, ChevronRight, ChevronDown, X, ArrowRight, ArrowDown,
  CheckCircle2, Circle, AlertTriangle, Scale, Stethoscope, ClipboardList, UserCog,
  Users, School, Landmark, Phone, Siren, Clock, PlayCircle, Info, Check, ChevronLeft,
  FileText, Gavel, Brain, ShieldAlert, Home, TrendingUp, Search, Menu
} from "lucide-react";
 
/* =========================================================================
   MOCK DATA (모든 데이터는 가상의 예시입니다)
   ========================================================================= */
 
const NAV_ITEMS = [
  { id: "dashboard", label: "정책 대시보드", icon: LayoutDashboard },
  { id: "prevention", label: "사전예방", icon: ShieldCheck },
  { id: "case", label: "사안관리", icon: FileWarning },
  { id: "support", label: "통합지원", icon: HeartHandshake },
  { id: "return", label: "학교복귀", icon: Home },
  { id: "recurrence", label: "재발방지", icon: RotateCcw },
  { id: "stats", label: "통계·정책효과", icon: BarChart3 },
  { id: "info", label: "정책 안내", icon: BookOpen },
];
 
const CYCLE_STAGES = [
  { key: "prevent", label: "사전예방", icon: ShieldCheck,
    desc: "예방교육과 위험징후 인식을 통해 교권침해가 발생하기 전 단계에서 관리합니다." },
  { key: "occur", label: "사안발생", icon: FileWarning,
    desc: "사건 발생 시 교사 진술서 작성과 관리자 확인을 거쳐 사건번호가 생성됩니다." },
  { key: "assess", label: "심각도 평가", icon: Scale,
    desc: "모든 사건을 동일하게 처리하지 않고, 심각도에 따라 1~3단계로 구분합니다." },
  { key: "care", label: "통합지원", icon: HeartHandshake,
    desc: "심각도에 맞춰 법률·심리·행정 지원이 하나의 사건번호와 케이스매니저를 중심으로 연결됩니다." },
  { key: "return", label: "학교복귀", icon: Home,
    desc: "복귀설계서를 바탕으로 준비 단계를 거쳐 안전한 조건에서 학교로 복귀합니다." },
  { key: "recur", label: "재발방지", icon: RotateCcw,
    desc: "위험도 평가와 사후관리를 통해 재발 여부를 지속적으로 확인합니다." },
  { key: "settle", label: "안정적인 학교생활 정착", icon: CheckCircle2,
    desc: "사건 종결이 아니라 교원이 안정적으로 학교생활을 이어가는 것이 정책의 목표입니다." },
];
 
const DASHBOARD_METRICS = [
  { label: "전체 관리 사건", value: "128", unit: "건" },
  { label: "1단계 사건", value: "61", unit: "건" },
  { label: "2단계 사건", value: "44", unit: "건" },
  { label: "3단계 사건", value: "23", unit: "건" },
  { label: "현재 학교복귀 관리 교원", value: "17", unit: "명" },
  { label: "사후관리 중인 교원", value: "35", unit: "명" },
  { label: "고위험 관리 대상", value: "9", unit: "명" },
];
 
const MOCK_CASES = [
  { id: "CASE-2026-0017", teacher: "교사 A", type: "지속적 악성 민원 및 교육활동 방해", level: 2, status: "통합지원 진행중", date: "2026-03-04", manager: "김도현" },
  { id: "CASE-2026-0022", teacher: "교사 B", type: "수업 중 반복적 방해", level: 1, status: "모니터링", date: "2026-04-11", manager: "미배정" },
  { id: "CASE-2026-0009", teacher: "교사 C", type: "신체적 위협 및 협박", level: 3, status: "학교복귀 준비", date: "2026-01-20", manager: "이서연" },
];
 
const SEVERITY = {
  1: {
    label: "1단계", title: "초기 침해·위험 징후", color: "emerald",
    goal: "교권침해로 확대되기 전 조기 포착 및 관리",
    examples: ["수업 중 반복적 방해", "정당한 생활지도에 대한 반복적 불응", "경미한 언어적 무례", "단발성 민원 또는 갈등", "향후 교권침해로 확대될 가능성이 있는 초기 징후"],
    legal: { tag: "최소 지원", desc: "교육활동보호센터 온라인·전화 법률정보 안내" },
    psych: { tag: "최소 지원", desc: "교원의 자기결정에 따른 상담 신청" },
    admin: { tag: "최소 지원", desc: "사안 기록 및 관리자 공유 · 반복 여부 모니터링 · 케이스매니저 미배정" },
  },
  2: {
    label: "2단계", title: "명백한 교권침해 의심", color: "amber",
    goal: "학교 차원의 공식 대응으로 전환",
    examples: ["반복적인 수업 방해", "수업 진행이 어려운 수준의 방해", "교사에 대한 모욕·명예훼손성 발언", "지속적 악성 민원", "정당한 교육활동에 대한 반복적인 간섭", "피해 교사가 교육활동 지속에 부담을 느끼는 경우"],
    legal: { tag: "기본 지원", desc: "변호사 1회 이상 상담 · 신고서·의견서 작성 지원 · 지역교권보호위원회 신청 여부 검토" },
    psych: { tag: "기본 지원", desc: "전문상담사 배정 · 초기 심리상태 평가 · 필요시 상담 연장 또는 의료기관 연계" },
    admin: { tag: "기본 지원", desc: "케이스매니저 배정 · 통합 사건번호 부여 · 법률·심리 담당자 간 정보공유 · 민원창구 일원화" },
  },
  3: {
    label: "3단계", title: "중대·긴급 침해", color: "rose",
    goal: "피해 교원의 안전 확보 및 즉각적인 전문지원 연결",
    examples: ["폭행", "상해", "협박", "성희롱·성폭력성 사안", "심각한 명예훼손·무고", "불법 촬영·녹음·합성물 유포", "교육활동 지속이 불가능할 정도의 반복적 악성 민원", "피해 교원의 신체적·정신적 안전이 위협받는 경우"],
    legal: { tag: "최대 지원 · 전담 변호사 1:1 배치", desc: "초기 상담 → 의견서 작성 → 경찰·검찰 조사 동행 → 교보위 대응 → 소송 지원 → 손해배상·교원보호공제 등 지원" },
    psych: { tag: "최대 지원", desc: "즉시 심리평가 → 전문심리치료 → 의료기관 연계 → 특별휴가·병가 안내 → 학교복귀 전후 장기 모니터링" },
    admin: { tag: "전담 지원 · 케이스매니저 원스톱 관리", desc: "법률·심리·행정 정보 통합 · 증빙서류 관리 · 신청 절차 지원 · 관련 기관 연계 · 학교복귀 지원 · 재발방지 단계까지 동일 케이스매니저가 관리" },
  },
};
 
const MATRIX_ROWS = [
  { key: "legal", label: "법률", icon: Gavel },
  { key: "psych", label: "심리", icon: Brain },
  { key: "admin", label: "행정", icon: ClipboardList },
];
const MATRIX_SHORT = {
  legal: { 1: "정보 제공", 2: "변호사 초기상담", 3: "전담 변호사 1:1" },
  psych: { 1: "자기결정형 상담", 2: "전문상담사 배정", 3: "즉시 치료·의료기관 연계" },
  admin: { 1: "기록·모니터링", 2: "케이스매니저 배정", 3: "원스톱 전담 관리" },
};
 
const TF_ROLES = [
  { label: "전담 변호사", icon: Gavel },
  { label: "전문 상담사", icon: Brain },
  { label: "학교 관리자", icon: School },
  { label: "교육지원청 담당자", icon: Landmark },
  { label: "교육청 담당자", icon: Building2 },
  { label: "의료기관 (필요시)", icon: Stethoscope },
  { label: "경찰·수사기관 (필요시)", icon: ShieldAlert },
  { label: "기타 외부 전문가", icon: Users },
];
 
const CASE_FILE_TABS = [
  { key: "record", label: "사건 기록", text: "발생일 2026-03-04, 발생 장소 3학년 2반 교실. 지속적인 악성 민원 및 교육활동 방해가 반복적으로 발생하여 접수됨." },
  { key: "statement", label: "진술서", text: "피해 교원 진술서 및 관계자 확인서가 시스템에 첨부되어 있습니다. (예시 자료)" },
  { key: "evidence", label: "증거자료", text: "민원 녹취록, 문자메시지 캡처, 수업방해 기록지 등 3건의 증거자료가 등록되어 있습니다." },
  { key: "legal", label: "법률지원", text: "전담 변호사 배정 완료. 신고서·의견서 작성 지원 진행 중, 지역교권보호위원회 신청 검토 단계." },
  { key: "psych", label: "심리상담", text: "전문상담사 배정 완료. 초기 심리상태 평가 결과에 따라 격주 상담 진행 중." },
  { key: "admin", label: "행정지원", text: "민원창구 일원화 완료. 법률·심리 담당자 간 정보공유 회의가 격주로 운영됩니다." },
  { key: "committee", label: "교보위 진행", text: "지역교권보호위원회 신청 여부 검토 중이며, 결과에 따라 조치 절차가 이어집니다." },
  { key: "returnplan", label: "학교복귀계획", text: "복귀설계서 작성 예정. 담임 여부, 접촉 가능성, 지원인력 필요 여부를 검토합니다." },
  { key: "followup", label: "사후관리", text: "학교복귀 이후 3개월간 단계적 사후관리 계획이 이 사건번호에 연결되어 관리됩니다." },
  { key: "recur", label: "재발 여부", text: "현재까지 재발 신고 없음. 위험도 평가는 사후관리 단계에서 주기적으로 갱신됩니다." },
];
 
const PRE_RETURN_TEACHER_OPTIONS = ["동일 학급", "타 학급", "비담임", "부분적 업무", "업무 조정 필요", "민원 대응 창구 지정", "지원인력 필요"];
const PRE_RETURN_SCHOOL_CHECK = ["시간표", "인력", "공간", "학생 배치", "가해 학생 조치 현황", "접촉 가능성"];
 
const RETURN_PHASE1 = ["부분적 업무 개시", "수업 업무 우선", "행정·담임 업무 단계적 확대", "가해자와 분리", "직접 대면 최소화", "정기 관리자 면담", "심리상태 확인"];
const RETURN_PHASE2 = ["복귀설계서 갱신", "업무 범위 조정", "학생·학부모 관계 확인", "민원 상황 확인", "월 1회 피드백", "상담 지속 여부 결정"];
const RETURN_PHASE3 = ["업무 범위 점진적 확대", "관계 회복 여부 확인", "재침해 여부 모니터링", "상담 주기 완화", "추가 지원 필요성 평가"];
 
const TEACHER_RIGHTS = ["상담 신청", "상담 연장", "상담 거부", "특정 관계개선 프로그램 거부", "업무 확대 요청", "업무 확대 보류", "직접 접촉 선택", "직접 접촉 거부"];
 
const RISK_LEVELS = {
  "매우 높음": { period: "6개월 이상 집중관리", level: "전담 케이스매니저 + 전문기관 연계", manager: "케이스매니저 + 전담 변호사 + 전문상담사", protect: "가해자 분리 · 출입 제한 검토 · 즉시 보호조치" },
  "높음": { period: "6개월 사후관리", level: "케이스매니저 중심 관리", manager: "케이스매니저 + 전문상담사", protect: "접촉 최소화 · 정기 모니터링 강화" },
  "보통": { period: "3개월 사후관리", level: "학교 + 교육지원청 공동 관리", manager: "학교 관리자 + 상담사(필요시)", protect: "정기 확인 · 민원 모니터링" },
  "낮음": { period: "3개월 기본관리 후 종결 검토", level: "학교 차원 관리", manager: "학교 관리자", protect: "기본 모니터링" },
};
const RISK_CRITERIA = ["침해행위의 심각성", "반복 가능성", "학생·보호자의 태도", "피해 교원의 안전 상태", "심리적 상태", "기존 침해 이력"];
 
const FOLLOWUP_ITEMS = ["피해 교원 안전 확인", "심리상태 확인", "추가 민원 모니터링", "추가 교권침해 여부 확인", "학생·보호자 상담", "특별교육", "관계 회복 교육", "학교 차원의 기록 관리"];
 
const RECURRENCE_ACTIONS = ["교육지원청 보고", "피해 교원과 침해행위자 분리", "필요시 출입 제한", "전문기관 연계", "심리치료 강화", "학교·교육지원청의 민원 직접 대응", "교육활동보호센터 등 관련 기관 연계", "사건 기록 갱신", "위험도 재평가"];
 
const RECUR_CYCLE = ["위험도 평가", "맞춤형 사후관리", "행동 변화·재발 여부 확인", "재발 시 기관 차원의 강화 대응"];
 
const SIM_STEPS = [
  { title: "사건 발생", actor: "교사 A", support: [], desc: "반복적인 악성 민원과 지속적인 교육활동 방해가 발생하여 신고가 접수되었습니다." },
  { title: "진술서 작성", actor: "교사 A / 관리자 확인", support: [], desc: "피해 교원이 진술서를 작성하고 관리자가 내용을 확인합니다." },
  { title: "관리자·관리감독관 확인", actor: "학교 관리자", support: [], desc: "관리자 확인을 거쳐 통합 사건번호 CASE-2026-0017이 생성됩니다." },
  { title: "심각도 평가", actor: "심각도 평가 담당자", support: ["행정"], desc: "사건의 심각성과 긴급성을 기준으로 심각도 평가가 시작됩니다." },
  { title: "2단계 판정", actor: "심각도 평가 담당자", support: ["행정"], desc: "평가 결과 '명백한 교권침해 의심' 2단계로 판정되어 학교 차원의 공식 대응으로 전환됩니다." },
  { title: "케이스매니저 배정", actor: "Case Manager 김도현", support: ["행정"], desc: "통합 사건번호를 중심으로 전담 케이스매니저가 배정됩니다." },
  { title: "변호사 상담", actor: "전담 변호사", support: ["법률", "행정"], desc: "변호사 상담을 통해 신고서·의견서 작성을 지원하고 지역교권보호위원회 신청 여부를 검토합니다." },
  { title: "심리평가", actor: "전문 상담사", support: ["심리", "행정"], desc: "전문상담사가 배정되어 초기 심리상태를 평가합니다." },
  { title: "행정지원", actor: "Case Manager 김도현", support: ["법률", "심리", "행정"], desc: "민원창구가 일원화되고 법률·심리 담당자 간 정보가 공유됩니다." },
  { title: "복귀설계서 작성", actor: "교사 A", support: ["행정"], desc: "교사가 직접 복귀 조건을 선택하고 학교가 시간표·인력·공간을 검토합니다." },
  { title: "학교복귀", actor: "교사 A / 학교", support: ["행정"], desc: "부분적 업무부터 시작하여 가해자와 분리된 환경에서 복귀가 진행됩니다." },
  { title: "3개월 사후관리", actor: "Case Manager 김도현", support: ["심리", "행정"], desc: "월 1회 피드백을 통해 업무 범위를 점진적으로 확대하며 관계 회복 여부를 확인합니다." },
  { title: "위험도 평가", actor: "Case Manager 김도현", support: ["행정"], desc: "재발 위험도를 '보통'으로 평가하고 3개월 기본 사후관리를 진행합니다." },
  { title: "안정화 완료", actor: "교사 A", support: [], desc: "교사 A가 안정적으로 학교생활에 정착하였습니다. 필요시 언제든 다시 지원이 연결됩니다." },
];
 
const FIVE_W_1_H = [
  { label: "WHO", value: "교육부 / 시·도교육청 / 교육지원청 / 학교 / 외부전문가" },
  { label: "책임 주체", value: "Case Manager 중심 전담 TF" },
  { label: "WHEN", value: "사전예방 → 사건발생 → 복귀 → 3개월 사후관리 → 재발" },
  { label: "WHERE", value: "학교 → 교육지원청 → 외부 전문기관" },
  { label: "WHAT", value: "법률 / 심리 / 행정 / 복귀 / 재발방지" },
  { label: "HOW", value: "심각도 1~3단계에 따른 차등지원" },
  { label: "WHY", value: "피해 교원이 여러 기관을 개별적으로 찾아다니는 부담을 줄이고, 사건 발생부터 학교생활 정착까지 지속적인 지원을 제공하기 위해" },
];
 
const EXAMPLE_KPI = [
  { label: "피해교원 지원 접근성", value: "92%" },
  { label: "초기 법률지원 연결률", value: "88%" },
  { label: "심리상담 연계율", value: "95%" },
  { label: "학교복귀 완료율", value: "81%" },
  { label: "복귀 후 3개월 관리 완료율", value: "77%" },
  { label: "재발 사건 발생률", value: "6%" },
  { label: "교사 학교생활 안정도", value: "84%" },
];
const KPI_BAR = [
  { name: "1단계", value: 61 },
  { name: "2단계", value: 44 },
  { name: "3단계", value: 23 },
];
const KPI_LINE = [
  { month: "1월", rate: 62 }, { month: "2월", rate: 66 }, { month: "3월", rate: 71 },
  { month: "4월", rate: 74 }, { month: "5월", rate: 79 }, { month: "6월", rate: 81 },
];
 
const PREVENTION_PROGRAMS = [
  { title: "교권침해 예방교육", desc: "전 교직원 대상 정기 예방교육을 통해 교권침해에 대한 공동 인식을 형성합니다." },
  { title: "학생 대상 교육", desc: "학생 발달 단계에 맞춘 교권 존중 교육을 학기별로 운영합니다." },
  { title: "학부모 대상 안내", desc: "입학 및 학기 초 학부모 대상 교육활동 보호 안내를 배포합니다." },
  { title: "교원 대상 대응교육", desc: "초기 대응 요령과 기록·보고 절차에 대한 실습형 교육을 제공합니다." },
  { title: "교권침해 초기 위험징후 인식", desc: "확대되기 전 단계의 징후를 조기에 포착하는 체크리스트를 활용합니다." },
];
 
/* =========================================================================
   작은 UI 컴포넌트
   ========================================================================= */
 
const COLOR_MAP = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", dot: "bg-emerald-500", solid: "bg-emerald-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", dot: "bg-amber-500", solid: "bg-amber-600" },
  rose: { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", dot: "bg-rose-500", solid: "bg-rose-600" },
};
 
function MockTag({ children = "예시 데이터" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
      {children}
    </span>
  );
}
 
function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="mb-5">
      {eyebrow && <div className="text-xs font-semibold tracking-wide text-blue-800 mb-1">{eyebrow}</div>}
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {desc && <p className="mt-1 text-sm text-slate-500 leading-relaxed">{desc}</p>}
    </div>
  );
}
 
function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-md border border-slate-200 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}
 
function LevelPill({ level }) {
  const c = COLOR_MAP[SEVERITY[level].color];
  return (
    <span className={`inline-flex items-center gap-1 rounded-sm border ${c.border} ${c.bg} ${c.text} px-2 py-0.5 text-xs font-semibold`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {SEVERITY[level].label}
    </span>
  );
}
 
function CaseIdTag({ id }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-slate-900 px-2 py-0.5 font-mono text-xs font-medium text-white">
      {id}
    </span>
  );
}
 
function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700"
      }`}
    >
      {active ? <Check size={13} /> : <Circle size={13} className="text-slate-300" />}
      {children}
    </button>
  );
}
 
/* =========================================================================
   대시보드
   ========================================================================= */
 
function DashboardPage({ onStartSimulation }) {
  const [stage, setStage] = useState(3);
  const s = CYCLE_STAGES[stage];
 
  return (
    <div>
      <SectionTitle
        eyebrow="POLICY DASHBOARD"
        title="교권침해 피해교원 통합지원 Dashboard"
        desc="사건 처리 중심의 대응을 피해교원의 회복과 학교생활 정착까지 연결되는 통합지원 체계로 전환합니다."
      />
 
      <div className="grid grid-cols-4 gap-3 mb-6">
        {DASHBOARD_METRICS.map((m) => (
          <div key={m.label} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{m.label}</span>
              <MockTag />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {m.value}<span className="ml-1 text-sm font-medium text-slate-400">{m.unit}</span>
            </div>
          </div>
        ))}
        <button
          onClick={onStartSimulation}
          className="rounded-md border border-blue-700 bg-blue-800 p-4 text-left text-white hover:bg-blue-900 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-100">실제 사건 처리 과정 보기</span>
            <PlayCircle size={16} />
          </div>
          <div className="mt-2 text-sm font-bold leading-snug">사건 시뮬레이션 시작</div>
        </button>
      </div>
 
      <Panel className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">정책 전체 Cycle — 사전예방부터 학교생활 정착까지</h3>
          <span className="text-xs text-slate-400">단계를 클릭하면 상세 내용이 표시됩니다</span>
        </div>
        <div className="flex items-stretch overflow-x-auto pb-2">
          {CYCLE_STAGES.map((st, i) => {
            const Icon = st.icon;
            const active = i === stage;
            return (
              <React.Fragment key={st.key}>
                <button
                  onClick={() => setStage(i)}
                  className={`flex min-w-[110px] flex-col items-center gap-2 rounded-md border px-3 py-3 text-center transition-colors ${
                    active ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Icon size={17} />
                  </div>
                  <span className={`text-xs font-semibold leading-tight ${active ? "text-blue-800" : "text-slate-600"}`}>{st.label}</span>
                </button>
                {i < CYCLE_STAGES.length - 1 && (
                  <div className="flex items-center px-1 text-slate-300">
                    <ChevronRight size={18} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <s.icon size={16} /> {s.label}
          </div>
          <p className="mt-1 text-sm text-blue-900/80 leading-relaxed">{s.desc}</p>
        </div>
      </Panel>
 
      <Panel className="mb-6">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
          "교권침해 대응을 사건 처리 중심에서 피해교원의 회복과 학교생활 정착까지 연결되는 통합지원 체계로 전환한다."
        </p>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          사안의 심각도에 따라 대응 수준을 달리하고, 하나의 사건번호와 전담 케이스매니저를 중심으로 법률·심리·행정지원부터 학교복귀와 재발방지까지 연속적으로 관리합니다.
        </p>
      </Panel>
 
      <div className="rounded-md border border-slate-300 bg-slate-900 p-8 text-center text-white">
        <p className="text-lg font-bold leading-snug">사건을 처리하는 것에서 끝나지 않습니다.</p>
        <p className="mt-1 text-sm text-slate-300 leading-relaxed">
          피해 교원이 다시 안전하게 학교로 돌아가고, 안정적으로 학교생활을 이어갈 때까지 지원합니다.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1 text-xs text-slate-300">
          {["사전예방", "사안발생", "심각도 평가", "통합지원", "학교복귀", "재발방지", "학교생활 정착", "필요시 다시 지원"].map((t, i, arr) => (
            <React.Fragment key={t}>
              <span className="rounded-sm border border-slate-600 px-2 py-1">{t}</span>
              {i < arr.length - 1 && <ArrowRight size={12} className="text-slate-500" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
 
/* =========================================================================
   사전예방
   ========================================================================= */
 
function PreventionPage() {
  const [showPlan, setShowPlan] = useState(false);
  return (
    <div>
      <SectionTitle eyebrow="STEP 1 · 사전예방" title="예방교육 프로그램" desc="교권침해가 발생하기 전, 위험 징후를 발견하고 예방하는 단계입니다." />
      <div className="grid grid-cols-2 gap-4 mb-6">
        {PREVENTION_PROGRAMS.map((p) => (
          <Panel key={p.title}>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <ShieldCheck size={16} className="text-blue-700" /> {p.title}
            </div>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{p.desc}</p>
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">교원 대응교육 · 수업계획서</h3>
            <p className="mt-1 text-xs text-slate-500">예방교육에 활용되는 수업계획서 자료를 확인할 수 있습니다.</p>
          </div>
          <button
            onClick={() => setShowPlan((v) => !v)}
            className="rounded-sm border border-blue-700 bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900"
          >
            수업계획서 보기
          </button>
        </div>
        {showPlan && (
          <div className="mt-4 flex h-56 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            [수업계획서 이미지 삽입 영역]
          </div>
        )}
      </Panel>
    </div>
  );
}
 
/* =========================================================================
   사안관리
   ========================================================================= */
 
function NewCaseForm({ onStart }) {
  const fields = [
    ["사건번호", "CASE-2026-0017 (자동 생성)"],
    ["발생일", "2026-03-04"],
    ["발생 장소", "3학년 2반 교실"],
    ["사건 유형", "지속적 악성 민원 및 교육활동 방해"],
    ["피해 교원", "교사 A"],
    ["관련 학생", "학생 A"],
    ["관련 보호자", "보호자 A"],
    ["교사 진술서", "첨부됨 (1건)"],
    ["증거자료", "첨부됨 (3건)"],
    ["긴급성", "중간"],
    ["관리자 확인", "확인 완료 (학교 관리자)"],
  ];
  return (
    <Panel>
      <h3 className="mb-4 text-sm font-bold text-slate-800">신규 사건 등록</h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-0 rounded-md border border-slate-200 overflow-hidden">
        {fields.map(([label, value], i) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
            <span className="w-24 shrink-0 text-xs font-semibold text-slate-500">{label}</span>
            <span className="text-slate-800">{value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onStart}
        className="mt-4 flex items-center gap-1.5 rounded-sm border border-blue-700 bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900"
      >
        <Scale size={14} /> 심각도 평가 시작
      </button>
    </Panel>
  );
}
 
function SeverityAssessment() {
  const [caseId, setCaseId] = useState(MOCK_CASES[0].id);
  const [level, setLevel] = useState(2);
  const c = COLOR_MAP[SEVERITY[level].color];
 
  return (
    <div>
      <Panel className="mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-xs font-semibold text-slate-500">평가 대상 사건</label>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="rounded-sm border border-slate-300 px-2 py-1.5 text-sm text-slate-700"
          >
            {MOCK_CASES.map((c2) => (
              <option key={c2.id} value={c2.id}>{c2.id} · {c2.teacher} · {c2.type}</option>
            ))}
          </select>
          <div className="ml-auto flex gap-2">
            {[1, 2, 3].map((lv) => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-semibold ${
                  level === lv ? `border-blue-700 bg-blue-700 text-white` : "border-slate-300 text-slate-600 hover:border-blue-400"
                }`}
              >
                {SEVERITY[lv].label}
              </button>
            ))}
          </div>
        </div>
      </Panel>
 
      <Panel className={`border-l-4 ${c.border}`}>
        <div className="flex items-center gap-2">
          <LevelPill level={level} />
          <h3 className="text-base font-bold text-slate-900">{SEVERITY[level].title}</h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">목적: {SEVERITY[level].goal}</p>
 
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 mb-1.5">해당 사례 예시</div>
          <div className="flex flex-wrap gap-1.5">
            {SEVERITY[level].examples.map((ex) => (
              <span key={ex} className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">{ex}</span>
            ))}
          </div>
        </div>
 
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { key: "legal", label: "법률", icon: Gavel, d: SEVERITY[level].legal },
            { key: "psych", label: "심리", icon: Brain, d: SEVERITY[level].psych },
            { key: "admin", label: "행정", icon: ClipboardList, d: SEVERITY[level].admin },
          ].map((row) => (
            <div key={row.key} className={`rounded-md border ${c.border} ${c.bg} p-3`}>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${c.text}`}>
                <row.icon size={14} /> {row.label}
              </div>
              <div className={`mt-1 text-[11px] font-semibold ${c.text}`}>{row.d.tag}</div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{row.d.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
 
function SeverityMatrix() {
  const [sel, setSel] = useState({ row: "admin", col: 2 });
  return (
    <div>
      <Panel className="mb-4">
        <p className="text-sm font-semibold text-slate-800">"심각도가 높아질수록 전문가 개입과 지원의 밀도가 높아진다."</p>
      </Panel>
      <Panel>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-28 border border-slate-200 bg-slate-50 p-2 text-xs text-slate-500"></th>
              {[1, 2, 3].map((lv) => (
                <th key={lv} className="border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-600">{SEVERITY[lv].label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map((row) => (
              <tr key={row.key}>
                <td className="border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5"><row.icon size={13} /> {row.label}</div>
                </td>
                {[1, 2, 3].map((lv) => {
                  const active = sel.row === row.key && sel.col === lv;
                  const c = COLOR_MAP[SEVERITY[lv].color];
                  return (
                    <td
                      key={lv}
                      onClick={() => setSel({ row: row.key, col: lv })}
                      className={`cursor-pointer border border-slate-200 p-3 text-center text-xs font-medium transition-colors ${
                        active ? `${c.bg} ${c.text} font-bold` : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {MATRIX_SHORT[row.key][lv]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`mt-4 rounded-md border ${COLOR_MAP[SEVERITY[sel.col].color].border} ${COLOR_MAP[SEVERITY[sel.col].color].bg} p-4`}>
          <div className="text-xs font-bold text-slate-700 mb-1">
            {MATRIX_ROWS.find((r) => r.key === sel.row).label} · {SEVERITY[sel.col].label}
          </div>
          <p className="text-sm text-slate-700">{SEVERITY[sel.col][sel.row].desc}</p>
        </div>
      </Panel>
    </div>
  );
}
 
function CaseManagementPage() {
  const [tab, setTab] = useState("register");
  const tabs = [
    { key: "register", label: "신규 사건 등록" },
    { key: "assess", label: "심각도 평가" },
    { key: "matrix", label: "심각도별 지원 비교" },
  ];
  return (
    <div>
      <SectionTitle eyebrow="STEP 2 · 사안관리" title="사건 접수 · 심각도 평가 · 사건번호 관리" desc="사건 발생 → 교사 진술서 작성 → 관리자 확인 → 사건번호 생성 → 심각도 평가 순으로 진행됩니다." />
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              tab === t.key ? "border-blue-700 text-blue-800" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "register" && <NewCaseForm onStart={() => setTab("assess")} />}
      {tab === "assess" && <SeverityAssessment />}
      {tab === "matrix" && <SeverityMatrix />}
    </div>
  );
}
 
/* =========================================================================
   통합지원
   ========================================================================= */
 
function TFOrgChart() {
  const chain = ["교육부", "시·도교육청", "교육지원청", "학교", "통합지원 TF"];
  return (
    <Panel>
      <h3 className="mb-4 text-sm font-bold text-slate-800">교권피해 통합지원 체계 조직도</h3>
      <div className="flex flex-col items-center gap-1 mb-2">
        {chain.map((c, i) => (
          <React.Fragment key={c}>
            <div className="rounded-sm border border-slate-300 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700">{c}</div>
            {i < chain.length - 1 && <ArrowDown size={14} className="text-slate-300" />}
          </React.Fragment>
        ))}
        <ArrowDown size={14} className="text-slate-300" />
        <div className="rounded-md border-2 border-blue-700 bg-blue-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm">
          CASE MANAGER
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {TF_ROLES.map((r) => (
          <div key={r.label} className="flex flex-col items-center gap-2 rounded-md border border-slate-200 bg-white p-3 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <r.icon size={15} />
            </div>
            <span className="text-xs font-medium text-slate-600 leading-tight">{r.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        하나의 사건을 중심으로 여러 전문가가 Case Manager와 연결되어 법률·심리·행정을 통합적으로 지원합니다.
      </p>
    </Panel>
  );
}
 
function CaseNumberIntegration() {
  const [tab, setTab] = useState("record");
  const active = CASE_FILE_TABS.find((t) => t.key === tab);
  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CaseIdTag id="CASE-2026-0017" />
          <span className="text-sm font-semibold text-slate-700">교사 A · 지속적 악성 민원 및 교육활동 방해</span>
        </div>
        <LevelPill level={2} />
      </div>
      <p className="mb-4 text-xs text-slate-500 leading-relaxed">
        피해 교원이 여러 기관을 직접 찾아다니는 것이 아니라 하나의 사건번호와 케이스매니저를 중심으로 지원이 연결됩니다.
      </p>
      <div className="flex flex-wrap gap-1 mb-4">
        {CASE_FILE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-sm border px-2.5 py-1 text-xs font-medium ${
              tab === t.key ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-600 hover:border-blue-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
        {active.text}
      </div>
    </Panel>
  );
}
 
function IntegratedSupportPage() {
  const [tab, setTab] = useState("tf");
  return (
    <div>
      <SectionTitle eyebrow="STEP 3 · 통합지원" title="법률·심리·행정 통합지원" desc="법률·심리·행정을 하나의 사건으로 연결하는 Case Manager 중심 체계입니다." />
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {[{ key: "tf", label: "통합지원 TF 구조" }, { key: "case", label: "사건번호 기반 통합관리" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              tab === t.key ? "border-blue-700 text-blue-800" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "tf" ? <TFOrgChart /> : <CaseNumberIntegration />}
    </div>
  );
}
 
/* =========================================================================
   학교복귀
   ========================================================================= */
 
function ReturnPage() {
  const [tab, setTab] = useState("pre");
  const [selected, setSelected] = useState(["부분적 업무", "민원 대응 창구 지정"]);
  const [rights, setRights] = useState(["상담 신청", "직접 접촉 거부"]);
 
  const toggle = (arr, setArr, item) =>
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
 
  return (
    <div>
      <SectionTitle eyebrow="STEP 4 · 학교복귀" title="준비 → 적응 → 안정화" desc="학교복귀는 '복직' 버튼 하나로 끝나는 과정이 아니라 단계적인 과정입니다." />
 
      <div className="mb-5 flex items-center gap-1">
        {[{ key: "pre", label: "복귀 전 2~4주" }, { key: "m1", label: "복귀 후 1개월" }, { key: "m3", label: "복귀 후 3개월 집중관리" }].map((t, i, arr) => (
          <React.Fragment key={t.key}>
            <button
              onClick={() => setTab(t.key)}
              className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                tab === t.key ? "border-blue-700 bg-blue-800 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-blue-400"
              }`}
            >
              {t.label}
            </button>
            {i < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
          </React.Fragment>
        ))}
      </div>
 
      {tab === "pre" && (
        <div className="grid grid-cols-2 gap-4">
          <Panel>
            <h3 className="mb-1 text-sm font-bold text-slate-800">복귀설계서 — 교사 선택 항목</h3>
            <p className="mb-3 text-xs text-slate-500">안전한 복귀 조건을 교사가 직접 선택합니다.</p>
            <div className="flex flex-wrap gap-2">
              {PRE_RETURN_TEACHER_OPTIONS.map((o) => (
                <Chip key={o} active={selected.includes(o)} onClick={() => toggle(selected, setSelected, o)}>{o}</Chip>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-1 text-sm font-bold text-slate-800">학교 검토사항</h3>
            <p className="mb-3 text-xs text-slate-500">교사의 선택을 바탕으로 학교가 다음을 검토합니다.</p>
            <div className="space-y-2">
              {PRE_RETURN_SCHOOL_CHECK.map((c) => (
                <div key={c} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-600" /> {c}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
 
      {tab === "m1" && (
        <Panel>
          <h3 className="mb-1 text-sm font-bold text-slate-800">복귀 후 1개월 이내 관리</h3>
          <p className="mb-3 text-xs text-slate-500">복귀설계서를 갱신하고 업무 범위와 관계를 확인합니다.</p>
          <div className="grid grid-cols-2 gap-2">
            {RETURN_PHASE2.map((c) => (
              <div key={c} className="flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Clock size={14} className="text-blue-700" /> {c}
              </div>
            ))}
          </div>
        </Panel>
      )}
 
      {tab === "m3" && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { title: "복귀 직후", items: RETURN_PHASE1 },
              { title: "1개월 이내", items: RETURN_PHASE2 },
              { title: "1~3개월", items: RETURN_PHASE3 },
            ].map((phase) => (
              <Panel key={phase.title}>
                <h4 className="mb-2 text-xs font-bold text-blue-800">{phase.title}</h4>
                <ul className="space-y-1.5">
                  {phase.items.map((it) => (
                    <li key={it} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" /> {it}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
 
          <Panel className="border-l-4 border-blue-700">
            <p className="text-sm font-bold text-blue-900">"교사가 회복 속도를 결정한다."</p>
            <p className="mt-1 text-xs text-slate-500">교원의 자기결정권과 거부권을 보장합니다. 아래 항목을 직접 선택해 보세요.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEACHER_RIGHTS.map((r) => (
                <Chip key={r} active={rights.includes(r)} onClick={() => toggle(rights, setRights, r)}>{r}</Chip>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
 
/* =========================================================================
   재발방지
   ========================================================================= */
 
function RecurrenceCycle() {
  return (
    <Panel className="mb-4">
      <h3 className="mb-4 text-sm font-bold text-slate-800">재발방지 순환 구조</h3>
      <div className="flex flex-wrap items-center gap-2">
        {RECUR_CYCLE.map((step, i) => (
          <React.Fragment key={step}>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">{step}</div>
            <ArrowRight size={14} className="text-slate-300" />
          </React.Fragment>
        ))}
        <div className="flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
          <RotateCcw size={13} /> 다시 위험도 평가에 반영
        </div>
      </div>
    </Panel>
  );
}
 
function RiskAssessment() {
  const [risk, setRisk] = useState("보통");
  const r = RISK_LEVELS[risk];
  const riskColor = { "매우 높음": "rose", "높음": "amber", "보통": "blue", "낮음": "emerald" };
  return (
    <Panel className="mb-4">
      <h3 className="mb-1 text-sm font-bold text-slate-800">사건 종결 직후 — 재발 위험도 평가</h3>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {RISK_CRITERIA.map((c) => (
          <span key={c} className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">{c}</span>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {Object.keys(RISK_LEVELS).map((lv) => (
          <button
            key={lv}
            onClick={() => setRisk(lv)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-semibold ${
              risk === lv ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-600 hover:border-blue-400"
            }`}
          >
            {lv}
          </button>
        ))}
      </div>
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <div className="text-xs font-bold text-blue-900 mb-2">위험도 "{risk}" — 자동 제안된 관리 방안</div>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div><div className="font-semibold text-slate-500 mb-1">사후관리 기간</div><div className="text-slate-800">{r.period}</div></div>
          <div><div className="font-semibold text-slate-500 mb-1">관리 수준</div><div className="text-slate-800">{r.level}</div></div>
          <div><div className="font-semibold text-slate-500 mb-1">담당자</div><div className="text-slate-800">{r.manager}</div></div>
          <div><div className="font-semibold text-slate-500 mb-1">보호조치</div><div className="text-slate-800">{r.protect}</div></div>
        </div>
      </div>
    </Panel>
  );
}
 
function FollowUpAndRecurrence() {
  const [detected, setDetected] = useState(false);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel>
        <h3 className="mb-1 text-sm font-bold text-slate-800">사후관리 (기본 3개월 · 고위험 6개월 이상)</h3>
        <p className="mb-3 text-xs text-slate-500">상담 횟수가 아니라 실제 행동 변화와 재발 여부 확인이 핵심입니다.</p>
        <div className="grid grid-cols-2 gap-2">
          {FOLLOWUP_ITEMS.map((it) => (
            <div key={it} className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              <CheckCircle2 size={13} className="text-emerald-600" /> {it}
            </div>
          ))}
        </div>
      </Panel>
 
      <Panel>
        <h3 className="mb-1 text-sm font-bold text-slate-800">재발 상황 시뮬레이션</h3>
        <p className="mb-3 text-xs text-slate-500">재발이 감지되면 기관 차원의 강화 대응이 즉시 실행됩니다.</p>
        {!detected ? (
          <button
            onClick={() => setDetected(true)}
            className="flex items-center gap-1.5 rounded-sm border border-rose-600 bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
          >
            <Siren size={14} /> 재발 사건 시뮬레이션 실행
          </button>
        ) : (
          <div className="rounded-md border border-rose-300 bg-rose-50 p-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-rose-700">
              <AlertTriangle size={15} /> 재발 사건 감지 — 기관 차원의 강화 대응 필요
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-600">
              <CaseIdTag id="CASE-2026-0017" /> 에 재발 사건이 연결되었습니다.
            </div>
            <ol className="mt-3 space-y-1.5">
              {RECURRENCE_ACTIONS.map((a, i) => (
                <li key={a} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">{i + 1}</span>
                  {a}
                </li>
              ))}
            </ol>
            <button
              onClick={() => setDetected(false)}
              className="mt-3 text-xs font-medium text-slate-500 underline hover:text-slate-700"
            >
              초기화
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
 
function RecurrencePage() {
  return (
    <div>
      <SectionTitle eyebrow="STEP 5 · 재발방지" title="위험도 평가 → 사후관리 → 재발 대응" desc="사건 종결이 지원의 끝이 아닙니다. 재발방지는 하나로 연결된 유기적인 관리 과정입니다." />
      <RecurrenceCycle />
      <RiskAssessment />
      <FollowUpAndRecurrence />
    </div>
  );
}
 
/* =========================================================================
   통계·정책효과
   ========================================================================= */
 
function BarChartSimple({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-6 h-40 px-2">
      {data.map((d) => (
        <div key={d.name} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-sm bg-blue-700"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600">{d.name}</span>
          <span className="text-xs text-slate-400">{d.value}건</span>
        </div>
      ))}
    </div>
  );
}
 
function LineChartSimple({ data }) {
  const w = 480, h = 140, pad = 24;
  const max = Math.max(...data.map((d) => d.rate));
  const min = Math.min(...data.map((d) => d.rate));
  const pts = data.map((d, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((d.rate - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <path d={path} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#1d4ed8" />
          <text x={p[0]} y={h - 4} fontSize="10" textAnchor="middle" fill="#64748b">{data[i].month}</text>
        </g>
      ))}
    </svg>
  );
}
 
function StatsPage() {
  return (
    <div>
      <SectionTitle eyebrow="정책 시뮬레이션용 예시 지표" title="통계 · 정책효과" desc="아래 수치는 실제 정책 성과가 아닌 시스템 시연을 위한 예시 지표입니다." />
      <div className="grid grid-cols-4 gap-3 mb-6">
        {EXAMPLE_KPI.map((k) => (
          <div key={k.label} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{k.label}</span>
              <MockTag children="예시 지표" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-800">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">단계별 사건 처리 현황</h3>
            <MockTag children="예시 지표" />
          </div>
          <BarChartSimple data={KPI_BAR} />
        </Panel>
        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">월별 학교복귀 완료율 추이</h3>
            <MockTag children="예시 지표" />
          </div>
          <LineChartSimple data={KPI_LINE} />
        </Panel>
      </div>
    </div>
  );
}
 
/* =========================================================================
   정책 안내
   ========================================================================= */
 
function PolicyInfoPage() {
  const existing = ["사건 발생", "절차 진행", "사건 종결"];
  const proposed = ["사건 발생", "심각도 평가", "단계별 법률·심리·행정지원", "케이스매니저 배정", "학교복귀 설계", "복귀 후 3개월 관리", "재발 위험도 평가", "사후관리", "재발 시 기관 차원의 강화 대응", "안정적인 학교생활 정착"];
 
  return (
    <div>
      <SectionTitle eyebrow="STEP 6 · 정책 안내" title="기존 제도와의 차이" desc="정책의 목적과 기존 대응 절차와의 구조적 차이를 비교합니다." />
 
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Panel>
          <h3 className="mb-3 text-xs font-bold text-slate-500">기존</h3>
          <div className="space-y-1.5">
            {existing.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">{i + 1}</span>
                <span className="text-sm text-slate-600">{s}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="border-blue-300">
          <h3 className="mb-3 text-xs font-bold text-blue-800">제안 정책</h3>
          <div className="space-y-1.5">
            {proposed.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">{i + 1}</span>
                <span className="text-sm text-slate-700">{s}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
 
      <div className="mb-6 rounded-md border border-slate-300 bg-slate-900 p-6 text-center text-white">
        <p className="text-base font-bold leading-relaxed">
          "사건을 처리하는 것에서 끝나지 않고, 피해 교원의 회복과 학교생활 정착까지 관리한다."
        </p>
      </div>
 
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-bold text-slate-800">정책 실행방안 — 육하원칙</h3>
        <div className="grid grid-cols-4 gap-3">
          {FIVE_W_1_H.map((f) => (
            <Panel key={f.label}>
              <div className="text-xs font-bold text-blue-800 mb-1.5">{f.label}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{f.value}</p>
            </Panel>
          ))}
        </div>
      </div>
 
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">학부모 민원 대응 체계</h3>
        <div className="grid grid-cols-2 gap-4">
          <Panel>
            <div className="mb-2 text-xs font-bold text-slate-500">기존</div>
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">교사</div>
              <ArrowRight size={16} className="text-slate-300" />
              <ArrowLeftIcon />
              <div className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">학부모</div>
            </div>
            <p className="text-center text-xs text-slate-400">교사 ↔ 학부모 직접 대응</p>
          </Panel>
          <Panel className="border-blue-300">
            <div className="mb-2 text-xs font-bold text-blue-800">제안 정책</div>
            <div className="flex items-center justify-center gap-1.5 py-4 flex-wrap">
              {["학부모", "학교/교육지원청 공식 창구", "담당기관", "교사 보호"].map((s, i, arr) => (
                <React.Fragment key={s}>
                  <div className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-800 text-center">{s}</div>
                  {i < arr.length - 1 && <ArrowRight size={13} className="text-blue-300" />}
                </React.Fragment>
              ))}
            </div>
            <p className="text-center text-xs text-blue-700">피해 교사가 직접 민원을 감당하지 않도록 기관 중심의 민원 대응체계를 구축합니다.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
 
function ArrowLeftIcon() {
  return <ChevronLeft size={16} className="text-slate-300 -ml-4" />;
}
 
/* =========================================================================
   사건 시뮬레이션 모달
   ========================================================================= */
 
function SimulationModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const s = SIM_STEPS[step];
  const last = step === SIM_STEPS.length - 1;
 
  const supportColor = { 법률: "bg-blue-100 text-blue-800", 심리: "bg-violet-100 text-violet-800", 행정: "bg-slate-200 text-slate-700" };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6">
      <div className="w-full max-w-2xl rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <CaseIdTag id="CASE-2026-0017" />
            <span className="text-sm font-semibold text-slate-700">교사 A · 반복적인 악성 민원과 지속적인 교육활동 방해</span>
          </div>
          <button onClick={() => { onClose(); setStep(0); }} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
 
        <div className="px-5 pt-4">
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-blue-700 transition-all" style={{ width: `${((step + 1) / SIM_STEPS.length) * 100}%` }} />
          </div>
          <div className="mt-1.5 text-right text-[11px] text-slate-400">{step + 1} / {SIM_STEPS.length}단계</div>
        </div>
 
        <div className="px-5 py-5">
          <div className="mb-1 text-xs font-semibold text-blue-800">STEP {step + 1}</div>
          <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
 
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-400">현재 담당자</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-800">{s.actor}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-400">현재 지원</div>
              <div className="mt-1 flex gap-1.5">
                {s.support.length === 0 ? (
                  <span className="text-xs text-slate-400">-</span>
                ) : (
                  s.support.map((t) => (
                    <span key={t} className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${supportColor[t]}`}>{t}</span>
                  ))
                )}
              </div>
            </div>
          </div>
 
          {last && (
            <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-center">
              <CheckCircle2 size={22} className="mx-auto text-emerald-600" />
              <p className="mt-1 text-sm font-bold text-emerald-800">사건을 처리하는 것에서 끝나지 않습니다.</p>
              <p className="mt-0.5 text-xs text-emerald-700">필요시 언제든 다시 위험도 평가와 지원이 연결됩니다.</p>
            </div>
          )}
        </div>
 
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <button
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft size={13} /> 이전
          </button>
          {!last ? (
            <button
              onClick={() => setStep((v) => Math.min(SIM_STEPS.length - 1, v + 1))}
              className="flex items-center gap-1 rounded-sm border border-blue-700 bg-blue-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-900"
            >
              다음 <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={() => { onClose(); setStep(0); }}
              className="rounded-sm border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
            >
              시뮬레이션 종료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 
/* =========================================================================
   App Shell
   ========================================================================= */
 
export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [simOpen, setSimOpen] = useState(false);
 
  const pages = {
    dashboard: <DashboardPage onStartSimulation={() => setSimOpen(true)} />,
    prevention: <PreventionPage />,
    case: <CaseManagementPage />,
    support: <IntegratedSupportPage />,
    return: <ReturnPage />,
    recurrence: <RecurrencePage />,
    stats: <StatsPage />,
    info: <PolicyInfoPage />,
  };
 
  return (
    <div className="flex h-full min-h-[720px] w-full bg-slate-50" style={{ fontFamily: "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');`}</style>
 
      {/* 사이드바 */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-2 text-blue-800">
            <Landmark size={20} />
            <span className="text-[13px] font-bold leading-tight">교권피해 교원<br />통합지원시스템</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            사전예방부터 학교복귀·재발방지까지<br />하나의 통합지원체계
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => setNav(n.id)}
              className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                nav === n.id ? "bg-blue-800 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <n.icon size={15} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-3 text-[10px] leading-relaxed text-slate-400">
          ※ 본 웹페이지는 정책 제안을 위한 시각화 프로토타입입니다.<br />화면의 교사 정보 및 사건 데이터는 모두 가상의 예시입니다.
        </div>
      </aside>
 
      {/* 메인 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{NAV_ITEMS.find((n) => n.id === nav).label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-400">
              <Search size={13} /> 사건번호·교원명 검색
            </div>
            <button
              onClick={() => setSimOpen(true)}
              className="flex items-center gap-1.5 rounded-sm border border-blue-700 bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900"
            >
              <PlayCircle size={14} /> 사건 시뮬레이션
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">{pages[nav]}</main>
      </div>
 
      <SimulationModal open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
 
// Archived React prototype. Not loaded by the site.
