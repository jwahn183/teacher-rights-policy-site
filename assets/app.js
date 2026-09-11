'use strict';
// T-Care application: rendering and in-memory policy demonstrations.

// Only in-memory demonstration state. No network submission or browser storage.
const defaultPlan = () => ({
  date:'',mode:'타 학급',pace:'수업부터 부분적으로',contact:'직접 접촉하지 않음',
  people:['동료교사','상담사'],counsel:'필요할 때 선택',notes:''
});
const state = {
  page:'home', journey:2, caseTab:'record', supportLevel:2, caseRecord:null, caseCounter:0,
  draft:{date:'',place:'교실',actor:'학생',urgency:'일반',notes:'',evidence:[]},
  riskSelection:[], selectedSupports:[], preventionChecks:[], followupChecks:[],
  plan:defaultPlan(),
  planSaved:false, recurrenceRisk:'보통', recurrenceDetected:false, policyTab:'overview',
  resourceFilter:'전체', simulationStep:0
};
const $ = (selector,root=document) => root.querySelector(selector);
const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const ICONS = {
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/>',
  shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  file:'<path d="M14 2H5v20h14V7Z M14 2v6h5 M8 12h8 M8 16h6"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  school:'<path d="m3 10 9-7 9 7 M5 9v12h14V9 M10 21v-6h4v6 M10 9h4 M3 21h18"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14-5L3 9 M3 4v5h5 M4 13a8 8 0 0 0 14 5l3-3 M21 20v-5h-5"/>',
  chart:'<path d="M3 3v18h18 M7 16v-5 M12 16V7 M17 16V4"/>',
  book:'<path d="M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Z M12 5v16"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M4 12h16 m-6-6 6 6-6 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  scale:'<path d="M12 3v18 M6 21h12 M4 6h16 M5 6l-3 8h6Z M19 6l-3 8h6Z"/>',
  clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6 M9 16h6"/>',
  alert:'<path d="m12 3 10 18H2Z M12 9v5 M12 18h.01"/>',
  play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
  download:'<path d="M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5"/>',
  users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3 M16 4a3 3 0 0 1 0 6 M18 13a5 5 0 0 1 3 5v3"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  external:'<path d="M14 3h7v7 M21 3 10 14 M10 3H3v18h18v-7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.file}</svg>`;
const badge = (text,color='gray') => `<span class="badge ${color}">${escapeHTML(text)}</span>`;
const list = items => `<ul class="list">${items.map(text=>`<li>${escapeHTML(text)}</li>`).join('')}</ul>`;
const action = (text,name,extra='',style='') => `<button class="button ${style}" data-action="${name}" ${extra}>${text}</button>`;
const localDateTime = () => {const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
const maxRisk = () => state.riskSelection.reduce((max,index)=>Math.max(max,POLICY.risks[index][0]),0);
const currentLevel = () => state.caseRecord ? (state.caseRecord.level || 2) : state.supportLevel;
const title = (heading,desc,eyebrow='') => `<div class="page-intro"><div>${eyebrow?`<span class="eyebrow">${eyebrow}</span>`:''}<h1>${heading}</h1><p>${desc}</p></div><button class="intro-action" data-action="simulation" aria-label="사건 흐름 체험하기">${icon('play')} 사건 흐름 체험하기</button></div>`;
function tabs(group,items,selected){return `<div class="tabs" aria-label="${group==='case'?'사안 작성 및 진단 메뉴':'정책 보기 메뉴'}">${items.map(([key,label])=>`<button data-action="tab" data-group="${group}" data-value="${key}" aria-pressed="${selected===key}">${label}</button>`).join('')}</div>`;}
function selectField(label,key,options,value,scope='plan') {return `<div class="field"><label for="${scope}-${key}">${label}</label><select id="${scope}-${key}" data-scope="${scope}" data-field="${key}">${options.map(option=>`<option${option===value?' selected':''}>${escapeHTML(option)}</option>`).join('')}</select></div>`;}
function chips(group,items,selected){return `<div class="chips">${items.map(item=>`<label class="chip"><input type="checkbox" data-list="${group}" value="${escapeHTML(item)}"${selected.includes(item)?' checked':''}>${escapeHTML(item)}</label>`).join('')}</div>`;}
function checks(group,items,selected){return `<div class="check-list">${items.map((item,index)=>`<label class="check-row"><input type="checkbox" data-list="${group}" value="${index}"${selected.includes(index)?' checked':''}><span>${escapeHTML(item)}</span></label>`).join('')}</div>`;}

function homePage(){
  const record=state.caseRecord;
  const j=POLICY.journey[state.journey];
  return `<div class="home-masthead"><span class="eyebrow">T-CARE / 교원의 일상을 지키는 연결</span><span class="edition">POLICY PROPOSAL · 2026</span></div>
  <div class="home-opening"><section class="hero"><span class="eyebrow">선생님을 위한 통합지원</span><h1>다시, 안심하고<br><em>가르칠 수 있도록.</em></h1><p>혼자 설명하고, 찾아다니던 지원.<br>하나의 기록으로 법률·심리·행정을 연결하고<br>교실로 돌아오는 과정까지 함께합니다.</p><div class="actions"><a class="button" href="#case">내 사안 작성하기 ${icon('arrow')}</a><button class="text-link" data-action="simulation">${icon('play')} 지원 과정 체험</button></div><small class="hero-footnote">교육정책 5팀의 정책 제안 · 실제 신고가 접수되지 않는 체험입니다.</small></section>
  <section class="journey-panel"><div class="section-head"><h2>지금 필요한 단계에서 시작하세요</h2>${badge('5단계 연결')}</div><div class="journey" aria-label="5단계 지원 경로">${POLICY.journey.map((item,i)=>`<button data-action="journey" data-value="${i}" aria-controls="journey-detail" aria-pressed="${state.journey===i}" class="${state.journey===i?'active':''}"><span class="step-number">${String(i+1).padStart(2,'0')}</span><span><strong>${item.title}</strong><small>${item.sub}</small></span>${icon('arrow')}</button>`).join('')}</div><div class="journey-detail" id="journey-detail" aria-live="polite"><p>${j.desc}</p><a href="#${j.route}">${j.title} 자세히 ${icon('chevron')}</a></div></section></div>
  <aside class="urgent-strip" aria-label="긴급 도움 안내">${icon('alert')}<p><strong>지금 안전이 위협받고 있나요?</strong>안전한 곳으로 이동해 도움을 요청하세요.</p><a href="tel:112"><strong>112</strong> 긴급 신고</a><a href="#resources" data-action="contact" aria-label="지역번호를 포함한 교권 상담 연결 안내"><strong>1395</strong> 교권 상담</a></aside>
  <div class="two-column section"><section><div class="section-head"><h2>${record?'나의 체험 사안':'이렇게 지원이 연결됩니다'}</h2>${badge(record?'이 화면에서 작성':'가상 사례','blue')}</div><div class="card case-summary"><div class="card-top"><span class="case-id">${record?escapeHTML(record.id):'DEMO-2026-0017'}</span>${badge(record?(record.level?record.level+'단계':'진단 전'):'통합지원 진행 예시',record?.level?POLICY.severity[record.level].color:'blue')}</div><h3>${record?escapeHTML(record.notes.slice(0,70)):'반복적인 악성 민원과 교육활동 방해'}</h3><div class="case-meta"><span>현재 단계<strong>${record?escapeHTML(record.stage):'통합지원'}</strong></span><span>케이스매니저<strong>${record?(record.level>=2?'배정 검토 · 체험':'미배정'):'전담 담당자 · 예시'}</strong></span></div><ol class="case-progress">${['사안 기록','심각도 확인','통합지원','학교복귀','사후관리'].map((label,i)=>`<li class="${i<(record?record.phase:2)?'done':i===(record?record.phase:2)?'current':''}">${label}</li>`).join('')}</ol><div class="case-footer"><span>${record?'입력 내용은 현재 화면에서만 유지됩니다.':'사건번호 하나로 지원 과정을 함께 확인합니다.'}</span><button data-action="${record?'case-detail':'simulation'}">${record?'기록 보기':'과정 체험'} ${icon('chevron')}</button></div></div></section>
  <section><div class="section-head"><h2>어떤 도움이 필요하세요?</h2></div><div class="support-shortcuts">${POLICY.support.map(s=>`<a href="#support" class="shortcut"><span class="icon-tile ${s.color}">${icon(s.icon)}</span><span><strong>${s.name}</strong><small>${{legal:'상담·의견서·소송 지원',mind:'심리상담·치료·회복 지원',admin:'신청·서류·기관 연계'}[s.key]}</small></span>${icon('chevron')}</a>`).join('')}</div></section></div>
  <div class="bottom-grid section"><section class="card"><div class="section-head"><h2>미리 준비하는 보호 자료</h2><a href="#resources">자료실 ${icon('chevron')}</a></div>${POLICY.resources.slice(0,3).map(r=>`<button class="resource-row" data-action="resource" data-value="${r.id}">${icon('file')}<span>${r.title}</span><small>서식 보기</small>${icon('chevron')}</button>`).join('')}</section><aside class="card policy-banner"><span class="eyebrow">OUR PROMISE</span><h3>사건 종결을 넘어,<br>안전한 학교생활로.</h3><p>교원이 회복의 속도를 결정하고,<br>학교와 지원기관이 함께 책임지는 정책.</p><a href="#policy">T-Care의 정책 방향 살펴보기 ${icon('arrow')}</a></aside></div>`;
}

function preventionPage(){return `${title('예방은, 함께 준비하는 것부터','위험징후를 일찍 발견하고 학교 차원의 보호체계를 준비합니다.','01 · PREVENTION')}
  <div class="grid-3">${POLICY.prevention.map(p=>`<article class="card"><div class="icon-tile">${icon(p[3])}</div><span class="eyebrow" style="margin-top:20px">${p[0]}</span><h3>${p[1]}</h3><p class="subtle">${p[2]}</p></article>`).join('')}</div>
  <div class="grid-2 section"><section class="card"><div class="card-top"><h2>우리 학교 예방 준비 점검</h2><span class="badge blue" id="prevention-count">${state.preventionChecks.length} / 6</span></div>${checks('preventionChecks',POLICY.preventionChecks,state.preventionChecks)}<div class="actions">${action(icon('download')+' 점검 결과 내려받기','download-prevention','','secondary')}</div></section><div class="stack"><section class="card"><span class="eyebrow">연 2회 · 제안 일정</span><h2>학기 중반, 보호 체감도 확인</h2><div class="timeline"><div class="timeline-row"><span>1학기 중반</span><div><h3>위험징후와 지원 수요 확인</h3><p>반복 민원, 수업 방해, 보호 체감도를 익명 실태조사로 점검합니다.</p></div></div><div class="timeline-row"><span>2학기 중반</span><div><h3>조치 이후 변화 확인</h3><p>대응이 실제로 도움이 되었는지 살피고 다음 학기 예방계획에 반영합니다.</p></div></div></div></section><section class="card policy-banner"><h3>존중하는 교실, 함께 만드는 약속</h3><p>학생의 학습권과 교육활동 보호를 연결하는 40분 예방수업 활동안입니다.</p><div class="actions">${action('예방수업 활동안 보기','resource','data-value="lesson"','secondary')}</div></section></div></div>`;}

function recordForm(){const d=state.draft;return `<div class="notice">가상의 사안으로 작성해 보세요. <strong>기관에 전송되지 않으며</strong> 이름·연락처 등 실제 개인정보를 입력할 필요가 없습니다.</div><div class="grid-2"><section class="card"><div class="card-top"><h2>사안 기록 작성</h2>${action('예시 불러오기','fill-example','','secondary small')}</div><form id="case-form"><div class="form-grid"><div class="field"><label for="draft-date">발생 일시 <span class="subtle">(필수)</span></label><input id="draft-date" type="datetime-local" data-scope="draft" data-field="date" value="${escapeHTML(d.date)}" max="${localDateTime()}" required></div>${selectField('발생 장소','place',['교실','복도·운동장','상담실','온라인·SNS','전화·문자','기타'],d.place,'draft')}${selectField('관련 주체','actor',['학생','학부모·보호자','학생과 보호자','기타'],d.actor,'draft')}${selectField('필요한 보호','urgency',['일반','접촉·분리조치 검토','즉시 안전 확보'],d.urgency,'draft')}<div class="field full"><label for="draft-notes">사안 내용 <span class="subtle">(필수)</span></label><textarea id="draft-notes" data-scope="draft" data-field="notes" minlength="10" maxlength="4000" required placeholder="언제, 어디서, 어떤 일이 있었는지 10자 이상으로 작성해 주세요.">${escapeHTML(d.notes)}</textarea><small class="subtle">관찰한 사실과 추측을 구분하고 반복 여부를 함께 적어 주세요.</small></div><fieldset class="full"><legend>보유한 관련 자료</legend>${chips('evidence',['문자·이메일','사진·영상·녹음','목격자 진술','사안 기록'],d.evidence)}<p class="subtle" style="margin-top:8px">자료 종류만 표시합니다. 파일은 업로드하지 않습니다.</p></fieldset></div><div class="actions"><button class="button" type="submit">${icon('check')} ${state.caseRecord?'체험 기록 갱신':'체험 사건번호 만들기'}</button></div><p class="subtle" id="case-feedback" role="status" style="margin-top:10px"></p></form></section><div class="stack"><section class="card"><span class="eyebrow">FIRST RESPONSE</span><h2>먼저 확인해 주세요</h2>${list(['안전한 장소에서 주변에 도움을 요청합니다.','학교 관리자에게 현재 상황을 알립니다.','안전이 확보된 뒤 일시·장소·행동을 기록합니다.','자료를 보존하고 공식 상담 경로를 확인합니다.'])}<div class="urgent-actions"><a href="tel:112"><strong>112</strong>긴급 신고</a><a href="#resources" data-action="contact" aria-label="지역번호를 포함한 교권 상담 연결 안내"><strong>1395</strong>교권 상담</a></div></section>${state.caseRecord?`<section class="card"><span class="case-id">${escapeHTML(state.caseRecord.id)}</span><h3 style="margin-top:10px">현재 화면의 체험 기록</h3><p class="subtle">${escapeHTML(state.caseRecord.stage)} · 새로고침하면 초기화됩니다.</p><div class="actions">${action('작성 내용 내려받기','download-case','','secondary')}</div></section>`:`<section class="card policy-banner"><h3>한 번 정리한 기록으로,<br>여러 지원을 이어갑니다.</h3><p>법률·심리·행정 담당자가 같은 사건정보를 바탕으로 협업하는 정책을 체험해 보세요.</p></section>`}</div></div>`;}

function diagnosisResult(){const level=maxRisk(),s=POLICY.severity[level];return `${badge(level?level+'단계 · '+s.short:s.short,s.color)}<h3>${s.title}</h3><p>${s.desc}</p>${list(s.actions)}<div class="actions">${action('이 단계로 지원 살펴보기','apply-diagnosis',level?'':'disabled')}</div><p class="subtle" style="margin-top:18px">제안 정책의 분류 예시이며, 법률상 침해 여부나 의학적 상태를 판정하지 않습니다.</p>`;}
function diagnosisPage(){return `<div class="notice warn">상황 선택은 <strong>지원 경로 체험</strong>을 위한 것입니다. 실제 대응은 관할 기관과 상담하여 확인하세요.</div><div class="diagnosis-layout"><section class="card"><h2>어떤 상황을 겪고 있나요?</h2><p class="subtle" style="margin:8px 0 20px">해당하는 항목을 모두 선택해 주세요.</p><fieldset><legend class="sr-only">사안 상황</legend><div class="check-list">${POLICY.risks.map((r,i)=>`<label class="check-row"><input type="checkbox" data-list="riskSelection" value="${i}"${state.riskSelection.includes(i)?' checked':''}><span><strong>${r[1]}</strong><small>${r[2]}</small></span></label>`).join('')}</div></fieldset></section><section class="result-card level-${maxRisk()}" id="diagnosis-result" aria-live="polite">${diagnosisResult()}</section></div>`;}
function matrix(){return `<div class="notice">1~3단계는 보고서에서 제안한 <strong>지원 강도</strong>입니다. 예방부터 재발방지까지의 5단계 여정과 구분됩니다.</div><div class="table-wrap"><table><caption class="sr-only">제안 정책의 심각도별 법률·심리·행정지원 비교</caption><thead><tr><th scope="col">지원 분야</th>${[1,2,3].map(i=>`<th scope="col">${badge(i+'단계',POLICY.severity[i].color)}<br>${POLICY.severity[i].short}</th>`).join('')}</tr></thead><tbody>${POLICY.support.map(s=>`<tr><th scope="row">${s.name}</th>${[1,2,3].map(i=>`<td>${POLICY.severity[i][s.key].map(escapeHTML).join('<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="section card"><h3>지원의 연결은 강화하고, 교원의 선택은 존중합니다.</h3><p class="subtle">2단계부터 법률·심리 전문가의 기본 연계를 제안합니다. 상담·관계회복 프로그램의 참여 여부와 복귀 속도는 교원의 의사를 확인하여 조율합니다.</p></div>`;}
function casePage(){return `${title('기록부터 지원까지, 한 번에','사안을 정리하고 상황에 맞는 지원 경로를 확인해 보세요.','02 · CASE & RESPONSE')}${tabs('case',[['record','사안 작성'],['diagnosis','심각도 확인'],['matrix','단계별 지원 비교']],state.caseTab)}${state.caseTab==='record'?recordForm():state.caseTab==='diagnosis'?diagnosisPage():matrix()}`;}

function supportPage(){const level=currentLevel(),s=POLICY.severity[level];return `${title('필요한 도움을, 하나로 연결합니다','같은 사건번호를 중심으로 법률·심리·행정 담당자가 함께 지원하는 정책입니다.','03 · INTEGRATED SUPPORT')}
  <div class="notice">${state.caseRecord?`체험 사건 <strong>${escapeHTML(state.caseRecord.id)}</strong> · ${state.caseRecord.level?'선택한 '+level+'단계 지원을 확인합니다.':'심각도 선택 전입니다. 아래는 2단계 지원 예시입니다.'}`:`현재 ${level}단계 지원 예시입니다. 사안을 작성하면 선택한 지원을 같은 사건번호로 묶어볼 수 있습니다.`}</div>
  ${!state.caseRecord?`<div class="risk-buttons" aria-label="심각도별 지원 비교">${[1,2,3].map(n=>`<button data-action="preview-level" data-value="${n}" aria-pressed="${level===n}">${n}단계 · ${POLICY.severity[n].short}</button>`).join('')}</div>`:''}
  <div class="section-head"><h2>${level}단계 · ${s.short}</h2><button data-action="go-diagnosis">단계 다시 확인 ${icon('chevron')}</button></div>
  <div class="grid-3">${POLICY.support.map(item=>`<article class="card support-card"><span class="icon-tile ${item.color}">${icon(item.icon)}</span><h3>${item.name}</h3><p>${item.desc}</p>${list(s[item.key])}<div class="actions">${action(state.selectedSupports.includes(item.key)?icon('check')+' 선택됨':'지원 계획에 추가','select-support',`data-value="${item.key}" aria-pressed="${state.selectedSupports.includes(item.key)}"`,state.selectedSupports.includes(item.key)?'secondary':'')}</div></article>`).join('')}</div>
  <section class="card section"><div class="card-top"><h2>함께 정리한 지원 계획</h2>${badge('체험 · 기관 미전송')}</div><p class="subtle">${state.selectedSupports.length?state.selectedSupports.map(key=>POLICY.support.find(s=>s.key===key).name).join(' · '):'필요한 지원을 위에서 선택해 주세요.'}</p><div class="actions">${action(icon('download')+' 지원 계획 내려받기','download-support',!state.selectedSupports.length?'disabled':'','secondary')}<a class="button secondary" href="#return">학교복귀 설계하기 ${icon('arrow')}</a></div></section>
  <div class="grid-2 section"><section class="card"><h2>케이스매니저 중심의 협업</h2><div class="org-line"><span>교육부</span>→<span>시·도교육청</span>→<span>교육지원청·학교</span></div><div class="org-manager">하나의 사건번호 · 케이스매니저<small>기록·일정·지원 연계를 함께 조율</small></div><div class="org-roles">${[['scale','법률 전문가'],['heart','전문상담사'],['school','학교 관리자'],['users','교육지원청 담당자']].map(([i,t])=>`<div>${icon(i)}${t}</div>`).join('')}</div></section><section class="card"><h2>비용·공제 지원도 함께 확인</h2>${list(['치료비·상담비 지원 조건과 구비서류','교원보호공제·보험의 적용 범위와 청구 절차','법률상담·소송 관련 지원 가능 여부','휴가·병가 및 복귀에 필요한 행정 절차'])}<p class="subtle" style="margin-top:18px">지원 대상, 금액, 승인 절차는 관할 교육청과 가입한 공제·보험 약관에 따라 다릅니다. 이 화면에서 지급을 확정하지 않습니다.</p><div class="actions"><a class="button secondary" href="#resources">공식 지원 경로 확인 ${icon('external')}</a></div></section></div>`;}

function planSummary(){const p=state.plan;return `<h3>나의 복귀설계서 초안</h3>${badge(state.planSaved?'화면에 반영됨':'작성 중','blue')}<dl><dt>복귀 예정일</dt><dd>${escapeHTML(p.date||'학교와 협의 후 결정')}</dd><dt>복귀 방식 · 업무 속도</dt><dd>${escapeHTML(p.mode)} · ${escapeHTML(p.pace)}</dd><dt>접촉 범위</dt><dd>${escapeHTML(p.contact)}</dd><dt>지원인력</dt><dd>${escapeHTML(p.people.join(', ')||'지원인력 선택 없음')}</dd><dt>상담·프로그램</dt><dd>${escapeHTML(p.counsel)}</dd><dt>추가 요청</dt><dd>${escapeHTML(p.notes||'추가 요청 없음')}</dd></dl><div class="actions">${action(icon('download')+' 설계서 내려받기','download-plan','','secondary')}</div>`;}
function returnPage(){const p=state.plan;return `${title('다시 교실로, 선생님의 속도로','복귀의 조건과 회복의 속도는 선생님이 선택하고 학교가 함께 조율합니다.','04 · RETURN TO SCHOOL')}
  <div class="notice"><strong>교사 주도 복귀 설계</strong> · 상담·관계회복 참여와 직접 접촉은 강제하지 않으며, 필요하면 업무 확대를 보류하거나 지원을 다시 요청할 수 있도록 제안합니다.</div>
  <div class="choice-layout"><section class="card"><h2>안전한 복귀 조건 선택</h2><p class="subtle" style="margin:8px 0 22px">복귀 전 2~4주부터 준비하는 제안 계획입니다.</p><form id="plan-form"><div class="form-grid"><div class="field"><label for="plan-date">복귀 예정일 (선택)</label><input id="plan-date" data-scope="plan" data-field="date" type="date" value="${escapeHTML(p.date)}"></div>${selectField('복귀 방식','mode',['동일 학급','타 학급','비담임'],p.mode)}${selectField('업무 속도','pace',['수업부터 부분적으로','수업·행정 단계적 확대','업무 확대 보류'],p.pace)}${selectField('접촉 범위','contact',['직접 접촉하지 않음','매개자를 통해 소통','본인 동의 후 직접 접촉'],p.contact)}<fieldset class="full"><legend>함께할 지원인력 (선택하지 않아도 됩니다)</legend>${chips('people',['동료교사','상담사','관리자','케이스매니저'],p.people)}</fieldset>${selectField('상담·관계회복 참여','counsel',['필요할 때 선택','상담 연장 요청','이번에는 참여하지 않음'],p.counsel)}<div class="field full"><label for="plan-notes">학교와 조율할 내용 (선택)</label><textarea id="plan-notes" data-scope="plan" data-field="notes" maxlength="2000" placeholder="시간표·인력·공간 등 필요한 조정을 적어 주세요.">${escapeHTML(p.notes)}</textarea></div></div><div class="actions"><button class="button" type="submit">${icon('check')} 복귀 계획 화면에 반영</button></div></form></section><aside class="plan-summary" id="plan-summary" aria-live="polite">${planSummary()}</aside></div>
  <section class="card section"><h2>준비 → 적응 → 안정화</h2><div class="timeline">${[['복귀 전 2~4주','안전한 조건 설계','교원이 복귀설계서를 작성하고, 학교가 시간표·인력·공간과 접촉 가능성을 검토합니다.'],['복귀 후 1개월','초기 적응과 집중지원','수업부터 부분적으로 시작합니다. 격주 관리자 면담을 통해 어려움과 조정 필요를 확인합니다.'],['복귀 후 3개월','업무 안정화와 피드백','월 1회 피드백과 주 단위 설계서 갱신을 제안합니다. 교원의 판단에 따라 업무를 확대하거나 보류합니다.']].map(([time,heading,body])=>`<div class="timeline-row"><span>${time}</span><div><h3>${heading}</h3><p>${body}</p></div></div>`).join('')}</div></section>`;}

function recurrenceDetails(){const r=POLICY.recurrence[state.recurrenceRisk];return `<div class="risk-facts"><div><small>사후관리 기간</small><strong>${r.period}</strong></div><div><small>관리 주체</small><strong>${r.owner}</strong></div><div><small>보호·지원 방향</small><strong>${r.protect}</strong></div></div>`;}
function recurrencePage(){return `${title('지원은, 종결 이후에도 이어집니다','위험도 평가와 사후관리를 연결하고 재발 시 기관이 함께 대응합니다.','05 · CONTINUOUS CARE')}
  <section class="card"><h2>위험도별 관리 방안 살펴보기</h2><p class="subtle" style="margin-top:9px">아래 위험도는 사용자가 선택하는 시나리오입니다. 실제 평가는 심각성·반복 가능성·관련자 태도와 교원의 안전·회복 상태를 담당자가 종합 검토합니다.</p><div class="risk-buttons" aria-label="재발 위험도 시나리오">${Object.keys(POLICY.recurrence).map(r=>`<button data-action="risk-level" data-value="${r}" aria-pressed="${r===state.recurrenceRisk}">${r}</button>`).join('')}</div><div id="recurrence-details" class="notice" aria-live="polite" style="margin-bottom:0">${recurrenceDetails()}</div></section>
  <div class="grid-2 section"><section class="card"><div class="card-top"><h2>사후관리 점검표</h2><span class="badge blue" id="followup-count">${state.followupChecks.length} / 6</span></div>${checks('followupChecks',POLICY.followupChecks,state.followupChecks)}<div class="actions">${action('점검 결과 내려받기','download-followup','','secondary')}</div></section><section class="card"><span class="eyebrow">RECONNECT</span><h2>재발하면, 기관이 다시 대응합니다.</h2><p class="subtle" style="margin-top:12px">반복 민원은 학교·교육지원청 공식 창구로 연결하고, 기존 사건의 기록을 다음 위험도 평가에 반영합니다.</p><div id="recurrence-scenario" style="margin-top:22px">${recurrenceScenario()}</div></section></div>`;}
function recurrenceScenario(){return state.recurrenceDetected?`<div class="notice danger"><strong style="color:inherit">가상 재발 상황 · 강화 대응 경로</strong><p style="margin-top:5px">실제 보고·분리·기관 연계가 실행된 것은 아닙니다.</p></div>${list(['교육지원청에 재발 사실 보고','교원 안전 확인과 관련자 분리 등 보호조치 검토','법률·심리 전문가와 교육활동보호센터 연계','학교·교육지원청의 민원 직접 대응','사건 기록 갱신 후 위험도 재평가'])}<div class="actions">${action('체험 초기화','reset-recurrence','','secondary')}</div>`:`<div class="org-line"><span>위험도 평가</span>→<span>맞춤형 관리</span>→<span>재발 대응</span>↺</div>${action(icon('refresh')+' 재발 상황 체험','simulate-recurrence','','danger')}`;}

function statsContent(){return `<div class="notice warn">모든 수치는 <strong>가상의 정책 평가 예시</strong>입니다. 실제 성과나 현재 화면의 체험 사안을 집계한 수치가 아닙니다.</div><div class="metrics">${[['초기 대응시간','2.4시간','신고 후 첫 보호·안내까지'],['전담인력 배정률','90%','지원 대상 중 담당자 지정'],['분야별 지원 연계율','88%','법률·심리·행정 중 필요한 지원 연결'],['보호 체감도','4.2 / 5','피해 교원 설문 평균'],['학교복귀 완료율','81%','지원 대상 중 복귀 완료'],['재침해 발생률','6%','사후관리 대상 중 재발']].map(([n,v,d])=>`<div class="metric"><span>${n}</span><strong>${v}</strong><small>${d} · 예시</small></div>`).join('')}</div><div class="grid-2"><section class="card"><div class="card-top"><h2>심각도별 관리 사건</h2>${badge('가상 128건')}</div><div class="bar-chart">${[61,44,23].map((v,i)=>`<div class="bar-row"><span>${i+1}단계</span><div class="bar-track" aria-hidden="true"><span style="width:${v/61*100}%"></span></div><strong>${v}건</strong></div>`).join('')}</div></section><section class="card"><div class="card-top"><h2>학교복귀 완료율 추이</h2>${badge('가상 예시')}</div><svg class="chart-svg" viewBox="0 0 470 180" role="img" aria-label="가상 학교복귀 완료율: 1월 62%, 2월 66%, 3월 71%, 4월 74%, 5월 79%, 6월 81%"><path d="M32 18H446 M32 64H446 M32 110H446" stroke="#e3e9f1" fill="none"/>${[62,66,71,74,79,81].map((v,i)=>`<text x="${35+i*80}" y="166" text-anchor="middle">${i+1}월</text><text x="${35+i*80}" y="${140-(v-60)*5-14}" text-anchor="middle">${v}%</text>`).join('')}<polyline points="${[62,66,71,74,79,81].map((v,i)=>`${35+i*80},${140-(v-60)*5}`).join(' ')}" fill="none" stroke="var(--blue)" stroke-width="3"/>${[62,66,71,74,79,81].map((v,i)=>`<circle cx="${35+i*80}" cy="${140-(v-60)*5}" r="4" fill="var(--blue)"/>`).join('')}</svg></section></div><section class="card section"><h2>성과는 무엇으로 확인하나요?</h2>${list(['신고 후 초기 대응까지 걸린 시간','전담인력 배정 여부와 분야별 지원 연계율','피해 교원의 보호 체감도와 학교생활 안정도','복귀 이후 관리의 지속성과 재침해 발생 여부'])}</section>`;}
function policyOverview(){return `<section class="card"><span class="eyebrow">POLICY VISION</span><p class="quote">교권침해 발생 이전부터 회복·복귀 이후까지,<br>하나로 연결된 예방적·통합적 교권보호체계.</p><p class="subtle" style="margin-top:20px">교육정책 5팀 보고서가 제안한 정책을 교원 중심의 서비스 흐름으로 구성했습니다. 아래 비교는 보고서의 문제의식과 개선 방향이며, 모든 현행 제도를 동일하게 평가하는 설명은 아닙니다.</p></section><div class="grid-3 section">${[['개입 시점','사후 대응 중심의 공백','예방교육·위험징후 인식·초기 보호까지 연결'],['지원 접근성','기관 탐색과 신청의 부담','공식 판단 전 필요한 상담·보호부터 연결'],['지원의 연속성','심의·상담·비용 지원의 분절','같은 사건번호로 복귀·재발방지까지 관리']].map(([t,a,b])=>`<article class="card"><span class="eyebrow">${t}</span><p class="subtle">보고서가 지적한 과제</p><h3 style="margin:8px 0 20px">${a}</h3><p style="color:var(--blue)">${icon('arrow')} ${b}</p></article>`).join('')}</div><section class="card section"><h2>누가, 어떻게 실행하나요?</h2><div class="table-wrap" style="margin-top:20px"><table><thead><tr><th scope="col">주체</th><th scope="col">제안 역할</th></tr></thead><tbody><tr><th scope="row">교육부·시도교육청</th><td>정책 기준·인력·예산 확보와 평가 체계 마련</td></tr><tr><th scope="row">교육지원청·학교</th><td>안전 확보, 공식 민원 대응, 복귀 환경 조율</td></tr><tr><th scope="row">케이스매니저·전문가</th><td>사건번호 기반의 법률·심리·행정 협업과 사후관리</td></tr><tr><th scope="row">피해 교원</th><td>필요 지원과 복귀 조건 선택, 속도 조정·지원 재개 요청</td></tr></tbody></table></div></section><section class="section"><div class="section-head"><h2>정책이 기대하는 변화</h2>${badge('기대효과 · 향후 검증','blue')}</div><div class="grid-3">${[['업무 부담 감소','반복 설명·기관 탐색·서류 준비를 줄이고, 학교와 케이스매니저가 대응을 함께 맡는 구조를 목표로 합니다.'],['회복과 복귀의 연속성','사건 종결에서 지원을 끊지 않고 복귀 전 준비와 복귀 후 사후관리까지 연결하는 것을 목표로 합니다.'],['교원 이탈 예방','스트레스·업무 부담, 학교생활 안정도와 신규·현직 교원의 중도이탈 지표를 통해 장기 효과를 검증합니다.']].map(([h,d])=>`<article class="card"><span class="eyebrow">EXPECTED IMPACT</span><h3 style="margin:10px 0">${h}</h3><p class="subtle">${d}</p></article>`).join('')}</div></section><section class="card section"><h2>공식 정책과 제안 정책을 구분합니다</h2><p class="subtle" style="margin-top:10px">1395 상담 안내와 공식 법령은 아래 원문에서 확인할 수 있습니다. 3단계 차등지원, 동일 사건번호·케이스매니저 연속관리, 복귀·사후관리 기간은 본 보고서의 제안 설계입니다.</p><div class="source-list">${sourceLinks()}</div></section>`;}
function sourceLinks(){return POLICY.sources.map(s=>`<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"><span>${s.title}<small>${s.org}</small></span>${icon('external')}</a>`).join('');}
function reportContent(){return `<section class="card"><div class="report-heading"><div><span class="eyebrow">REPORT / 교육정책 5팀</span><h2>제도가 있어도, 지원이 닿지 않는 이유</h2></div>${badge('보고서 근거')}</div><p class="subtle">보고서는 기존 교권보호제도의 실효성과 통합성 부족을 핵심 문제로 보고, 교원이 경험하는 과정을 기준으로 지원체계를 다시 연결합니다.</p><div class="report-stats">${[['4,234','지역교권보호위원회 개최 건수','2024학년도 · 전국'],['32.4%','학생 침해 중 생활지도 불응·방해','2024학년도 · 학생에 의한 침해'],['24.4%','보호자 등의 반복·부당 간섭','2024학년도 · 보호자 등에 의한 침해']].map(([v,t,n])=>`<div class="report-stat"><strong>${v}</strong><span>${t}</span><small>${n}</small></div>`).join('')}</div><p class="report-source">교육부 발표 · 2025.05.13. <a href="https://www.korea.kr/news/policyNewsView.do?newsId=148943122" target="_blank" rel="noopener noreferrer">2024학년도 교육활동 침해 실태조사 원문 ↗</a><br>위원회 개최 건수와 유형별 비중은 서로 다른 지표이며, 접수되지 않은 모든 피해 경험을 나타내지는 않습니다.</p></section>
  <section class="card section"><span class="eyebrow">00 / 개념</span><h2>어떤 문제를 다루나요?</h2><p class="subtle" style="margin-top:14px">교육활동 중인 교원을 향한 폭행·협박·모욕 등과 정당한 교육활동을 방해하는 반복적 부당 간섭 등을 다룹니다. 보고서의 대상은 이로 인해 보호와 회복 지원이 필요한 교원입니다. 개별 행위의 법적 해당 여부는 사실관계와 법령에 따라 판단해야 합니다.</p><div class="actions"><a class="button secondary" href="https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=000886" target="_blank" rel="noopener noreferrer">교원지위법 확인 ${icon('external')}</a></div></section>
  <section class="card section"><span class="eyebrow">01 / 킹던의 정책의 창 모형</span><h2>문제·정책·정치의 흐름을 함께 봅니다</h2><div class="stream-grid">${[['문제 흐름','교육활동 침해가 지속되고, 피해 교원의 법률·심리·행정지원 수요와 현장 체감의 격차가 드러납니다.'],['정책 흐름','교권보호 법체계, 교육활동보호센터, 공제 지원과 기관 중심 민원 대응 등 활용할 정책 기반이 마련되어 있습니다.'],['정치 흐름','서이초 사건 이후의 사회적 관심과 정부·교육청·교육공동체의 논의가 정책 변화의 계기를 만듭니다.']].map(([h,p])=>`<article><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><p class="stream-result">보고서의 해석: 세 흐름이 만나는 시기에, 개별 제도를 연결하는 통합지원 정책을 제안합니다.</p><p class="report-source">정책 기반: <a href="${escapeHTML(POLICY.sources[0].url)}" target="_blank" rel="noopener noreferrer">교육부 2026.01.22. 발표</a>. 발표 당시의 계획을 현재의 시행 완료로 간주하지 않습니다.</p></section>
  <section class="card section"><span class="eyebrow">02 / 기존 제도 분석</span><h2>심의·상담·비용 지원 사이의 공백</h2>${[['지역교권보호위원회','침해 여부의 공식 심의·조치를 담당합니다. 보고서는 절차 진입의 어려움과 심의 전 보호, 결정 이후 지원의 연결을 보완 과제로 제시합니다.'],['교육활동보호센터','상담·치유·법률 지원의 창구입니다. 보고서는 신청 부담을 낮추고, 초기 대응과 학교복귀까지 지원을 이어갈 필요가 있다고 봅니다.'],['교원보호공제·보험','지원 비용의 부담을 줄이는 장치입니다. 보고서는 적용 조건 확인과 증빙·청구 절차를 전담 인력이 함께 처리하는 방안을 제안합니다.']].map(([h,p])=>`<div class="analysis-row"><h3>${h}</h3><p>${p}</p></div>`).join('')}<p class="report-source">보고서의 분석을 요약했습니다. 센터별 사업과 공제·민간보험의 가입·보장 조건은 서로 다르며, 모든 제도가 개인 가입이나 교보위 의결만을 전제로 하는 것은 아닙니다.</p></section>
  <section class="card section"><span class="eyebrow">03—05 / 문제에서 정책 대안으로</span><h2>세 가지 공백, 세 가지 전환</h2><div class="table-wrap" style="margin-top:22px"><table><thead><tr><th scope="col">보고서가 짚은 문제</th><th scope="col">정책 목표</th><th scope="col">화면에서 살펴보기</th></tr></thead><tbody>${[['사후 대응 중심','사전예방·현장 초기대응까지 확대','prevention','사전예방'],['제도 접근성과 보호 사각지대','공식 인정 전 필요한 상담·보호 연결','case','사안 작성·진단'],['제도 간 분절','같은 사건번호로 지원·복귀·사후관리 연결','support','통합지원']].map(([p,g,r,n])=>`<tr><th scope="row">${p}</th><td>${g}</td><td><a href="#${r}" class="text-link">${n} ${icon('arrow')}</a></td></tr>`).join('')}</tbody></table></div></section>`;}
function policyPage(){return `${title('한 사람의 회복을 중심에 둔 정책','사건 처리의 완료보다, 안전한 학교생활의 지속을 목표로 합니다.','POLICY & IMPACT')}${tabs('policy',[['overview','정책 방향'],['report','보고서 근거'],['stats','평가지표 예시']],state.policyTab)}${state.policyTab==='stats'?statsContent():state.policyTab==='report'?reportContent():policyOverview()}`;}

function resourceCards(){const items=POLICY.resources.filter(r=>state.resourceFilter==='전체'||r.type===state.resourceFilter);return items.map(r=>`<article class="card support-card">${badge(r.type,'blue')}<h3 style="margin-top:15px">${r.title}</h3><p>${r.desc}</p><div class="actions">${action('내용 보기','resource',`data-value="${r.id}"`,'secondary')}${action(icon('download')+' TXT','download-resource',`data-value="${r.id}"`,'secondary')}</div></article>`).join('');}
function resourcesPage(){return `${title('필요한 자료와 공식 지원 경로','기록·복귀계획 초안을 준비하고, 실제 지원은 관할 기관에서 확인하세요.','GUIDES & RESOURCES')}
  <div class="notice">자료는 정책 체험을 위한 <strong>작성용 초안(TXT)</strong>입니다. 공식 신고서가 아니며 실제 제출에는 관할 교육청의 최신 서식을 사용하세요.</div><div class="tabs" aria-label="자료 분류">${['전체',...new Set(POLICY.resources.map(r=>r.type))].map(f=>`<button data-action="resource-filter" data-value="${f}" aria-pressed="${state.resourceFilter===f}">${f}</button>`).join('')}</div><div class="grid-2" id="resource-cards">${resourceCards()}</div>
  <div class="grid-2 section"><section class="card"><span class="eyebrow">OFFICIAL SUPPORT</span><h2>실제 상담은 공식 창구로</h2><p class="subtle" style="margin-top:12px">소속 시·도교육청의 지역번호 + 1395로 상담 경로를 확인하세요. 긴급한 위험은 112로 신고할 수 있습니다. 지역별 지원 대상·절차·운영시간은 담당 기관에서 확인해 주세요.</p><div class="urgent-actions"><a href="#resources" data-action="contact" aria-label="지역번호를 포함한 교권 상담 연결 안내"><strong>1395</strong>교권 상담</a><a href="tel:112"><strong>112</strong>긴급 신고</a></div><div class="actions"><a class="button secondary" href="https://www.moe.go.kr" target="_blank" rel="noopener noreferrer">교육부 공식 홈페이지 ${icon('external')}</a></div><p class="subtle" style="margin-top:12px">교육부 홈페이지의 ‘교육부 소개 → 시·도교육청’에서 학교 소재 지역 교육청을 찾을 수 있습니다.</p></section><section class="card"><h2>정책·법령 원문</h2><div class="source-list">${sourceLinks()}</div></section></div>
  <section class="section"><div class="section-head"><h2>자주 묻는 질문</h2></div><div class="stack">${[['여기에 작성하면 실제 신고가 접수되나요?','아니요. 이 홈페이지는 교육정책 5팀의 정책 제안 체험판입니다. 입력한 내용은 기관에 전송되지 않습니다. 실제 지원은 학교 관리자와 관할 교육청·1395에서 확인하세요.'],['작성한 내용은 어디에 저장되나요?','브라우저가 현재 페이지를 열어 둔 동안만 유지됩니다. 메뉴를 옮겨도 내용은 유지되지만 새로고침하면 초기화됩니다. 필요한 기록과 설계서는 TXT 파일로 내려받을 수 있습니다.'],['심각도와 재발 위험도는 어떻게 다른가요?','심각도 1~3단계는 사안 발생 시의 지원 강도를 설명합니다. 재발 위험도 낮음~매우 높음은 종결 이후 관리 기간과 수준을 설명하는 별도의 제안 기준입니다.'],['복귀나 상담 참여를 보류할 수 있나요?','보고서의 제안 정책은 교원의 자기결정권을 중심에 둡니다. 상담·관계회복 프로그램 참여와 직접 접촉 여부를 선택하고 업무 확대를 보류할 수 있도록 설계했습니다. 실제 적용은 학교·관할 기관과 확인해야 합니다.']].map(([q,a])=>`<details class="accordion"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;}

// ===== T-Care motion & interaction layer =====
let revealObserver=null;
const countFrames=new Set();
const motionReduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateCount(node){
  const final=node.dataset.countFinal;
  const match=final.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if(!match||motionReduced()||typeof requestAnimationFrame!=='function')return;
  const value=Number(match[1].replaceAll(',',''));
  const decimals=(match[1].split('.')[1]||'').length;
  const format=new Intl.NumberFormat('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals,useGrouping:match[1].includes(',')});
  let start;
  const queue=()=>{const id=requestAnimationFrame(time=>{countFrames.delete(id);tick(time);});countFrames.add(id);};
  const tick=time=>{
    if(!node.isConnected)return;
    start??=time;
    const progress=motionReduced()?1:Math.min((time-start)/1300,1);
    node.textContent=progress===1?final:format.format(Math.floor(value*(1-Math.pow(1-progress,3))*10**decimals)/10**decimals)+match[2];
    if(progress<1)queue();
  };
  queue();
}
function flashSwap(node){if(!node)return;node.classList.remove('swap-flash');void node.offsetWidth;node.classList.add('swap-flash');}
function updateScrollProgress(){
  const bar=$('#scroll-progress-bar');if(!bar)return;
  const max=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
  bar.style.transform=`scaleX(${Math.min(1,Math.max(0,window.scrollY/max))})`;
}
function animateCharts(){
  if(motionReduced())return;
  $$('.bar-track span').forEach((span,i)=>{const width=span.style.width||getComputedStyle(span).width;span.style.width='0';setTimeout(()=>span.style.width=width,100+i*110);});
  const line=$('.chart-svg polyline');if(line&&typeof line.getTotalLength==='function'&&typeof requestAnimationFrame==='function'){const len=line.getTotalLength();line.style.strokeDasharray=String(len);line.style.strokeDashoffset=String(len);line.style.transition='stroke-dashoffset 1.15s cubic-bezier(.2,.7,.2,1)';requestAnimationFrame(()=>requestAnimationFrame(()=>line.style.strokeDashoffset='0'));}
}
function updateJourneyProgress(){
  const journey=$('.journey');if(!journey)return;
  const active=$$('.journey button').findIndex(b=>b.getAttribute('aria-pressed')==='true');
  journey.style.setProperty('--journey-progress',`${((Math.max(active,0)+1)/5)*100}%`);
}
function enhancePage(){
  countFrames.forEach(id=>cancelAnimationFrame(id));countFrames.clear();
  document.documentElement.classList.add('motion-ready');
  const main=$('#main');if(!main)return;
  main.classList.remove('page-enter');void main.offsetWidth;main.classList.add('page-enter');
  const hoverables=main.querySelectorAll('.grid-2 > .card,.grid-3 > .card,.bottom-grid > .card,.two-column .case-summary');hoverables.forEach(el=>el.classList.add('interactive-card'));
  const numbers=[...main.querySelectorAll('.report-stat strong, .metric strong, .bar-row strong, .chart-svg text')].filter(el=>/^\d[\d,.]*(?:%|시간|건| \/ 5)?$/.test(el.textContent));
  numbers.forEach(el=>{el.dataset.countFinal=el.textContent;el.setAttribute('aria-label',el.textContent);});
  const headings=[...main.querySelectorAll('h1, h2, .quote, .hero > p')];
  headings.forEach(el=>el.classList.add('text-rise'));
  const candidates=[...main.children,...main.querySelectorAll('.grid-2 > *, .grid-3 > *, .support-shortcuts > *, .metrics > *'),...headings,...numbers];
  const targets=[...new Set(candidates)].filter(el=>!el.hidden);
  if(revealObserver)revealObserver.disconnect();
  if(motionReduced()||!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('reveal','is-visible'));}
  else{
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');if(entry.target.dataset.countFinal)animateCount(entry.target);revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -4%'});
    targets.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',`${Math.min(i,8)*35}ms`);revealObserver.observe(el);});
  }
  animateCharts();updateJourneyProgress();updateScrollProgress();
}
// ===== /T-Care motion & interaction layer =====
const pages={home:homePage,prevention:preventionPage,case:casePage,support:supportPage,return:returnPage,recurrence:recurrencePage,policy:policyPage,resources:resourcesPage};
function renderPage(focus=false){
  $('#main').innerHTML=pages[state.page]();
  const label=POLICY.nav.find(([key])=>key===state.page)[1];
  $('#page-label').textContent=label;
  document.title=`${label} | T-Care · 교원 통합지원`;
  $('#primary-nav').innerHTML=POLICY.nav.map(([key,label,ico],i)=>`${i===6?'<div class="nav-separator"></div>':''}<a href="#${key}" class="nav-item ${state.page===key?'active':''}"${state.page===key?' aria-current="page"':''}>${icon(ico)}${label}</a>`).join('');
  enhancePage();
  if(focus){window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});}
}
function navigate(page){if(!pages[page])page='home';if(location.hash==='#'+page){state.page=page;renderPage(true);}else location.hash=page;closeMenu();}
function route(){const key=location.hash.slice(1);if(key==='main')return;state.page=pages[key]?key:'home';renderPage(true);closeMenu();}
function toast(message){clearTimeout(toast.timer);$('#toast').textContent=message;$('#toast').classList.add('show');toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3300);}
let modalOpener=null;
function openModal(html,eyebrow='T-Care 안내'){modalOpener=document.activeElement;$('#modal-body').innerHTML=html;$('#modal-eyebrow').textContent=eyebrow;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){$('#modal').close();}
$('#modal').addEventListener('close',()=>{if(modalOpener?.isConnected)modalOpener.focus();});
$('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
function openSimulation(){state.simulationStep=0;openModal('','가상 사례 · 기관 전송 없음');renderSimulation();}
function renderSimulation(){const step=state.simulationStep,s=POLICY.simulation[step];$('#modal-body').innerHTML=`<progress class="modal-progress" value="${step+1}" max="${POLICY.simulation.length}" aria-label="사건 흐름 진행률"></progress><div class="simulation-body"><div class="simulation-number" aria-hidden="true">${String(step+1).padStart(2,'0')}</div><h2 id="modal-title" tabindex="-1">${s[0]}</h2><p>${s[2]}</p></div><div class="simulation-meta"><span>주요 담당 <strong>${s[1]}</strong></span>${badge(s[3],'blue')}</div><div class="simulation-controls">${action('이전','sim-prev',step===0?'disabled':'','secondary')}<span class="subtle">${step+1} / ${POLICY.simulation.length}</span>${action(step===POLICY.simulation.length-1?'체험 마치기':'다음 '+icon('arrow'),step===POLICY.simulation.length-1?'close-modal':'sim-next')}</div>`;$('#modal-title').focus();}
function download(name,lines){const content='T-Care · 교육정책 5팀 정책 제안 체험\r\n※ 작성용 초안입니다. 기관에 제출되거나 접수된 문서가 아닙니다.\r\n\r\n'+lines.join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF',content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('TXT 파일 다운로드를 시작했습니다.');}
function recordLines(){const c=state.caseRecord;if(!c)return [];return ['사건번호: '+c.id,'발생 일시: '+c.date.replace('T',' '),'장소: '+c.place,'관련 주체: '+c.actor,'필요한 보호: '+c.urgency,'사안 내용: '+c.notes,'관련 자료: '+(c.evidence.join(', ')||'선택 없음'),'지원 단계: '+(c.level?c.level+'단계 (체험)':'진단 전')];}
function planLines(){const p=state.plan;return ['학교복귀 설계서',state.caseRecord?'연결 사건: '+state.caseRecord.id:'독립 작성 초안','복귀 예정일: '+(p.date||'협의 후 결정'),'복귀 방식: '+p.mode,'업무 속도: '+p.pace,'접촉 범위: '+p.contact,'지원인력: '+(p.people.join(', ')||'선택 없음'),'상담·관계회복: '+p.counsel,'학교와 조율할 내용: '+(p.notes||'없음'),'제안 일정: 복귀 전 2~4주 준비 / 복귀 후 3개월 집중관리','격주 관리자 면담, 월 1회 피드백을 통해 조건 조정','교원 의사에 따른 업무 확대 보류·프로그램 거부·지원 재개 가능'];}
function openResource(id){const r=POLICY.resources.find(r=>r.id===id);if(!r)return;openModal(`<h2 id="modal-title">${r.title}</h2><p>${r.desc}</p><div class="notice" style="margin-top:18px">공식 제출용 서식이 아닌, 정책 제안 체험용 초안입니다.</div>${list(r.lines.slice(1))}<div class="actions">${action(icon('download')+' TXT 내려받기','download-resource',`data-value="${r.id}"`)}</div>`,'자료실 · '+r.type);}
function openSearch(){openModal('<h2 id="modal-title">어떤 지원을 찾으세요?</h2><label class="sr-only" for="search-query">지원·자료 검색어</label><input class="search-input" id="search-query" type="search" placeholder="법률, 복귀, 치료비, 사건번호…" autocomplete="off"><div class="search-results" id="search-results" aria-live="polite"></div>','통합검색');renderSearch('');$('#search-query').focus();}
function renderSearch(query){const q=query.trim().replace(/\s+/g,'').toLowerCase();const entries=[
  ...POLICY.nav.map(([route,label])=>({title:label,desc:({home:'지원 현황과 전체 경로',prevention:'예방교육 실태조사 학생 학부모',case:'사안 기록 신고 진술 심각도 자가진단 교보위 교권보호위원회',support:'법률상담 심리상담 치료비 공제 보험 행정 케이스매니저',return:'복귀설계서 업무 조정 선택권',recurrence:'재발 위험도 3개월 6개월 사후관리',policy:'정책 목표 통계 성과 평가',resources:'다운로드 서식 지원기관 1395 상담'}[route]),route})),
  ...POLICY.resources.map(r=>({title:r.title,desc:r.desc,resource:r.id})),
  ...(state.caseRecord?[{title:state.caseRecord.id,desc:state.caseRecord.notes,record:true}]:[])
];const results=entries.filter(e=>(e.title+e.desc).replace(/\s+/g,'').toLowerCase().includes(q));$('#search-results').innerHTML=results.length?results.map(e=>`<button class="search-result" data-action="search-open" ${e.route?`data-route="${e.route}"`:e.resource?`data-resource="${e.resource}"`:'data-record="true"'}><strong>${escapeHTML(e.title)}</strong><small>${escapeHTML(e.desc)}</small></button>`).join(''):'<div class="empty">일치하는 결과가 없습니다.<br>‘법률’, ‘복귀’, ‘서식’처럼 짧은 단어로 검색해 보세요.</div>';}

function closeMenu(){$('#sidebar').classList.remove('open');$('#nav-scrim').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');$('#sidebar').inert=matchMedia('(max-width:760px)').matches;}
$('#menu-toggle').addEventListener('click',()=>{const open=!$('#sidebar').classList.contains('open');if(!open){closeMenu();return;}$('#sidebar').inert=false;$('#sidebar').classList.add('open');$('#nav-scrim').hidden=false;$('#menu-toggle').setAttribute('aria-expanded','true');$('#sidebar a').focus();});
$('#nav-scrim').addEventListener('click',closeMenu);
matchMedia('(max-width:760px)').addEventListener('change',closeMenu);
$('#text-size').addEventListener('click',()=>{const enlarged=$('#text-size').getAttribute('aria-pressed')!=='true';document.documentElement.style.fontSize=enlarged?'18px':'16px';$('#text-size').setAttribute('aria-pressed',String(enlarged));$('#text-size').setAttribute('aria-label',enlarged?'글자 크기 기본으로':'글자 크기 확대');});

document.addEventListener('input',event=>{
  const el=event.target;if(el.id==='search-query'){renderSearch(el.value);return;}
  if(el.dataset.scope){state[el.dataset.scope][el.dataset.field]=el.value;if(el.dataset.scope==='plan'){state.planSaved=false;$('#plan-summary').innerHTML=planSummary();}}
});
document.addEventListener('change',event=>{
  const el=event.target;if(el.dataset.scope){state[el.dataset.scope][el.dataset.field]=el.value;if(el.dataset.scope==='plan'){state.planSaved=false;$('#plan-summary').innerHTML=planSummary();}}
  const key=el.dataset.list;if(!key)return;const target=key==='people'?state.plan:key==='evidence'?state.draft:state;
  const value=['people','evidence'].includes(key)?el.value:Number(el.value);
  target[key]=el.checked?[...new Set([...target[key],value])]:target[key].filter(v=>v!==value);
  if(key==='riskSelection'){$('#diagnosis-result').className='result-card level-'+maxRisk();$('#diagnosis-result').innerHTML=diagnosisResult();flashSwap($('#diagnosis-result'));}
  if(key==='preventionChecks'){ $('#prevention-count').textContent=state.preventionChecks.length+' / 6'; flashSwap($('#prevention-count')); }
  if(key==='followupChecks'){ $('#followup-count').textContent=state.followupChecks.length+' / 6'; flashSwap($('#followup-count')); }
  if(key==='people'){state.planSaved=false;$('#plan-summary').innerHTML=planSummary();}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='case-form'){
    event.preventDefault();if(!event.target.reportValidity())return;
    if(state.draft.notes.trim().length<10){$('#case-feedback').textContent='사안 내용을 공백 제외 10자 이상으로 입력해 주세요.';$('#draft-notes').focus();return;}
    if(new Date(state.draft.date)>new Date()){$('#case-feedback').textContent='발생 일시는 현재보다 미래일 수 없습니다.';return;}
    const old=state.caseRecord;
    const id=old?.id||'DEMO-'+new Date().getFullYear()+'-'+String(++state.caseCounter).padStart(4,'0');
    state.caseRecord={...state.draft,evidence:[...state.draft.evidence],id,level:0,phase:1,stage:'심각도 확인 대기'};
    // 기록이 바뀌면 이전 사안의 진단·지원·복귀·사후관리 결과가 섞이지 않도록 이후 단계를 초기화합니다.
    state.riskSelection=[];state.supportLevel=2;state.selectedSupports=[];state.plan=defaultPlan();state.planSaved=false;
    state.followupChecks=[];state.recurrenceRisk='보통';state.recurrenceDetected=false;state.caseTab='diagnosis';
    renderPage(true);toast('체험 기록을 만들었습니다. 기관에 전송되지 않습니다.');
  }
  if(event.target.id==='plan-form'){event.preventDefault();state.planSaved=true;if(state.caseRecord){state.caseRecord.phase=3;state.caseRecord.stage='학교복귀 계획 작성';}$('#plan-summary').innerHTML=planSummary();toast('복귀 계획을 현재 화면에 반영했습니다.');}
});

document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const value=el.dataset.value;
  switch(el.dataset.action){
    case 'search':openSearch();break;
    case 'contact':event.preventDefault();openModal('<h2 id="modal-title">지역번호 + 1395로 연결하세요</h2><p>교권 상담은 소속 시·도교육청의 지역번호를 포함해 전화해 주세요. 예를 들어 인천광역시교육청은 032-1395입니다. 지역별 운영시간과 지원 내용은 해당 교육청에서 확인할 수 있습니다.</p><div class="actions"><a class="button secondary" href="https://www.ice.go.kr/ice/na/ntt/selectNttInfo.do?mi=11822&nttSn=3369375" target="_blank" rel="noopener noreferrer">공식 연락처 안내 확인 ↗</a><a class="button danger" href="tel:112">긴급 신고 112</a></div>','공식 상담 경로');break;
    case 'close-modal':closeModal();break;
    case 'about':openModal('<h2 id="modal-title">T-Care 이용안내</h2><p>교육정책 5팀의 보고서를 바탕으로 만든 정책 제안 체험 홈페이지입니다. 화면에서 생성한 사건번호·지원 계획은 실제 기관의 접수 기록이 아닙니다.</p>'+list(['입력값은 현재 페이지의 메모리에서만 유지되며 새로고침하면 초기화됩니다.','기관 전송, 실제 상담 예약, 관리자 알림, 파일 업로드는 제공하지 않습니다.','사안 기록·지원 계획·복귀설계서는 TXT로 내려받을 수 있습니다.','실제 신고·지원은 학교 관리자, 관할 교육청, 1395 등 공식 창구로 확인하세요.']));break;
    case 'simulation':openSimulation();break;
    case 'sim-prev':state.simulationStep=Math.max(0,state.simulationStep-1);renderSimulation();break;
    case 'sim-next':state.simulationStep=Math.min(POLICY.simulation.length-1,state.simulationStep+1);renderSimulation();break;
    case 'journey':{state.journey=Number(value);const j=POLICY.journey[state.journey];$$('.journey button').forEach((b,i)=>{b.classList.toggle('active',i===state.journey);b.setAttribute('aria-pressed',String(i===state.journey));});$('#journey-detail').innerHTML=`<p>${j.desc}</p><a href="#${j.route}">${j.title} 자세히 ${icon('chevron')}</a>`;updateJourneyProgress();flashSwap($('#journey-detail'));break;}
    case 'tab':state[el.dataset.group==='case'?'caseTab':'policyTab']=value;renderPage();$(`[data-group="${el.dataset.group}"][data-value="${value}"]`).focus();break;
    case 'fill-example':state.draft={date:localDateTime(),place:'전화·문자',actor:'학부모·보호자',urgency:'접촉·분리조치 검토',notes:'가상의 보호자로부터 정당한 교육활동에 대한 반복적인 간섭과 민원 연락을 받아 수업 준비와 교육활동에 어려움이 생겼습니다.',evidence:['문자·이메일','사안 기록']};renderPage();$('#draft-date').focus();break;
    case 'go-diagnosis':state.caseTab='diagnosis';navigate('case');break;
    case 'preview-level':state.supportLevel=Number(value);renderPage();$(`[data-action="preview-level"][data-value="${value}"]`).focus();break;
    case 'apply-diagnosis':{const level=maxRisk();if(!level)return;state.supportLevel=level;if(state.caseRecord){state.caseRecord.level=level;state.caseRecord.phase=2;state.caseRecord.stage=level===1?'기록·모니터링':'통합지원 계획';}navigate('support');break;}
    case 'select-support':if(!state.caseRecord){state.caseTab='record';navigate('case');toast('먼저 체험 사안을 작성하면 지원 계획을 연결할 수 있습니다.');break;}if(!state.caseRecord.level){state.caseTab='diagnosis';navigate('case');toast('지원 단계부터 확인해 주세요.');break;}state.selectedSupports=state.selectedSupports.includes(value)?state.selectedSupports.filter(k=>k!==value):[...state.selectedSupports,value];renderPage();$(`[data-action="select-support"][data-value="${value}"]`).focus();break;
    case 'case-detail':if(state.caseRecord)openModal(`<h2 id="modal-title">체험 사안 기록</h2><span class="case-id">${escapeHTML(state.caseRecord.id)}</span>${list(recordLines().slice(1))}<div class="actions">${action(icon('download')+' 기록 내려받기','download-case')}</div>`);break;
    case 'download-case':if(state.caseRecord)download(state.caseRecord.id,recordLines());break;
    case 'download-support':if(state.caseRecord&&state.selectedSupports.length)download('T-Care_지원계획',[...recordLines(),'','선택한 지원 계획',...state.selectedSupports.flatMap(k=>[POLICY.support.find(s=>s.key===k).name,...POLICY.severity[currentLevel()][k]])]);break;
    case 'download-plan':download('T-Care_복귀설계서',planLines());break;
    case 'download-prevention':download('T-Care_예방준비점검',POLICY.preventionChecks.map((t,i)=>(state.preventionChecks.includes(i)?'☑ ':'□ ')+t));break;
    case 'download-followup':download('T-Care_사후관리점검',['선택한 위험도 시나리오: '+state.recurrenceRisk,...Object.values(POLICY.recurrence[state.recurrenceRisk]),...POLICY.followupChecks.map((t,i)=>(state.followupChecks.includes(i)?'☑ ':'□ ')+t)]);break;
    case 'risk-level':state.recurrenceRisk=value;$$('.risk-buttons button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===value)));$('#recurrence-details').innerHTML=recurrenceDetails();flashSwap($('#recurrence-details'));break;
    case 'simulate-recurrence':state.recurrenceDetected=true;$('#recurrence-scenario').innerHTML=recurrenceScenario();flashSwap($('#recurrence-scenario'));$('#recurrence-scenario').setAttribute('tabindex','-1');$('#recurrence-scenario').focus();break;
    case 'reset-recurrence':state.recurrenceDetected=false;$('#recurrence-scenario').innerHTML=recurrenceScenario();flashSwap($('#recurrence-scenario'));$('[data-action="simulate-recurrence"]').focus();break;
    case 'resource':openResource(value);break;
    case 'download-resource':{const r=POLICY.resources.find(r=>r.id===value);if(r)download(r.title,r.lines);break;}
    case 'resource-filter':state.resourceFilter=value;$$('[data-action="resource-filter"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===value)));$('#resource-cards').innerHTML=resourceCards();$$('#resource-cards > *').forEach((card,i)=>{card.classList.add('swap-flash');card.style.animationDelay=`${i*45}ms`;});break;
    case 'search-open':if(el.dataset.resource){openResource(el.dataset.resource);}else if(el.dataset.record){closeModal();state.caseTab='record';navigate('case');}else{closeModal();navigate(el.dataset.route);}break;
  }
});
document.addEventListener('keydown',event=>{
  if(event.key==='/'&&!$('#modal').open&&!['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)){event.preventDefault();openSearch();}
  if(event.key==='Escape'&&$('#sidebar').classList.contains('open')){closeMenu();$('#menu-toggle').focus();}
});
window.addEventListener('scroll',updateScrollProgress,{passive:true});
window.addEventListener('resize',updateScrollProgress,{passive:true});
window.addEventListener('hashchange',route);
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
state.page=pages[location.hash.slice(1)]?location.hash.slice(1):'home';
renderPage();closeMenu();
