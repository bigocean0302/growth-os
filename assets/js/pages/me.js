/* me.js · ⑨ 我的（含周报入口 / 数据入口 / 设置 / 主题 / 关于） */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select;

  var DATA_ITEMS = [
    { key: 'trend', label: '成长趋势', icon: 'chart' },
    { key: 'habit', label: '习惯统计', icon: 'flag' },
    { key: 'reading', label: '阅读统计', icon: 'book' },
    { key: 'inspiration', label: '灵感统计', icon: 'bulb' }
  ];

  var SETTINGS_A = [
    { key: 'notify', label: '通知', icon: 'bell', hint: 'notifCount' },
    { key: 'calendar', label: '日历', icon: 'calendar', hint: '' },
    { key: 'health', label: '健康数据', icon: 'activity', hint: '' },
    { key: 'theme', label: '主题', icon: 'droplet', hint: '柔和绿' }
  ];

  var SETTINGS_B = [
    { key: 'backup', label: '数据备份', icon: 'cloud', hint: '' },
    { key: 'privacy', label: '隐私', icon: 'shield', hint: '' },
    { key: 'about', label: '关于', icon: 'info', hint: '' }
  ];

  function countUpAll(root) {
    var m = Sel.monthStats();
    var els = root.querySelectorAll('[data-count-to]');
    els.forEach(function (el) {
      var to = +el.dataset.countTo;
      var kind = el.dataset.kind;
      ui.countUp(el, 0, to, {
        duration: 900,
        format: kind === 'min' ? function (v) { return fmt.fmtDuration(v); }
          : function (v) { return Math.round(v) + (kind === 'pct' ? '%' : ''); }
      });
    });
    void m;
  }

  GOS.definePage('me', {
    tab: true,

    render: function () {
      var m = Sel.monthStats();
      var u = Store.state.user;
      var w = Sel.weekStats(0);
      return '<div class="page">' +
        '<div class="me-hero">' +
        '<div class="me-avatar">' + dom.esc(u.initial) + '</div>' +
        '<div class="grow"><div class="me-name">' + dom.esc(u.name) + '</div>' +
        '<div class="me-sub">加入成长 OS 第 ' + u.days + ' 天</div></div>' +
        '<button class="btn-icon btn-icon--plain" data-goto="settings-theme">' + icon('droplet', 20) + '</button>' +
        '</div>' +

        '<div id="me-stat">' +
        '<div class="stat-grid stat-grid--3">' +
        '<div class="stat"><span class="stat__value num" data-count-to="' + m.totalMin +
        '" data-kind="min">0min</span><span class="stat__label">本月成长时间</span></div>' +
        '<div class="stat"><span class="stat__value num" data-count-to="' + m.streakDays +
        '" data-kind="int">0</span><span class="stat__label">坚持天数</span></div>' +
        '<div class="stat"><span class="stat__value num" data-count-to="' + Math.round(m.completionRate * 100) +
        '" data-kind="pct">0%</span><span class="stat__label">完成率</span></div>' +
        '</div>' +
        '<button class="weekly-entry pressable" data-goto="weekly">' +
        '<span class="weekly-entry__icon">' + icon('chart', 18) + '</span>' +
        '<span class="grow"><span class="a-title" style="font-weight:600">本周成长报告</span>' +
        '<span class="a-meta">' + fmt.weekRange(w.range.start, w.range.end) + ' · ' +
        fmt.fmtDuration(w.totalMin) + '</span></span>' +
        '<span class="row" style="gap:4px;color:var(--primary-strong);font-size:var(--fs-13)">查看' +
        icon('chevronRight', 14) + '</span>' +
        '</button>' +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">数据</h2></div>' +
        '<div class="list-card">' + DATA_ITEMS.map(function (it) {
          return '<button class="list-row" data-stats="' + it.key + '">' +
            '<span class="list-row__icon">' + icon(it.icon, 18) + '</span>' +
            '<span class="grow list-row__name">' + it.label + '</span>' +
            '<span class="list-row__right">' + icon('chevronRight', 16) + '</span>' +
            '</button>';
        }).join('') + '</div>' +

        '<div class="sec-head"><h2 class="sec-title">设置</h2></div>' +
        '<div class="list-card">' + SETTINGS_A.map(function (it) {
          var hint = it.hint === 'notifCount'
            ? '已开启 ' + Store.state.reminders.filter(function (r) { return r.on; }).length + ' 项'
            : (it.hint || '');
          return '<button class="list-row" data-setting="' + it.key + '">' +
            '<span class="list-row__icon">' + icon(it.icon, 18) + '</span>' +
            '<span class="grow list-row__name">' + it.label + '</span>' +
            '<span class="list-row__right">' + hint + icon('chevronRight', 16) + '</span>' +
            '</button>';
        }).join('') + '</div>' +

        '<div class="list-card" style="margin-top:var(--gap-card)">' + SETTINGS_B.map(function (it) {
          return '<button class="list-row" data-setting="' + it.key + '">' +
            '<span class="list-row__icon">' + icon(it.icon, 18) + '</span>' +
            '<span class="grow list-row__name">' + it.label + '</span>' +
            '<span class="list-row__right">' + (it.hint || '') + icon('chevronRight', 16) + '</span>' +
            '</button>';
        }).join('') + '</div>' +

        '<div style="text-align:center;font-size:var(--fs-11);color:var(--text-3);padding:var(--sp-6) 0">' +
        '版本 1.0.0 · 原型演示数据</div>' +
        '</div>';
    },

    mount: function (root) {
      countUpAll(root);

      dom.on(root, 'click', '[data-stats]', function (e, el) {
        GOS.router.go('#/stats/' + el.dataset.stats);
      });
      dom.on(root, 'click', '[data-setting]', function (e, el) {
        var k = el.dataset.setting;
        if (k === 'notify') GOS.router.go('#/notifications');
        else if (k === 'theme') GOS.router.go('#/theme');
        else if (k === 'about') GOS.router.go('#/about');
        else GOS.router.go('#/settings/' + k);
      });
      dom.on(root, 'click', '[data-goto]', function (e, el) {
        var k = el.dataset.goto;
        GOS.router.go('#/' + (k === 'settings-theme' ? 'theme' : k));
      });
    },

    refresh: function (root) {
      if (!root) return;
      var s = root.querySelector('#me-stat');
      if (!s) return;
      var m = Sel.monthStats(), w = Sel.weekStats(0);
      s.innerHTML =
        '<div class="stat-grid stat-grid--3">' +
        '<div class="stat"><span class="stat__value num">' + fmt.fmtDuration(m.totalMin) +
        '</span><span class="stat__label">本月成长时间</span></div>' +
        '<div class="stat"><span class="stat__value num">' + m.streakDays +
        '</span><span class="stat__label">坚持天数</span></div>' +
        '<div class="stat"><span class="stat__value num">' + Math.round(m.completionRate * 100) +
        '%</span><span class="stat__label">完成率</span></div>' +
        '</div>' +
        '<button class="weekly-entry pressable" data-goto="weekly">' +
        '<span class="weekly-entry__icon">' + icon('chart', 18) + '</span>' +
        '<span class="grow"><span class="a-title" style="font-weight:600">本周成长报告</span>' +
        '<span class="a-meta">' + fmt.weekRange(w.range.start, w.range.end) + ' · ' +
        fmt.fmtDuration(w.totalMin) + '</span></span>' +
        '<span class="row" style="gap:4px;color:var(--primary-strong);font-size:var(--fs-13)">查看' +
        icon('chevronRight', 14) + '</span>' +
        '</button>';
      dom.on(s, 'click', '[data-goto]', function (e, el) {
        GOS.router.go('#/' + el.dataset.goto);
      });
    }
  });

  /* ---------- 二级页：主题 / 关于 / 设置 ---------- */
  function stackTopbar(title, back) {
    return '<div class="topbar">' +
      '<button class="btn-icon btn-icon--plain" data-back>' + icon(back ? 'chevronLeft' : 'chevronLeft', 22) + '</button>' +
      '<div class="topbar__title">' + title + '</div><div></div></div>';
  }

  GOS.definePage('theme', {
    render: function () {
      var cur = Store.state.theme || 'green';
      var opts = [
        { k: 'green', label: '柔和绿', c: 'var(--green-500)' },
        { k: 'blue', label: '浅蓝', c: 'var(--blue-500)' },
        { k: 'amber', label: '暖黄', c: 'var(--amber-400)' }
      ];
      return stackTopbar('主题') +
        '<div class="stack-page__scroll"><div class="page">' +
        '<div class="sec-head"><h2 class="sec-title">选择主题色</h2></div>' +
        '<div class="theme-swatches">' + opts.map(function (o) {
          return '<button class="swatch' + (cur === o.k ? ' is-on' : '') + '" data-theme-set="' + o.k + '">' +
            '<span class="swatch__dot" style="background:' + o.c + '"></span>' +
            '<span class="a-meta" style="font-size:var(--fs-12)">' + o.label + (cur === o.k ? ' ✓' : '') + '</span>' +
            '</button>';
        }).join('') + '</div>' +
        '<p class="card__sub" style="margin-top:var(--sp-5);line-height:var(--lh-relaxed)">' +
        '主题只影响强调色，卡片、留白与圆角保持一致，切换后全站即时生效。</p>' +
        '</div></div>';
    },
    mount: function (root) {
      dom.on(root, 'click', '[data-theme-set]', function (e, el) {
        var k = el.dataset.themeSet;
        Store.update(function (st) { st.theme = k; }, 'ui');
        document.documentElement.dataset.theme = k;
        GOS.router.refreshAll();
        root.innerHTML = GOS.pages.theme.render();
        GOS.router._bindBack(root);
        GOS.pages.theme.mount(root);
        ui.toast('主题已切换');
      });
    }
  });

  GOS.definePage('about', {
    render: function () {
      return stackTopbar('关于') +
        '<div class="stack-page__scroll"><div class="page">' +
        '<div class="card"><div class="card__head"><h3 class="card__title">个人成长 OS</h3>' +
        '<span class="chip chip--primary">V1.0</span></div>' +
        '<div class="card__sub" style="line-height:var(--lh-relaxed)">' +
        '给忙碌城市上班族的个人成长时间管家。<br>目标 → 计划 → 提醒 → 行动 → 记录 → 回顾 → 成长。</div></div>' +
        '<div class="list-card" style="margin-top:var(--gap-card)">' +
        '<div class="list-row"><span class="list-row__icon">' + icon('info', 18) + '</span>' +
        '<span class="grow list-row__name">版本号</span>' +
        '<span class="list-row__right">1.0.0</span></div>' +
        '<div class="list-row"><span class="list-row__icon">' + icon('tag', 18) + '</span>' +
        '<span class="grow list-row__name">数据来源</span>' +
        '<span class="list-row__right">演示种子数据</span></div>' +
        '</div>' +
        '<button class="btn btn--ghost btn--block" data-reset style="margin-top:var(--gap-sec)">' +
        icon('refresh', 18) + '重置演示数据</button>' +
        '</div></div>';
    },
    mount: function (root) {
      dom.on(root, 'click', '[data-reset]', function () {
        ui.confirm({
          title: '重置演示数据？',
          desc: '所有演示期间的修改会清空，回到初始的种子数据。',
          okText: '重置',
          onOk: function () {
            Store.reset();
            GOS.router.refreshAll();
            ui.toast('已重置');
          }
        });
      });
    }
  });

  GOS.definePage('settings', {
    render: function (key) {
      var map = {
        calendar: { title: '日历', desc: '把今日行动同步到系统日历，避免和其他安排撞车。' },
        health: { title: '健康数据', desc: '连接 Health Connect 后，运动时长可以自动计入成长时间。' },
        backup: { title: '数据备份', desc: '所有数据先存在本机，开启备份后会在联网时同步到云端。' },
        privacy: { title: '隐私', desc: '你的目标、灵感与阅读记录只属于你，我们不会用于任何推荐。' }
      };
      var it = map[key] || { title: '设置', desc: '' };
      return stackTopbar(it.title) +
        '<div class="stack-page__scroll"><div class="page">' +
        '<div class="card"><div class="card__sub" style="line-height:var(--lh-relaxed)">' +
        dom.esc(it.desc) + '</div></div>' +
        '<div class="list-card" style="margin-top:var(--gap-card)">' +
        ['同步开关', '仅在 Wi-Fi 下同步'].map(function (t) {
          return '<div class="switch-row"><span class="list-row__name">' + t + '</span>' +
            '<button class="switch" data-toggle-switch></button></div>';
        }).join('') + '</div>' +
        '</div></div>';
    },
    mount: function (root) {
      dom.on(root, 'click', '[data-toggle-switch]', function (e, el) {
        el.classList.toggle('is-on');
      });
    }
  });
})(window.GOS);
