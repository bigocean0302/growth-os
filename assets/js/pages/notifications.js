/* notifications.js · ⑧ 通知系统
   延后机制（PRD 最重要交互）+ 自适应提醒建议 + 通知设置 */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select;

  var TYPE_LABEL = {
    '一次性提醒': '一次性提醒', '重复提醒': '重复提醒', '每周提醒': '每周提醒',
    '提前提醒': '提前提醒', '每日成长提醒': '每日成长提醒', '周复盘提醒': '周复盘提醒'
  };

  /* 自适应提醒：过去 14 天学习时间的众数 */
  function adaptiveHint() {
    var hist = Store.state.user.studyHistogram || {};
    var best = null, v = -1, total = 0;
    Object.keys(hist).forEach(function (h) {
      total += hist[h];
      if (hist[h] > v) { v = hist[h]; best = +h; }
    });
    if (total < 5) return null;
    var chosen = 20;
    if (Math.abs(best - chosen) < 1) return null;
    return {
      text: '你最近大多数时间在 ' + best + ':00 左右学习，要调整到 ' + best + ':00 吗？',
      accept: '调整到 ' + best + ':00',
      keep: '保持 ' + chosen + ':00'
    };
  }

  function reminderCard(r) {
    return '<div class="reminder-card" data-reminder="' + r.id + '">' +
      '<div class="reminder-head">' +
      '<span class="reminder-icon">' + icon('bell', 18) + '</span>' +
      '<div class="grow"><div class="a-title">' + dom.esc(r.title) + '</div>' +
      '<div class="a-meta">' + dom.esc(r.desc || '') + '</div></div>' +
      '<span class="a-right num">' + (r.time || '—') + '</span>' +
      '</div>' +
      '<div><div class="reminder-ops-label">现在</div>' +
      '<button class="btn btn--primary btn--block" data-rem="start" data-id="' + r.id + '">开始</button></div>' +
      '<div><div class="reminder-ops-label">稍后</div>' +
      '<div class="reminder-ops">' +
      '<button class="btn-mini" data-rem="30" data-id="' + r.id + '">30分钟后</button>' +
      '<button class="btn-mini" data-rem="60" data-id="' + r.id + '">1小时后</button>' +
      '<button class="btn-mini" data-rem="2130" data-id="' + r.id + '">今晚 21:30</button>' +
      '</div></div>' +
      '<div class="reminder-foot">' +
      '<button class="btn-text" data-rem="tomorrow" data-id="' + r.id + '">改到明天</button>' +
      '<button class="btn-text" data-rem="skip" data-id="' + r.id + '">今天跳过</button>' +
      '</div>' +
      '</div>';
  }

  GOS.definePage('notifications', {
    render: function () {
      var list = Store.state.reminders.filter(function (r) { return r.on; });
      var hint = adaptiveHint();
      var types = Object.keys(TYPE_LABEL);
      return '' +
        '<div class="topbar">' +
        '<button class="btn-icon btn-icon--plain" data-back>' + icon('chevronLeft', 22) + '</button>' +
        '<div><div class="topbar__title">通知与提醒</div>' +
        '<div class="topbar__sub">共 ' + list.length + ' 项开启</div></div>' +
        '<button class="btn-icon btn-icon--plain" data-preview>' + icon('zap', 20) + '</button>' +
        '</div>' +
        '<div class="stack-page__scroll"><div class="page">' +

        (hint ? '<div class="suggest-bar" style="margin-bottom:var(--gap-card)">' +
          '<span class="grow suggest-bar__text">' + dom.esc(hint.text) + '</span>' +
          '<button class="btn-mini" data-adapt="yes">' + hint.accept + '</button>' +
          '<button class="btn-text" data-adapt="no">' + hint.keep + '</button>' +
          '</div>' : '') +

        '<div id="nf-list">' + list.map(reminderCard).join('') + '</div>' +

        '<div class="sec-head"><h2 class="sec-title">提醒类型</h2></div>' +
        '<div class="list-card">' + types.map(function (t) {
          var on = Store.state.reminders.some(function (r) { return r.type === t && r.on; });
          return '<div class="switch-row"><span>' +
            '<span class="list-row__name">' + t + '</span>' +
            (t === '每日成长提醒' ? '<div class="a-meta">每天 21:30</div>' : '') +
            (t === '周复盘提醒' ? '<div class="a-meta">每周日 20:30</div>' : '') +
            '</span>' +
            '<button class="switch' + (on ? ' is-on' : '') + '" data-switch="' + t + '"></button></div>';
        }).join('') + '</div>' +

        '<p class="card__sub" style="margin-top:var(--sp-5);line-height:var(--lh-relaxed);text-align:center">' +
        '提醒永远给你「稍后」和「跳过」的选项，<br>而不是只让你在完成与未完成之间二选一。</p>' +

        '</div></div>';
    },

    mount: function (root) {
      dom.on(root, 'click', '[data-rem]', function (e, el) {
        var kind = el.dataset.rem, id = el.dataset.id;
        var r = Store.state.reminders.filter(function (x) { return x.id === id; })[0];
        if (!r) return;
        var card = root.querySelector('.reminder-card[data-reminder="' + id + '"]');

        function collapse() {
          if (!card) return;
          card.style.transition = 'max-height 380ms var(--ease-in-out), opacity 380ms linear, margin 380ms linear';
          card.style.maxHeight = '400px';
          card.style.overflow = 'hidden';
          requestAnimationFrame(function () {
            card.style.maxHeight = '0px';
            card.style.opacity = '0';
            card.style.marginTop = '0';
          });
          setTimeout(function () {
            Store.update(function (st) {
              st.reminders.forEach(function (x) { if (x.id === id) x.on = false; });
            });
          }, 400);
        }

        if (kind === 'start') {
          ui.toast('开始 ' + r.title);
          collapse();
        } else if (kind === '30' || kind === '60') {
          ui.toast('已改为 ' + kind + ' 分钟后提醒');
          collapse();
        } else if (kind === '2130') {
          ui.toast('已改为今晚 21:30 提醒');
          collapse();
        } else if (kind === 'tomorrow') {
          ui.toast('已改到明天 · ' + r.title);
          collapse();
        } else if (kind === 'skip') {
          ui.toast('今天先跳过，没关系');
          collapse();
        }
      });

      dom.on(root, 'click', '[data-adapt]', function (e, el) {
        var bar = el.closest('.suggest-bar');
        if (bar) bar.style.display = 'none';
        ui.toast(el.dataset.adapt === 'yes' ? '已调整到 21:00' : '保持 20:00');
      });

      dom.on(root, 'click', '[data-switch]', function (e, el) {
        var t = el.dataset.switch;
        el.classList.toggle('is-on');
        var on = el.classList.contains('is-on');
        Store.update(function (st) {
          var has = st.reminders.filter(function (r) { return r.type === t; })[0];
          if (has) has.on = on;
        }, 'ui');
        ui.toast(t + (on ? ' 已开启' : ' 已关闭'));
      });

      dom.on(root, 'click', '[data-preview]', function () {
        GOS.app.pushReminder();
        ui.toast('已预览一次提醒');
      });
    },

    refresh: function (root) {
      if (!root) return;
      root.innerHTML = GOS.pages.notifications.render();
      GOS.router._bindBack(root);
      this.mount(root);
    }
  });
})(window.GOS);
