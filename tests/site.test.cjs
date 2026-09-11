const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname,'..');

function setup() {
  const errors=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{
    url:'http://localhost/',runScripts:'outside-only',virtualConsole
  });
  const w=dom.window;
  w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.scrollTo=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  const blobs=[];
  w.URL.createObjectURL=blob=>{blobs.push(blob);return 'blob:local-file';};
  w.URL.revokeObjectURL=()=>{};
  const downloads=[];
  w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
  w.eval(fs.readFileSync(path.join(root,'assets/policy-data.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'assets/app.js'),'utf8'));
  const $=s=>w.document.querySelector(s);
  const click=s=>{assert.ok($(s),`Missing control ${s}`);$(s).click();};
  const input=(s,value)=>{$(s).value=value;$(s).dispatchEvent(new w.Event('input',{bubbles:true}));};
  const route=page=>{w.location.hash=page;w.dispatchEvent(new w.HashChangeEvent('hashchange'));};
  const submit=s=>$(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  return {dom,w,$,click,input,route,submit,errors,downloads,blobs};
}

test('all eight routes render and unknown routes recover to home',()=>{
  const a=setup();
  for(const route of ['home','prevention','case','support','return','recurrence','policy','resources','unknown']) {
    a.route(route);assert.ok(a.$('main h1'));assert.equal(a.w.document.querySelectorAll('h1').length,1);
    const ids=[...a.w.document.querySelectorAll('[id]')].map(e=>e.id);
    assert.equal(new Set(ids).size,ids.length,'Unique element IDs');
  }
  assert.match(a.$('h1').textContent,/안심/);assert.deepEqual(a.errors,[]);a.dom.window.close();
});

test('home journey, report evidence and severity previews stay connected',()=>{
  const a=setup();
  a.click('[data-action="journey"][data-value="3"]');
  assert.match(a.$('#journey-detail').textContent,/2~4주/);
  assert.equal(a.$('#journey-detail a').getAttribute('href'),'#return');
  a.route('support');a.click('[data-action="preview-level"][data-value="1"]');
  assert.match(a.$('main .notice').textContent,/현재 1단계/);
  assert.match(a.$('main').textContent,/케이스매니저 미배정/);
  a.click('[data-action="preview-level"][data-value="3"]');
  assert.match(a.$('main').textContent,/전담 변호사 1:1/);
  a.route('policy');a.click('[data-group="policy"][data-value="report"]');
  assert.match(a.$('main').textContent,/킹던/);
  assert.equal(a.w.document.querySelectorAll('.report-stat').length,3);
  assert.match(a.$('main').textContent,/2024학년도/);
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});

test('revising a case clears dependent support, return and follow-up state',()=>{
  const a=setup();a.route('case');a.click('[data-action="fill-example"]');a.submit('#case-form');
  a.click('[data-list="riskSelection"][value="4"]');a.click('[data-action="apply-diagnosis"]');
  a.route('support');a.click('[data-action="select-support"][data-value="legal"]');
  a.route('return');a.input('#plan-notes','이전 기록의 복귀 계획');a.submit('#plan-form');
  a.route('case');a.click('[data-group="case"][data-value="record"]');
  a.input('#draft-notes','내용을 수정한 새로운 체험 사안입니다.');a.submit('#case-form');
  assert.match(a.$('#diagnosis-result').textContent,/미선택/);
  a.route('return');assert.equal(a.$('#plan-notes').value,'');
  a.route('support');assert.ok(a.$('[data-action="download-support"]').disabled);
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});

test('case record → diagnosis → support → return workflow preserves values and downloads',()=>{
  const a=setup();a.route('case');a.click('[data-action="fill-example"]');
  a.submit('#case-form');assert.ok(a.$('#diagnosis-result'));
  a.click('[data-list="riskSelection"][value="3"]');
  a.click('[data-list="riskSelection"][value="4"]');
  assert.match(a.$('#diagnosis-result').textContent,/3단계/);
  a.click('[data-list="riskSelection"][value="4"]');
  assert.match(a.$('#diagnosis-result').textContent,/2단계/);
  a.click('[data-action="apply-diagnosis"]');a.route('support');
  a.click('[data-action="select-support"][data-value="legal"]');
  a.click('[data-action="select-support"][data-value="mind"]');
  assert.equal(a.$('[data-value="legal"]').getAttribute('aria-pressed'),'true');
  a.click('[data-action="download-support"]');assert.equal(a.downloads.at(-1),'T-Care_지원계획.txt');
  a.route('return');a.input('#plan-notes','시간표와 업무 범위를 매주 조율합니다.');
  a.submit('#plan-form');assert.match(a.$('#plan-summary').textContent,/화면에 반영됨/);
  a.route('home');assert.match(a.$('main').textContent,/학교복귀 계획 작성/);
  a.route('return');assert.match(a.$('#plan-notes').value,/매주 조율/);
  a.click('[data-action="download-plan"]');assert.equal(a.downloads.at(-1),'T-Care_복귀설계서.txt');
  a.route('case');a.click('[data-value="record"]');
  a.click('[data-action="download-case"]');assert.match(a.downloads.at(-1),/^DEMO-\d{4}-0001.txt$/);
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});

test('empty and whitespace-only records cannot create a case',()=>{
  const a=setup();a.route('case');a.submit('#case-form');assert.ok(a.$('#case-form'));
  a.click('[data-action="fill-example"]');a.input('#draft-notes','           ');a.submit('#case-form');
  assert.match(a.$('#case-feedback').textContent,/10자/);assert.ok(a.$('#case-form'));
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});

test('user HTML remains text in case, plan, and search result rendering',()=>{
  const a=setup();a.route('case');a.click('[data-action="fill-example"]');
  a.input('#draft-notes','<img src=x onerror="window.pwned=true"> 가상 사안 테스트');a.submit('#case-form');
  a.route('home');assert.equal(a.$('main img'),null);assert.equal(a.w.pwned,undefined);
  a.click('[data-action="search"]');a.input('#search-query','<img');
  assert.equal(a.$('#search-results img'),null);assert.match(a.$('#search-results').textContent,/<img/);
  a.click('[data-action="close-modal"]');a.route('return');
  a.input('#plan-notes','<script>alert(1)</script>');assert.equal(a.$('#plan-summary script'),null);
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});

test('search empty results, resources, recurrence and simulation work',()=>{
  const a=setup();a.click('[data-action="search"]');a.input('#search-query','치료비');
  assert.ok(a.$('[data-action="search-open"][data-route="support"]'));
  a.input('#search-query','no-such-content-987');assert.match(a.$('#search-results').textContent,/결과가 없습니다/);
  a.click('[data-action="close-modal"]');a.route('resources');
  a.click('[data-action="resource-filter"][data-value="예방교육"]');
  assert.equal(a.w.document.querySelectorAll('#resource-cards article').length,1);
  a.click('[data-action="resource"][data-value="lesson"]');a.click('[data-action="download-resource"][data-value="lesson"]');
  assert.match(a.downloads.at(-1),/예방수업/);a.click('[data-action="close-modal"]');
  a.route('recurrence');a.click('[data-action="risk-level"][data-value="매우 높음"]');
  assert.match(a.$('#recurrence-details').textContent,/6개월 이상/);
  a.click('[data-action="simulate-recurrence"]');assert.match(a.$('#recurrence-scenario').textContent,/실제 보고.*아닙니다/);
  a.click('[data-action="reset-recurrence"]');assert.ok(a.$('[data-action="simulate-recurrence"]'));
  a.click('[data-action="simulation"]');assert.ok(a.$('[data-action="sim-prev"]').disabled);
  for(let i=0;i<13;i++)a.click('[data-action="sim-next"]');
  assert.match(a.$('#modal-title').textContent,/다시 연결될 권리/);assert.equal(a.$('[data-action="sim-next"]'),null);
  a.click('.simulation-controls [data-action="close-modal"]');assert.equal(a.$('#modal').open,false);
  a.route('policy');a.click('[data-value="stats"]');assert.match(a.$('main').textContent,/가상의 정책 평가 예시/);
  assert.deepEqual(a.errors,[]);a.dom.window.close();
});
