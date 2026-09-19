/* 冒烟测试：node _smoke.js  （需 NODE_PATH 指向 jsdom 工作区） */
const { JSDOM } = require('jsdom');
const path = require('path');

const errors = [];
const logs = [];

JSDOM.fromFile(path.join(__dirname, 'index.html'), {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  url: 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/')
}).then(async (dom) => {
  const { window } = dom;
  window.addEventListener('error', e => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));
  const origErr = console.error;
  window.console.error = (...a) => { errors.push('console.error: ' + a.join(' ')); };
  window.console.log = (...a) => { logs.push(a.join(' ')); };

  await new Promise(r => setTimeout(r, 800));

  const doc = window.document;
  const G = window.GOS;
  const $ = s => doc.querySelector(s);
  const $$ = s => Array.from(doc.querySelectorAll(s));

  const results = [];
  const check = (name, cond, extra) => results.push({ name, ok: !!cond, extra: extra || '' });

  check('GOS 已初始化', !!G);
  check('5 个 Tab', $$('.tabbar__item').length === 5, $$('.tabbar__item').length);
  check('今日页已渲染', !!$('.tab-pane[data-tab="today"] .page'));
  check('今日行动 5 项', $$('.tab-pane[data-tab="today"] .action-item').length === 5,
    $$('.tab-pane[data-tab="today"] .action-item').length);
  check('今日完成率 72%', /72/.test($('[data-hero-pct]') && $('[data-hero-pct]').textContent || ''),
    $('[data-hero-pct]') && $('[data-hero-pct]').textContent);
  check('周报入口存在', !!$('.weekly-teaser'));
  check('FAB 存在', !!$('.fab'));
  check('成长页领域 4 个', $$('.tab-pane[data-tab="growth"] .area-card[data-area]').length === 4);
  check('成长页目标 6 个', $$('.tab-pane[data-tab="growth"] .goal-card').length === 6,
    $$('.tab-pane[data-tab="growth"] .goal-card').length);
  check('灵感页有卡片', $$('.tab-pane[data-tab="capture"] .insp-card').length >= 10,
    $$('.tab-pane[data-tab="capture"] .insp-card').length);
  check('阅读页书架 3 本', $$('.tab-pane[data-tab="reading"] .book-card').length === 3);
  check('我的页 4 个数据入口', $$('.tab-pane[data-tab="me"] [data-stats]').length === 4);
  check('我的页 7 个设置入口', $$('.tab-pane[data-tab="me"] [data-setting]').length === 7);

  function click(el) {
    if (!el) return false;
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }

  /* 逐个路由 */
  const routes = ['#/growth', '#/capture', '#/reading', '#/me', '#/weekly', '#/goal/g1',
    '#/book/b1', '#/notifications', '#/stats/trend', '#/stats/habit', '#/stats/reading',
    '#/stats/inspiration', '#/theme', '#/about', '#/settings/calendar'];
  for (const r of routes) {
    window.location.hash = r;
    await new Promise(res => setTimeout(res, 120));
    const isTab = ['#/growth', '#/capture', '#/reading', '#/me'].indexOf(r) > -1;
    if (isTab) {
      const t = r.slice(2);
      check('路由 ' + r, !!$('.tab-pane[data-tab="' + t + '"].is-active'));
    } else {
      const page = $('.stack-page');
      check('路由 ' + r, !!page && page.querySelector('.page') !== null);
    }
  }
  window.location.hash = '#/today';
  await new Promise(res => setTimeout(res, 200));

  /* 周报页数字 */
  window.location.hash = '#/weekly';
  await new Promise(res => setTimeout(res, 1100));
  const heroVal = $('.stack-page [data-count-to]');
  check('周报时长 count-up', heroVal && /6h/.test(heroVal.textContent), heroVal && heroVal.textContent);
  check('周报 7 根柱', $$('.bar-col').length === 7);
  window.location.hash = '#/today';
  await new Promise(res => setTimeout(res, 200));

  /* 完成任务闭环 */
  const dot = $('.tab-pane[data-tab="today"] .action-item[data-status="pending"] .status-dot');
  const before = G.select.todayStats().doneMin;
  click(dot);
  await new Promise(res => setTimeout(res, 1200));
  const after = G.select.todayStats().doneMin;
  check('完成后成长时间增加', after > before, before + ' -> ' + after);
  check('Toast 出现', !!$('.toast'));

  /* Action Sheet */
  const row = $('.tab-pane[data-tab="today"] [data-open]');
  click(row);
  await new Promise(res => setTimeout(res, 200));
  check('Action Sheet 打开（7 项）', $$('#ui-layer .sheet-item').length === 7,
    $$('#ui-layer .sheet-item').length);
  G.ui.closeAll();
  await new Promise(res => setTimeout(res, 400));

  /* FAB 展开 */
  click($('.fab'));
  await new Promise(res => setTimeout(res, 200));
  check('FAB 菜单 5 项', $$('.fab-item').length === 5);
  click($('.fab-item[data-quick="goal"]'));
  await new Promise(res => setTimeout(res, 400));
  check('创建目标 Modal 打开', !!$('#ui-layer .sheet--tall'));
  G.ui.closeAll();
  await new Promise(res => setTimeout(res, 400));

  /* 灵感编辑器 */
  window.location.hash = '#/capture';
  await new Promise(res => setTimeout(res, 150));
  click($('.tab-pane[data-tab="capture"] .capture-bar'));
  await new Promise(res => setTimeout(res, 300));
  check('灵感编辑器打开', !!$('[data-f="content"]'));
  const ta = $('[data-f="content"]');
  if (ta) { ta.value = '测试一条灵感'; }
  click($('[data-save]'));
  await new Promise(res => setTimeout(res, 300));
  check('灵感已保存', G.store.state.inspirations.some(i => i.content === '测试一条灵感'));

  console.log('\n=== 冒烟结果 ===');
  let fail = 0;
  results.forEach(r => {
    if (!r.ok) fail++;
    console.log((r.ok ? '✓' : '✗') + ' ' + r.name + (r.ok ? '' : '  → ' + r.extra));
  });
  console.log('\n失败 ' + fail + ' / ' + results.length);
  if (errors.length) {
    console.log('\n=== 运行时错误 ===');
    errors.slice(0, 20).forEach(e => console.log('  ' + e));
  } else {
    console.log('无运行时错误');
  }
  process.exit(fail || errors.length ? 1 : 0);
}).catch(e => {
  console.error('加载失败', e);
  process.exit(1);
});
