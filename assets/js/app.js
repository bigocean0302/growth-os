/* app.js · 启动 */
(function (GOS) {
  var ui = GOS.ui, dom = GOS.dom, icon = GOS.icon, fmt = GOS.fmt, Store = GOS.store, Sel = GOS.select;

  /* ---------- 全局快速添加入口 ---------- */
  GOS.quick = {
    inspiration: function () { GOS.pages.capture.openEditor(); },
    goal: function () { GOS.pages.growth.openCreateGoal(); },
    book: function () { GOS.pages.reading.openAddBook(); },
    habit: function () { GOS.pages.growth.openCreateHabit(); },
    action: function () { GOS.app.newAction(); }
  };

  GOS.app = {
    newAction: function () {
      var form = { area: 'body', minutes: 30, time: '20:00', title: '' };
      ui.modal({
        title: '新建行动',
        body: '' +
          '<div class="field"><label class="field__label">行动名称 <span class="field__req">*</span></label>' +
          '<input class="input" data-f="title" placeholder="例如：跑步 30 分钟"></div>' +
          '<div class="field"><label class="field__label">属于哪个领域？</label>' +
          '<div class="chip-group" data-f="area">' +
          ['body', 'mind', 'skill', 'life'].map(function (k) {
            return '<button class="chip-select" data-area="' + k + '" data-v="' + k + '">' +
              GOS.schema.AREA[k].emoji + ' ' + GOS.schema.AREA[k].label + '</button>';
          }).join('') + '</div></div>' +
          '<div class="field"><label class="field__label">预计时长</label>' +
          '<div class="chip-group" data-f="minutes">' +
          [15, 20, 25, 30, 45, 60].map(function (m) {
            return '<button class="chip-select" data-v="' + m + '">' + m + ' 分钟</button>';
          }).join('') + '</div></div>' +
          '<div class="field"><label class="field__label">计划时间</label>' +
          '<input class="input" type="time" data-f="time" value="20:00"></div>',
        primaryText: '加入今日',
        onMount: function (root) {
          dom.on(root, 'click', '[data-f="area"] .chip-select', function (e, el) {
            dom.$$('[data-f="area"] .chip-select', root).forEach(function (b) { b.classList.remove('is-on'); });
            el.classList.add('is-on'); form.area = el.dataset.v;
          });
          dom.on(root, 'click', '[data-f="minutes"] .chip-select', function (e, el) {
            dom.$$('[data-f="minutes"] .chip-select', root).forEach(function (b) { b.classList.remove('is-on'); });
            el.classList.add('is-on'); form.minutes = +el.dataset.v;
          });
          dom.$$('[data-f="area"] .chip-select', root)[0].classList.add('is-on');
          dom.$$('[data-f="minutes"] .chip-select', root)[3].classList.add('is-on');
        },
        onPrimary: function (root, close) {
          form.title = root.querySelector('[data-f="title"]').value.trim();
          form.time = root.querySelector('[data-f="time"]').value || '20:00';
          if (!form.title) { ui.toast('先给行动起个名字'); return; }
          var d = GOS.TODAY;
          var iso = d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
          Store.update(function (st) {
            st.actions.push({
              id: 'act' + Date.now(),
              title: form.title, area: form.area, type: 'custom',
              minutes: form.minutes, invested: 0, status: 'pending',
              time: form.time, goalId: null,
              date: iso, scheduledAt: new Date(iso + 'T' + form.time + ':00')
            });
          });
          close();
          ui.toast('已加入今日 · ' + form.title);
        }
      });
    },

    /* 应用内推送横幅（延后机制的第二种呈现） */
    pushReminder: function () {
      var layer = document.getElementById('ui-layer');
      var old = layer.querySelector('.push-banner');
      if (old) old.parentNode.removeChild(old);

      var list = Sel.todayActions().filter(function (a) { return a.status === 'pending'; });
      var a = list[0];
      if (!a) return;
      var el = document.createElement('div');
      el.className = 'push-banner';
      el.innerHTML =
        '<div class="push-banner__icon">' + icon('bell', 20) + '</div>' +
        '<div class="grow"><div class="push-banner__title">' + dom.esc(a.title) + ' 时间到了</div>' +
        '<div class="push-banner__desc">' + a.minutes + ' 分钟 · ' + a.time + '</div></div>' +
        '<button class="btn-mini" data-push="start">开始</button>' +
        '<button class="btn-text" data-push="later">稍后</button>';
      layer.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('is-in'); });

      function hide() {
        el.classList.remove('is-in');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
      }
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-push]');
        if (!b) return;
        hide();
        if (b.dataset.push === 'start') {
          Store.update(function (st) {
            st.actions.forEach(function (x) { if (x.id === a.id) x.status = 'doing'; });
          });
          ui.toast('开始 ' + a.title);
        } else {
          ui.toast('30 分钟后再提醒你');
        }
      });
      setTimeout(hide, 5000);
    }
  };

  function boot() {
    Store.load();
    document.documentElement.dataset.theme = Store.state.theme || 'green';
    GOS.components.tabbar.init();
    GOS.components.fab.init();
    GOS.router.init();
    GOS.seed.assert(Store.state);
    setTimeout(function () { GOS.app.pushReminder(); }, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.GOS);
