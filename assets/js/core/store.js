/* store.js · 单一状态树 + localStorage 持久化 + select 派生计算层
   原则：所有展示数字都从 actions 算出来，不写死在模板里。 */
(function (GOS) {
  var fmt = GOS.fmt, bus = GOS.bus, S = GOS.schema;
  var KEY = 'gos.v1';
  var timer = null;

  /* ---------- 持久化 ---------- */
  function stringify(state) {
    return JSON.stringify(state, function (k, v) {
      return v instanceof Date ? { __date: v.toISOString() } : v;
    });
  }
  function revive(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (v && typeof v === 'object' && v.__date) obj[k] = new Date(v.__date);
      else if (v && typeof v === 'object') revive(v);
    });
    return obj;
  }

  var Store = {
    state: null,

    load: function () {
      var raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { /* file:// 下可能被禁用 */ }
      if (raw) {
        try { Store.state = revive(JSON.parse(raw)); return; } catch (e) { /* 忽略脏数据 */ }
      }
      Store.state = GOS.seed.build();
      Store.save();
    },

    save: function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        try { localStorage.setItem(KEY, stringify(Store.state)); } catch (e) { /* 忽略 */ }
      }, 300);
    },

    /* silent = true 时不触发全局刷新（用于先播完动画再刷新） */
    update: function (fn, evt, silent) {
      fn(Store.state);
      Store.save();
      bus.emit('state:changed', evt || 'state');
      if (!silent && GOS.router) GOS.router.refreshAll();
    },

    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ }
      Store.state = GOS.seed.build();
      Store.save();
      bus.emit('state:changed', 'reset');
    },

    todayISO: function () {
      var d = GOS.TODAY;
      return d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
    }
  };

  /* ---------- 派生层 ---------- */
  var Select = {
    /* action 实际投入分钟：完成记全额，进行中记已投入 */
    invested: function (a) {
      if (a.status === 'completed') return a.minutes;
      if (a.status === 'doing') return a.invested || 0;
      return 0;
    },

    todayActions: function () {
      var iso = Store.todayISO();
      return Store.state.actions
        .filter(function (a) { return a.date === iso; })
        .sort(function (x, y) { return x.time < y.time ? -1 : (x.time > y.time ? 1 : 0); });
    },

    todayStats: function () {
      var list = Select.todayActions();
      var planned = 0, done = 0, doneCount = 0, byArea = { body: 0, mind: 0, skill: 0, life: 0 };
      list.forEach(function (a) {
        planned += a.minutes;
        var inv = Select.invested(a);
        done += inv;
        byArea[a.area] += inv;
        if (a.status === 'completed') doneCount++;
      });
      return {
        list: list,
        plannedMin: planned,
        doneMin: done,
        doneCount: doneCount,
        totalCount: list.length,
        pct: planned ? done / planned : 0,
        byArea: byArea
      };
    },

    weekRange: function (offset) {
      var s = fmt.weekStart(GOS.TODAY, offset || 0);
      return { start: s, end: fmt.addDays(s, 6) };
    },

    weekStats: function (offset) {
      offset = offset || 0;
      var r = Select.weekRange(offset);
      var s = new Date(r.start); s.setHours(0, 0, 0, 0);
      var e = new Date(r.end); e.setHours(23, 59, 59, 0);
      var total = 0, byArea = { body: 0, mind: 0, skill: 0, life: 0 }, byDay = [0, 0, 0, 0, 0, 0, 0];
      var byItem = {}, sessions = {};

      Store.state.actions.forEach(function (a) {
        var t = new Date(a.date + 'T00:00:00');
        if (t < s || t > e) return;
        var inv = Select.invested(a);
        if (inv <= 0) return;
        total += inv;
        byArea[a.area] += inv;
        var idx = (t.getDay() + 6) % 7;      // 周一 = 0
        byDay[idx] += inv;
        byItem[a.title] = (byItem[a.title] || 0) + inv;
        if (a.type === 'exercise') sessions[a.title] = (sessions[a.title] || 0) + 1;
      });

      var prev = Select.weekStatsRaw(offset - 1);
      var insps = Store.state.inspirations.filter(function (i) {
        return i.createdAt >= s && i.createdAt <= e;
      });

      return {
        range: r,
        totalMin: total,
        prevMin: prev,
        byArea: byArea,
        byDay: byDay,
        byItem: byItem,
        sessions: sessions,
        inspirationCount: insps.length,
        convertedCount: insps.filter(function (i) { return i.status === 'converted'; }).length,
        habitRate: Select.habitRate(offset),
        best: Select.bestItem(byItem)
      };
    },

    weekStatsRaw: function (offset) {
      var r = Select.weekRange(offset);
      var s = new Date(r.start); s.setHours(0, 0, 0, 0);
      var e = new Date(r.end); e.setHours(23, 59, 59, 0);
      var total = 0;
      Store.state.actions.forEach(function (a) {
        var t = new Date(a.date + 'T00:00:00');
        if (t < s || t > e) return;
        total += Select.invested(a);
      });
      return total;
    },

    bestItem: function (byItem) {
      var best = null, v = -1;
      Object.keys(byItem).forEach(function (k) {
        if (byItem[k] > v) { v = byItem[k]; best = k; }
      });
      return best ? { title: best, minutes: v } : null;
    },

    monthStats: function () {
      var now = GOS.TODAY;
      var s = new Date(now.getFullYear(), now.getMonth(), 1);
      var e = new Date(now); e.setHours(23, 59, 59, 0);
      var total = 0, planned = 0;
      Store.state.actions.forEach(function (a) {
        var t = new Date(a.date + 'T00:00:00');
        if (t < s || t > e) return;
        planned += a.minutes;
        total += Select.invested(a);
      });
      return {
        totalMin: total,
        plannedMin: planned,
        completionRate: planned ? total / planned : 0,
        streakDays: Select.streak(),
        readingMin: Select.readingMin(s, e),
        finishedBooks: Store.state.books.filter(function (b) {
          return b.status === 'completed' && b.completedAt && new Date(b.completedAt + 'T00:00:00') >= s;
        }).length,
        excerptCount: Store.state.readingLogs.length
      };
    },

    readingMin: function (s, e) {
      var total = 0;
      Store.state.actions.forEach(function (a) {
        if (a.type !== 'reading') return;
        var t = new Date(a.date + 'T00:00:00');
        if (t < s || t > e) return;
        total += Select.invested(a);
      });
      return total;
    },

    /* 连续有成长记录的天数（从今天往前） */
    streak: function () {
      var days = {};
      Store.state.actions.forEach(function (a) {
        if (Select.invested(a) > 0) days[a.date] = true;
      });
      var n = 0, cur = new Date(GOS.TODAY);
      for (var i = 0; i < 400; i++) {
        var iso = cur.getFullYear() + '-' + fmt.pad(cur.getMonth() + 1) + '-' + fmt.pad(cur.getDate());
        if (!days[iso]) break;
        n++;
        cur = fmt.addDays(cur, -1);
      }
      return n;
    },

    /* 最近 7 天每日投入（趋势图） */
    dailySeries: function (n) {
      n = n || 19;
      var out = [];
      for (var i = n - 1; i >= 0; i--) {
        var d = fmt.addDays(GOS.TODAY, -i);
        var iso = d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
        var v = 0;
        Store.state.actions.forEach(function (a) {
          if (a.date === iso) v += Select.invested(a);
        });
        out.push({ date: d, iso: iso, minutes: v });
      }
      return out;
    },

    /* ---------- 目标 ---------- */
    goalProgress: function (g) {
      if (!g.milestones || !g.milestones.length) return 0;
      var sum = 0;
      g.milestones.forEach(function (m) { sum += m.pct; });
      return Math.floor(sum / g.milestones.length) / 100;
    },

    goalWeekMin: function (goalId) {
      var r = Select.weekRange(0);
      var s = new Date(r.start); s.setHours(0, 0, 0, 0);
      var e = new Date(r.end); e.setHours(23, 59, 59, 0);
      var total = 0;
      Store.state.actions.forEach(function (a) {
        if (a.goalId !== goalId) return;
        var t = new Date(a.date + 'T00:00:00');
        if (t < s || t > e) return;
        total += Select.invested(a);
      });
      return total;
    },

    goalStreak: function (goalId) {
      var days = {};
      Store.state.actions.forEach(function (a) {
        if (a.goalId === goalId && Select.invested(a) > 0) days[a.date] = true;
      });
      var n = 0, cur = new Date(GOS.TODAY);
      for (var i = 0; i < 400; i++) {
        var iso = cur.getFullYear() + '-' + fmt.pad(cur.getMonth() + 1) + '-' + fmt.pad(cur.getDate());
        if (!days[iso]) break;
        n++;
        cur = fmt.addDays(cur, -1);
      }
      return n;
    },

    goalsByArea: function (area) {
      return Store.state.goals.filter(function (g) { return g.area === area; });
    },

    goalById: function (id) {
      return Store.state.goals.filter(function (g) { return g.id === id; })[0] || null;
    },

    goalTodayAction: function (goalId) {
      var iso = Store.todayISO();
      return Store.state.actions.filter(function (a) {
        return a.goalId === goalId && a.date === iso && a.status !== 'completed';
      })[0] || null;
    },

    /* ---------- 习惯 ---------- */
    habitDayDone: function (habit) {
      var map = {};
      Store.state.actions.forEach(function (a) {
        if (a.type !== habit.type) return;
        if (Select.invested(a) < habit.minMinutes) return;
        map[a.date] = true;
      });
      return map;
    },

    habitRate: function () {
      var total = 0, done = 0, rows = [];
      Store.state.habits.forEach(function (h) {
        var map = Select.habitDayDone(h);
        var plan = h.freq === '每天' ? 7 : 4;
        var matrix = [], got = 0;
        for (var i = 6; i >= 0; i--) {
          var d = fmt.addDays(GOS.TODAY, -i);
          var iso = d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
          var ok = !!map[iso];
          matrix.push(ok);
          if (ok) got++;
        }
        if (h.freq !== '每天') {
          /* 频次型：本周达标次数 / 计划次数 */
          var weekDone = 0;
          for (var j = 0; j < 7; j++) if (matrix[j]) weekDone++;
          var target = h.timesPerWeek || 3;
          done += Math.min(weekDone, target);
          total += target;
        } else {
          done += got;
          total += 7;
        }
        rows.push({ habit: h, matrix: matrix, done: got, plan: plan });
      });
      return { rate: total ? done / total : 0, rows: rows, done: done, total: total };
    },

    /* ---------- 灵感 ---------- */
    inspGroups: function () {
      var groups = { 'today': [], 'yesterday': [], 'week': [], 'earlier': [] };
      Store.state.inspirations
        .slice()
        .sort(function (a, b) { return b.createdAt - a.createdAt; })
        .forEach(function (i) {
          var rel = fmt.relDay(i.createdAt, GOS.TODAY);
          var k = rel === '今天' ? 'today' : rel === '昨天' ? 'yesterday' : rel === '本周' ? 'week' : 'earlier';
          groups[k].push(i);
        });
      return groups;
    },

    /* ---------- 阅读 ---------- */
    readingBooks: function (status) {
      return Store.state.books.filter(function (b) { return b.status === status; });
    },

    bookById: function (id) {
      return Store.state.books.filter(function (b) { return b.id === id; })[0] || null;
    },

    /* ---------- 提醒 ---------- */
    todayReminders: function () {
      return Store.state.reminders.filter(function (r) { return r.on; });
    }
  };

  GOS.store = Store;
  GOS.select = Select;
})(window.GOS);
