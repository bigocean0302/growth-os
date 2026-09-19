/* 开发期自洽校验脚本：node _check.js */
const fs = require('fs');
const path = require('path');

global.window = global;
global.location = { search: '', hash: '' };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (fn) => fn();
global.document = { addEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const files = [
  'assets/js/core/namespace.js',
  'assets/js/core/dom.js',
  'assets/js/core/bus.js',
  'assets/js/core/format.js',
  'assets/js/data/schema.js',
  'assets/js/data/seed.js',
  'assets/js/core/store.js'
];

for (const f of files) {
  const code = fs.readFileSync(path.join(__dirname, f), 'utf8');
  eval(code);
}

const G = global.GOS;
G.store.load();
const sel = G.select;

const today = sel.todayStats();
const week = sel.weekStats(0);
const month = sel.monthStats();
const habit = sel.habitRate();

console.log('--- 今日 ---');
console.log('计划分钟', today.plannedMin, '| 已投入', today.doneMin, '| 完成率', (today.pct * 100).toFixed(1) + '%', '| 完成项', today.doneCount + '/' + today.totalCount);
console.log('分领域', JSON.stringify(today.byArea));

console.log('--- 本周 ---');
console.log('总时长', week.totalMin, '=', G.fmt.fmtDuration(week.totalMin), '| 上周', week.prevMin);
console.log('环比', ((week.totalMin / week.prevMin - 1) * 100).toFixed(1) + '%');
console.log('分领域', JSON.stringify(week.byArea));
console.log('每日', JSON.stringify(week.byDay));
console.log('明细', JSON.stringify(week.byItem));
console.log('运动次数', JSON.stringify(week.sessions));
console.log('灵感', week.inspirationCount, '转化', week.convertedCount);
console.log('最佳', JSON.stringify(week.best));

console.log('--- 本月 ---');
console.log('总时长', month.totalMin, '=', G.fmt.fmtDuration(month.totalMin));
console.log('完成率', (month.completionRate * 100).toFixed(1) + '%');
console.log('连续天数', month.streakDays);
console.log('阅读分钟', month.readingMin, '=', G.fmt.fmtDuration(month.readingMin));
console.log('完成本数', month.finishedBooks, '摘录', month.excerptCount);

console.log('--- 习惯 ---');
console.log('完成率', (habit.rate * 100).toFixed(1) + '%', habit.done + '/' + habit.total);
habit.rows.forEach(r => console.log('  ', r.habit.name, r.matrix.map(x => (x ? '✓' : '·')).join(''), r.done + '/' + r.plan));

console.log('--- 目标 ---');
G.store.state.goals.forEach(g => {
  console.log('  ', g.title, (sel.goalProgress(g) * 100).toFixed(0) + '%',
    '| 本周', G.fmt.fmtDuration(sel.goalWeekMin(g.id)), '/ 目标', g.weeklyTargetMin + 'min',
    '| 连续', sel.goalStreak(g.id), '天');
});

console.log('--- 每日序列（用于趋势图）---');
console.log(sel.dailySeries(19).map(d => d.iso.slice(5) + ':' + d.minutes).join(' '));
