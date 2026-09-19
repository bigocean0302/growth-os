/* goal-detail.js · ③ 目标详情（二级页 #/goal/:id） */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select, SCH = GOS.schema;

  var timerId = null;

  function msRow(m) {
    var done = m.pct >= 100;
    var glyph = done ? icon('check', 16) : (m.pct > 0 ? '<span style="font-size:13px;font-weight:700">◐</span>' : '');
    var status = done ? 'completed' : (m.pct > 0 ? 'doing' : 'pending');
    return '<div class="ms-row" data-done="' + done + '">' +
      '<span class="status-dot status-dot--sm" data-status="' + status + '">' + glyph + '</span>' +
      '<div><div class="ms-title">' + dom.esc(m.title) + '</div>' +
      (done && m.doneAt ? '<div class="ms-right" style="text-align:left;margin-top:2px">已完成 ' +
        fmt.fmtShortDate(new Date(m.doneAt + 'T00:00:00')) + '</div>' : '') +
      '</div>' +
      '<span class="ms-right num">' + (done ? '' : m.pct + '%') + '</span>' +
      '</div>';
  }

  function weekLog(g) {
    var r = Sel.weekRange(0);
    var s = new Date(r.start); s.setHours(0, 0, 0, 0);
    var e = new Date(r.end); e.setHours(23, 59, 59, 0);
    var rows = Store.state.actions.filter(function (a) {
      if (a.goalId !== g.id) return false;
      var t = new Date(a.date + 'T00:00:00');
      return t >= s && t <= e && Sel.invested(a) > 0;
    }).slice(-5);
    if (!rows.length) return '<div class="card__sub">本周还没有记录，从今天这一件开始就好。</div>';
    return '<div class="timeline">' + rows.map(function (a) {
      return '<div class="tl-row" data-status="completed">' +
        '<span class="tl-time num">' + fmt.fmtShortDate(new Date(a.date + 'T00:00:00')) + '</span>' +
        '<span class="tl-name">' + dom.esc(a.title) + '</span>' +
        '<span class="tl-time">' + Sel.invested(a) + ' min</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  GOS.definePage('goal', {
    render: function (id) {
      var g = Sel.goalById(id);
      if (!g) return '<div class="topbar"><button class="btn-icon btn-icon--plain" data-back>' +
        icon('chevronLeft', 22) + '</button><div class="topbar__title">目标不存在</div><div></div></div>' +
        '<div class="stack-page__scroll"><div class="page"></div></div>';

      var pct = Math.round(Sel.goalProgress(g) * 100);
      var weekMin = Sel.goalWeekMin(g.id);
      var target = g.weeklyTargetMin || 0;
      var streak = Sel.goalStreak(g.id);
      var left = fmt.daysBetween(GOS.TODAY, new Date(g.target + 'T00:00:00'));
      var action = Sel.goalTodayAction(g.id);
      var current = null;
      (g.milestones || []).forEach(function (m) { if (!current && m.pct < 100) current = m; });

      return '' +
        '<div class="topbar">' +
        '<button class="btn-icon btn-icon--plain" data-back>' + icon('chevronLeft', 22) + '</button>' +
        '<div><div class="topbar__title">目标详情</div></div>' +
        '<button class="btn-icon btn-icon--plain" data-more>' + icon('more', 22) + '</button>' +
        '</div>' +
        '<div class="stack-page__scroll"><div class="page">' +

        '<div class="goal-hero" style="padding-left:0;padding-right:0">' +
        '<h1 class="goal-hero__title">' + dom.esc(g.title) + '</h1>' +
        '<p class="goal-hero__desc">目标：' + dom.esc(g.desc || '—') + '</p>' +
        '<div class="goal-hero__meta">' +
        '<span class="chip" data-area="' + g.area + '"><span class="dot" data-area="' + g.area + '"></span>' +
        SCH.AREA[g.area].label + '</span>' +
        '<span>' + g.start + ' ~ ' + g.target + '</span>' +
        '<span class="chip chip--outline">剩余 ' + Math.max(0, left) + ' 天</span>' +
        '</div></div>' +

        '<div class="card goal-progress-card">' +
        '<div class="goal-progress__value num" data-pct>' + pct + '%</div>' +
        '<div class="bar bar--thick"><span class="bar__fill" data-bar="' + Sel.goalProgress(g) + '"></span></div>' +
        '<div class="card__sub">' + (current ? '当前阶段：' + dom.esc(current.title) : '所有里程碑已完成 🎉') + '</div>' +
        '</div>' +

        '<div class="card" style="margin-top:var(--gap-card)">' +
        '<div class="card__head"><h3 class="card__title">本周</h3>' +
        '<span class="card__sub">目标 ' + (target ? fmt.fmtDuration(target) : '—') + '</span></div>' +
        '<div class="goal-week-grid">' +
        '<div class="goal-week-cell"><span class="goal-week-cell__v">' + fmt.fmtDuration(weekMin) +
        '</span><span class="goal-week-cell__l">已投入</span></div>' +
        '<div class="goal-week-cell"><span class="goal-week-cell__v num">' + streak +
        '</span><span class="goal-week-cell__l">连续执行（天）</span></div>' +
        '</div>' +
        '<div class="bar bar--thin"><span class="bar__fill" data-bar="' +
        (target ? Math.min(1, weekMin / target) : 0) + '"></span></div>' +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">里程碑</h2>' +
        '<span class="sec-action">' + (g.milestones || []).filter(function (m) { return m.pct >= 100; }).length +
        ' / ' + (g.milestones || []).length + '</span></div>' +
        '<div class="card">' + (g.milestones || []).map(msRow).join('') + '</div>' +

        '<div class="sec-head"><h2 class="sec-title">今日行动</h2></div>' +
        '<div class="card">' +
        (action
          ? '<div class="row" style="justify-content:space-between">' +
          '<div><div class="a-title">' + dom.esc(action.title) + '</div>' +
          '<div class="a-meta">' + action.minutes + 'min · ' + action.time + '</div></div>' +
          '<button class="timer-btn" data-act="' + action.id + '">' + icon('play', 14) + '<span>开始</span></button>' +
          '</div>'
          : '<div class="card__sub">今天没有挂在这个目标下的行动，点右下角 ＋ 加一个。</div>') +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">本周记录</h2></div>' +
        '<div class="card">' + weekLog(g) + '</div>' +

        '</div></div>';
    },

    mount: function (root, id) {
      dom.$$('[data-bar]', root).forEach(function (el) {
        requestAnimationFrame(function () { ui.bar(el, +el.dataset.bar); });
      });

      dom.on(root, 'click', '[data-act]', function (e, el) {
        var btn = el, aid = el.dataset.act;
        Store.update(function (st) {
          st.actions.forEach(function (a) { if (a.id === aid) a.status = 'doing'; });
        });
        var sec = 0;
        btn.innerHTML = icon('pause', 14) + '<span class="num">00:00</span>';
        if (timerId) clearInterval(timerId);
        timerId = setInterval(function () {
          sec++;
          btn.innerHTML = icon('pause', 14) + '<span class="num">' +
            fmt.pad(Math.floor(sec / 60)) + ':' + fmt.pad(sec % 60) + '</span>';
        }, 1000);
        btn.onclick = function () {
          clearInterval(timerId); timerId = null;
          var mins = 0;
          Store.update(function (st) {
            st.actions.forEach(function (a) {
              if (a.id === aid) { a.status = 'completed'; a.invested = a.minutes; mins = a.minutes; }
            });
          });
          ui.toast('完成 · +' + mins + ' 分钟');
        };
      });

      dom.on(root, 'click', '[data-more]', function () {
        var g = Sel.goalById(id);
        ui.sheet({
          title: g.title,
          items: [
            {
              icon: 'edit', label: '编辑目标', onSelect: function () {
                ui.toast('原型阶段：编辑表单与创建表单一致');
                GOS.pages.growth.openCreateGoal();
              }
            },
            {
              icon: 'archive', label: '归档', onSelect: function () {
                Store.update(function (st) {
                  st.goals = st.goals.filter(function (x) { return x.id !== id; });
                });
                ui.toast('已归档');
                GOS.router.go('#/growth');
              }
            },
            {
              icon: 'trash', label: '删除目标', danger: true, onSelect: function () {
                Store.update(function (st) {
                  st.goals = st.goals.filter(function (x) { return x.id !== id; });
                });
                ui.toast('已删除');
                GOS.router.go('#/growth');
              }
            }
          ]
        });
      });
    },

    refresh: function (root, id) {
      if (!root) return;
      root.innerHTML = GOS.pages.goal.render(id);
      GOS.router._bindBack(root);
      this.mount(root, id);
      dom.$$('[data-bar]', root).forEach(function (el) { ui.bar(el, +el.dataset.bar); });
    }
  });
})(window.GOS);
