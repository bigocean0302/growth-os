/* today.js · ① 今日页 */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt, bus = GOS.bus;
  var Store = GOS.store, Sel = GOS.select, SCH = GOS.schema;

  var timers = {};              // actionId -> { start, handle }
  var sessionDone = {};         // 本次会话中刚完成的项（收起后进入「已完成」折叠条）

  function areaName(k) { return SCH.AREA[k] ? SCH.AREA[k].label : ''; }
  function areaEmoji(k) { return SCH.AREA[k] ? SCH.AREA[k].emoji : ''; }

  /* ---------- 周报入口卡 ---------- */
  function weeklyHTML() {
    var w = Sel.weekStats(0);
    var delta = fmt.fmtDelta(w.totalMin, w.prevMin, 'min');
    var r = w.range;
    var areas = ['body', 'mind', 'skill'].filter(function (k) { return w.byArea[k] > 0; });
    return '' +
      '<div class="weekly-teaser pressable" data-expanded="false" data-toggle="weekly">' +
      '<div class="weekly-teaser__icon">' + icon('chart', 20) + '</div>' +
      '<div class="grow"><div class="weekly-teaser__title">本周成长报告</div>' +
      '<div class="weekly-teaser__sub">' + fmt.weekRange(r.start, r.end) +
      ' · ' + fmt.fmtDuration(w.totalMin) + '</div></div>' +
      '<div class="weekly-teaser__right">' +
      '<span class="chip chip--amber">' + delta.icon + ' ' + delta.text + '</span>' +
      '<span class="collapse-chevron">' + icon('chevronDown', 16) + '</span>' +
      '</div></div>' +
      '<div class="collapse"><div><div class="weekly-teaser__detail" style="margin-top:0">' +
      areas.map(function (k) {
        return '<div class="hero-detail__row"><span>' + areaEmoji(k) + ' ' + areaName(k) +
          '</span><b>' + fmt.fmtDuration(w.byArea[k]) + '</b></div>';
      }).join('') +
      '<button class="btn-text" style="color:var(--primary-strong);margin-top:8px" data-goto="weekly">查看完整报告 →</button>' +
      '</div></div></div>';
  }

  /* ---------- 今日成长 hero ---------- */
  function heroHTML() {
    var s = Sel.todayStats();
    var pct = Math.round(s.pct * 100);
    var areas = ['body', 'mind', 'skill', 'life'].filter(function (k) { return s.byArea[k] > 0; });
    var max = Math.max.apply(null, areas.map(function (k) { return s.byArea[k]; }).concat([1]));
    return '' +
      '<div class="growth-hero pressable" data-toggle="hero" data-expanded="false">' +
      '<div class="growth-hero__top">' +
      '<div>' +
      '<div class="growth-hero__label">今日完成率</div>' +
      '<div class="growth-hero__value"><span class="num" data-hero-pct>' + pct + '</span>' +
      '<span class="growth-hero__unit">%</span></div>' +
      '<div class="growth-hero__sub"><span data-hero-count>' + s.doneCount + '/' + s.totalCount +
      '</span> 项完成 · 点开看明细</div>' +
      '</div>' +
      '<div class="growth-hero__ring">' +
      ui.ringHTML(88, s.pct, '<span class="emoji" style="font-size:22px">🌱</span>') +
      '</div>' +
      '</div>' +
      '<div class="area-stack">' +
      areas.map(function (k) {
        return '<span class="area-stack__seg" data-area="' + k + '" style="flex-grow:' +
          Math.max(1, s.byArea[k] / max) + '"></span>';
      }).join('') +
      '</div>' +
      '<div class="collapse"><div><div class="hero-detail">' +
      '<div class="hero-detail__row"><span>成长时间</span><b>' + fmt.fmtMinutes(s.doneMin) + '</b></div>' +
      areas.map(function (k) {
        return '<div class="hero-detail__row"><span>' + areaEmoji(k) + ' ' + areaName(k) +
          '</span><b>' + s.byArea[k] + ' min</b></div>';
      }).join('') +
      '<div class="hero-detail__note">按投入时长计算（进行中按已投入计）</div>' +
      '</div></div></div>' +
      '</div>';
  }

  /* ---------- 单个行动行 ---------- */
  function actionRow(a) {
    var st = SCH.STATUS[a.status];
    var right = '';
    if (a.status === 'doing') {
      right = '<span class="a-right" data-timer="' + a.id + '">' + fmtClockFrom(timers[a.id]) + '</span>';
    } else if (a.status === 'completed') {
      right = '<span class="a-right">' + a.minutes + ' min</span>';
    } else if (a.status === 'deferred') {
      right = '<span class="a-right">已延后</span>';
    } else if (a.status === 'skipped') {
      right = '<span class="a-right">已跳过</span>';
    } else {
      right = '<button class="btn-mini" data-start="' + a.id + '">开始</button>';
    }
    var meta = a.minutes + ' 分钟 · ' + areaName(a.area) +
      (a.status === 'deferred' ? ' · 已延后至 ' + a.time : '');
    return '<div class="action-item" data-action="' + a.id + '" data-status="' + a.status + '">' +
      '<button class="status-dot" data-toggle-done="' + a.id + '" aria-label="切换完成">' +
      statusGlyph(a.status) + '</button>' +
      '<div class="grow" data-open="' + a.id + '">' +
      '<div class="a-title">' + dom.esc(a.title) + '</div>' +
      '<div class="a-meta">' + dom.esc(meta) + '</div>' +
      '</div>' +
      '<div>' + right + '</div>' +
      '</div>';
  }

  function statusGlyph(status) {
    if (status === 'completed') return icon('check', 20);
    if (status === 'doing') return '<span style="font-size:15px;font-weight:700">◐</span>';
    if (status === 'deferred') return icon('arrowRight', 18);
    if (status === 'skipped') return icon('x', 18);
    return '';
  }

  function fmtClockFrom(t) {
    var sec = t ? Math.floor((Date.now() - t.start) / 1000) + (t.base || 0) : 0;
    return fmt.pad(Math.floor(sec / 60)) + ':' + fmt.pad(sec % 60);
  }

  function actionsHTML() {
    var s = Sel.todayStats();
    if (!s.list.length) {
      return '<div class="card">' + ui.empty({
        icon: 'sprout',
        title: '今天还没有安排行动',
        desc: '从目标自动生成，或者点右下角 ＋ 添加一项',
        actionText: '添加一个行动'
      }) + '</div>';
    }
    var justDone = s.list.filter(function (a) { return sessionDone[a.id]; });
    var main = s.list.filter(function (a) { return !sessionDone[a.id]; });
    return main.map(actionRow).join('') +
      (justDone.length ? '<button class="done-fold" data-toggle="done" data-expanded="false">' +
        '<span>刚完成 ' + justDone.length + ' 项</span>' +
        '<span class="collapse-chevron">' + icon('chevronDown', 16) + '</span></button>' +
        '<div class="collapse"><div class="done-fold__list">' +
        justDone.map(actionRow).join('') + '</div></div>' : '');
  }

  function timelineHTML() {
    var s = Sel.todayStats();
    var rows = s.list.slice().sort(function (x, y) { return x.time < y.time ? -1 : 1; });
    var extra = [{ time: '21:30', name: '每日成长提醒', status: 'pending', bell: true }];
    var all = rows.concat(extra).sort(function (x, y) { return x.time < y.time ? -1 : 1; });
    return '<div class="tl-card"><div class="timeline">' +
      all.map(function (a) {
        var st = a.bell ? '🔔' : SCH.STATUS[a.status].symbol;
        return '<div class="tl-row" data-status="' + a.status + '">' +
          '<span class="tl-time num">' + a.time + '</span>' +
          '<span class="tl-name">' + dom.esc(a.name || a.title) + '</span>' +
          '<span class="tl-time">' + st + '</span>' +
          '</div>';
      }).join('') +
      '</div></div>';
  }

  /* ---------- Action Sheet（PRD 7 项） ---------- */
  function openActionSheet(id) {
    var a = getAction(id);
    if (!a) return;
    var items = [];
    if (a.status === 'completed') {
      items.push({ icon: 'refresh', label: '取消完成', onSelect: function () { setStatus(id, 'pending'); } });
    } else {
      items.push({
        icon: 'check', label: '完成',
        onSelect: function () { complete(id); }
      });
    }
    items.push({
      icon: 'play', label: a.status === 'doing' ? '结束计时并完成' : '开始计时',
      onSelect: function () {
        if (a.status === 'doing') { complete(id); } else { startTimer(id); }
      }
    });
    items.push({
      icon: 'clock', label: '延后 30 分钟',
      onSelect: function () { defer(id, 30); }
    });
    items.push({
      icon: 'clock', label: '改到今天晚些时候',
      onSelect: function () { defer(id, 120); }
    });
    items.push({
      icon: 'calendar', label: '改到明天',
      onSelect: function () { moveTomorrow(id); }
    });
    items.push({
      icon: 'x', label: '今天跳过',
      onSelect: function () { setStatus(id, 'skipped'); ui.toast('今天先跳过，没关系'); }
    });
    items.push({
      icon: 'trash', label: '删除', danger: true,
      onSelect: function () {
        Store.update(function (st) {
          st.actions = st.actions.filter(function (x) { return x.id !== id; });
        });
        ui.toast('已删除');
      }
    });
    ui.sheet({ title: a.title, items: items });
  }

  function getAction(id) {
    return Store.state.actions.filter(function (a) { return a.id === id; })[0] || null;
  }

  function setStatus(id, status, silent) {
    Store.update(function (st) {
      st.actions.forEach(function (a) {
        if (a.id === id) {
          a.status = status;
          if (status === 'completed') { a.invested = a.minutes; stopTimer(id); }
          if (status === 'pending') a.invested = 0;
        }
      });
    }, 'actions', silent);
  }

  function complete(id) {
    var root = document.querySelector('.tab-pane[data-tab="today"]');
    var el = root && root.querySelector('.action-item[data-action="' + id + '"]');
    sessionDone[id] = true;
    setStatus(id, 'completed', true);
    if (el) {
      /* 先给即时反馈：完成态 + 打勾动画 */
      el.dataset.status = 'completed';
      el.classList.add('is-done');
      var dot = el.querySelector('.status-dot');
      if (dot) { dot.dataset.status = 'completed'; dot.innerHTML = icon('check', 20); }
      var right = el.querySelector('.a-right');
      if (right) right.textContent = (getAction(id) || {}).minutes + ' min';
      /* 520ms 后收起卡片，收完再全局刷新（PRD：完成任务 → 卡片收起） */
      setTimeout(function () {
        el.classList.add('is-collapsing');
        setTimeout(function () { GOS.router.refreshAll(); }, 400);
      }, 520);
    } else {
      GOS.router.refreshAll();
    }
    var a = getAction(id);
    ui.toast('完成 ' + (a ? a.title : '') + ' · +' + (a ? a.minutes : 0) + ' 分钟');
  }

  function defer(id, minutes) {
    Store.update(function (st) {
      st.actions.forEach(function (a) {
        if (a.id !== id) return;
        var t = new Date(a.scheduledAt.getTime() + minutes * 60000);
        a.scheduledAt = t;
        a.time = fmt.fmtClock(t);
        a.status = 'deferred';
      });
    });
    ui.toast('已延后 ' + (minutes >= 60 ? (minutes / 60) + ' 小时' : minutes + ' 分钟'));
  }

  function moveTomorrow(id) {
    Store.update(function (st) {
      st.actions.forEach(function (a) {
        if (a.id !== id) return;
        var d = fmt.addDays(GOS.TODAY, 1);
        a.date = d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
        a.scheduledAt = new Date(a.date + 'T' + a.time + ':00');
      });
    });
    ui.toast('已改到明天');
  }

  function startTimer(id) {
    Store.update(function (st) {
      st.actions.forEach(function (a) { if (a.id === id) a.status = 'doing'; });
    });
    timers[id] = { start: Date.now(), base: 0 };
    if (timers[id].handle) clearInterval(timers[id].handle);
    timers[id].handle = setInterval(function () {
      var root = document.querySelector('.tab-pane[data-tab="today"]');
      if (!root) return;
      var el = root.querySelector('[data-timer="' + id + '"]');
      if (el) el.textContent = fmtClockFrom(timers[id]);
    }, 1000);
    ui.toast('开始计时，专注这一件');
  }

  function stopTimer(id) {
    if (timers[id] && timers[id].handle) clearInterval(timers[id].handle);
    delete timers[id];
  }

  /* ---------- 页面 ---------- */
  GOS.definePage('today', {
    tab: true,

    render: function () {
      return '<div class="page">' +
        '<div class="page-head">' +
        '<div class="grow"><p class="head-date">' + fmt.fmtDateHead(GOS.TODAY) + '</p>' +
        '<h1 class="head-title">今天，也向前一点点 <span class="emoji">🌱</span></h1></div>' +
        '<button class="avatar pressable" data-goto="me">林</button>' +
        '</div>' +
        '<div id="td-weekly">' + weeklyHTML() + '</div>' +
        '<div id="td-hero">' + heroHTML() + '</div>' +
        '<div class="sec-head"><h2 class="sec-title">今日行动</h2>' +
        '<span class="sec-action" data-count></span></div>' +
        '<div id="td-actions">' + actionsHTML() + '</div>' +
        '<div class="sec-head"><h2 class="sec-title">今日时间线</h2></div>' +
        '<div id="td-timeline">' + timelineHTML() + '</div>' +
        '<button class="capture-cta" data-quick="inspiration">' + icon('plus', 18) + '记录灵感</button>' +
        '</div>';
    },

    mount: function (root) {
      function bindDynamic() {
        var w = Sel.weekStats(0), s = Sel.todayStats();
        var cnt = root.querySelector('[data-count]');
        if (cnt) cnt.textContent = s.list.length + ' 项';

        /* 环形进度 */
        var ring = root.querySelector('#td-hero .ring svg');
        requestAnimationFrame(function () { ui.ring(ring, s.pct); });

        /* 展开 / 收起 */
        dom.on(root, 'click', '[data-toggle="weekly"]', function (e, el) {
          var next = el.nextElementSibling;
          el.dataset.expanded = el.dataset.expanded === 'true' ? 'false' : 'true';
          if (next) next.setAttribute('data-expanded', el.dataset.expanded);
        });
        dom.on(root, 'click', '[data-toggle="hero"]', function (e, el) {
          var next = el.querySelector('.collapse');
          el.dataset.expanded = el.dataset.expanded === 'true' ? 'false' : 'true';
          if (next) next.setAttribute('data-expanded', el.dataset.expanded);
        });
        dom.on(root, 'click', '[data-toggle="done"]', function (e, el) {
          var next = el.nextElementSibling;
          el.dataset.expanded = el.dataset.expanded === 'true' ? 'false' : 'true';
          next.setAttribute('data-expanded', el.dataset.expanded);
        });
      }

      root._bindDynamic = bindDynamic;
      bindDynamic();

      dom.on(root, 'click', '[data-goto]', function (e, el) {
        GOS.router.go('#/' + el.dataset.goto);
      });

      /* 点圆钮 → 直接完成 / 取消 */
      dom.on(root, 'click', '[data-toggle-done]', function (e, el) {
        e.stopPropagation();
        var id = el.dataset.toggleDone;
        var a = getAction(id);
        if (!a) return;
        if (a.status === 'completed') { setStatus(id, 'pending'); ui.toast('已恢复为待完成'); }
        else complete(id);
      });

      /* 点行 → Action Sheet */
      dom.on(root, 'click', '[data-open]', function (e, el) {
        openActionSheet(el.dataset.open);
      });

      dom.on(root, 'click', '[data-start]', function (e, el) {
        e.stopPropagation();
        startTimer(el.dataset.start);
      });

      dom.on(root, 'click', '[data-quick]', function (e, el) {
        if (GOS.quick[el.dataset.quick]) GOS.quick[el.dataset.quick]();
      });

      dom.on(root, 'click', '[data-empty-action]', function () {
        if (GOS.quick.action) GOS.quick.action();
      });
    },

    refresh: function (root) {
      if (!root) return;
      var weekly = root.querySelector('#td-weekly');
      var hero = root.querySelector('#td-hero');
      var actions = root.querySelector('#td-actions');
      var timeline = root.querySelector('#td-timeline');
      if (weekly) weekly.innerHTML = weeklyHTML();
      if (hero) hero.innerHTML = heroHTML();
      if (actions) actions.innerHTML = actionsHTML();
      if (timeline) timeline.innerHTML = timelineHTML();
      if (root._bindDynamic) root._bindDynamic();
    }
  });
})(window.GOS);
