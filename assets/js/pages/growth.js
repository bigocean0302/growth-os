/* growth.js · ② 成长目标页（含创建目标 / 创建习惯） */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select, SCH = GOS.schema;

  function areaProgress(area) {
    var gs = Sel.goalsByArea(area);
    if (!gs.length) return 0;
    var sum = 0;
    gs.forEach(function (g) { sum += Sel.goalProgress(g); });
    return sum / gs.length;
  }

  function areaHTML() {
    return '<div class="area-grid">' +
      SCH.AREA_ORDER.map(function (k) {
        var a = SCH.AREA[k];
        var n = Sel.goalsByArea(k).length;
        return '<button class="area-card" data-area="' + k + '" data-area-open="' + k + '">' +
          '<span class="area-card__emoji emoji">' + a.emoji + '</span>' +
          '<span class="area-card__name">' + a.label + '</span>' +
          '<span class="area-card__desc">' + a.desc + '</span>' +
          '<span class="area-card__count">' + n + ' 个目标</span>' +
          '<span class="bar bar--thin area-card__bar"><span class="bar__fill" data-area="' + k +
          '" data-bar="' + areaProgress(k) + '"></span></span>' +
          '</button>';
      }).join('') +
      '<button class="area-card area-card--add" data-add-area>' + icon('plus', 20) + '<span>自定义领域</span></button>' +
      '</div>';
  }

  function goalCard(g) {
    var pct = Math.round(Sel.goalProgress(g) * 100);
    var left = fmt.daysBetween(GOS.TODAY, new Date(g.target + 'T00:00:00'));
    var streak = Sel.goalStreak(g.id);
    return '<button class="goal-card" data-goal="' + g.id + '">' +
      '<div class="goal-card__top">' +
      '<div><div class="goal-card__name">' + dom.esc(g.title) + '</div>' +
      '<div class="goal-card__meta">' +
      '<span class="chip" data-area="' + g.area + '"><span class="dot" data-area="' + g.area + '"></span>' +
      SCH.AREA[g.area].label + '</span>' +
      '<span>还有 ' + Math.max(0, left) + ' 天</span>' +
      '</div></div>' +
      '<div class="goal-card__pct num">' + pct + '%</div>' +
      '</div>' +
      '<div class="bar"><span class="bar__fill" data-bar="' + Sel.goalProgress(g) + '"></span></div>' +
      '<div class="goal-card__foot">' +
      '<span>' + dom.esc(g.desc || '') + '</span>' +
      (streak ? '<span class="emoji">🔥</span><span> 连续 ' + streak + ' 天</span>' : '<span></span>') +
      '</div>' +
      '</button>';
  }

  function goalsHTML() {
    var gs = Store.state.goals;
    if (!gs.length) {
      return ui.empty({
        icon: 'target', title: '还没有目标',
        desc: '从一个小目标开始，把「想变好」变成「每周做什么」',
        actionText: '创建第一个目标'
      });
    }
    return '<div class="goal-list">' + gs.map(goalCard).join('') + '</div>';
  }

  /* ---------- 创建目标（PRD 6 字段） ---------- */
  function openCreateGoal() {
    var f = { area: '', period: '', freq: '', hours: '' };
    var titles = {
      goal: '创建成长目标',
      name: '目标名称', pName: '例如：英语能力提升',
      area: '属于哪个领域？',
      why: '为什么想做？', pWhy: '写给自己看的理由（可不填）',
      period: '希望什么时候达到？',
      freq: '目标频率',
      hours: '预计每周投入'
    };
    ui.modal({
      title: titles.goal,
      body: '' +
        '<div class="field" data-field="name"><label class="field__label">' + titles.name +
        ' <span class="field__req">*</span></label>' +
        '<input class="input" data-f="name" placeholder="' + titles.pName + '">' +
        '<div class="field__err">给目标起个名字吧</div></div>' +

        '<div class="field" data-field="area"><label class="field__label">' + titles.area +
        ' <span class="field__req">*</span></label>' +
        '<div class="chip-group" data-f="area">' +
        SCH.AREA_ORDER.map(function (k) {
          return '<button class="chip-select" data-area="' + k + '" data-v="' + k + '">' +
            SCH.AREA[k].emoji + ' ' + SCH.AREA[k].label + '</button>';
        }).join('') + '</div>' +
        '<div class="field__err">选一个领域</div></div>' +

        '<div class="field"><label class="field__label">' + titles.why + '</label>' +
        '<textarea class="textarea" data-f="why" rows="3" placeholder="' + titles.pWhy + '"></textarea></div>' +

        '<div class="field" data-field="period"><label class="field__label">' + titles.period +
        ' <span class="field__req">*</span></label>' +
        '<div class="chip-group" data-f="period">' +
        ['1个月', '3个月', '6个月', '1年', '自定义'].map(function (v) {
          return '<button class="chip-select" data-v="' + v + '">' + v + '</button>';
        }).join('') + '</div>' +
        '<div class="field__err">选一个时间</div>' +
        '<div class="collapse" data-only="自定义"><div style="padding-top:8px">' +
        '<input class="input" type="date" data-f="customDate"></div></div></div>' +

        '<div class="field" data-field="freq"><label class="field__label">' + titles.freq +
        ' <span class="field__req">*</span></label>' +
        '<div class="chip-group" data-f="freq">' +
        ['每天', '每周', '自定义'].map(function (v) {
          return '<button class="chip-select" data-v="' + v + '">' + v + '</button>';
        }).join('') + '</div>' +
        '<div class="field__err">选一个频率</div>' +
        '<div class="collapse" data-only="自定义"><div style="padding-top:8px">' +
        '<div class="input-unit"><input class="input num" type="number" data-f="customTimes" placeholder="3">' +
        '<span class="input-unit__suffix">次 / 周</span></div></div></div></div>' +

        '<div class="field" data-field="hours"><label class="field__label">' + titles.hours +
        ' <span class="field__req">*</span></label>' +
        '<div class="input-unit"><input class="input num" type="number" data-f="hours" placeholder="2">' +
        '<span class="input-unit__suffix">小时</span></div>' +
        '<div class="field__err">填一个大概的小时数</div></div>',
      primaryText: '创建目标',
      onMount: function (root, okBtn) {
        function pick(group, cb) {
          dom.on(root, 'click', '[data-f="' + group + '"] .chip-select', function (e, el) {
            dom.$$('[data-f="' + group + '"] .chip-select', root).forEach(function (b) {
              b.classList.remove('is-on');
            });
            el.classList.add('is-on');
            f[group] = el.dataset.v;
            var field = el.closest('.field');
            var c = field.querySelector('.collapse[data-only]');
            if (c) c.setAttribute('data-expanded', f[group] === c.dataset.only ? 'true' : 'false');
            if (cb) cb(el.dataset.v);
            validate();
          });
        }
        function validate() {
          var ok = !!(root.querySelector('[data-f="name"]').value.trim() && f.area && f.period && f.freq &&
            root.querySelector('[data-f="hours"]').value.trim());
          okBtn.classList.toggle('is-disabled', !ok);
        }
        pick('area');
        pick('period');
        pick('freq');
        root.addEventListener('input', validate);
        validate();
        root._validate = validate;
      },
      onPrimary: function (root, close) {
        var name = root.querySelector('[data-f="name"]').value.trim();
        var hours = +root.querySelector('[data-f="hours"]').value || 0;
        if (!name || !f.area || !f.period || !f.freq || !hours) { ui.toast('还有必填项没填完'); return; }
        var months = { '1个月': 1, '3个月': 3, '6个月': 6, '1年': 12 }[f.period] || 3;
        var custom = root.querySelector('[data-f="customDate"]').value;
        var target = custom ? custom : isoAdd(GOS.TODAY, months * 30);
        var why = root.querySelector('[data-f="why"]').value.trim();

        Store.update(function (st) {
          var id = 'g' + (st.goals.length + 1) + Date.now().toString().slice(-3);
          st.goals.unshift({
            id: id, title: name, area: f.area, desc: why || '',
            start: isoAdd(GOS.TODAY, 0), target: target,
            weeklyTargetMin: Math.round(hours * 60), why: why,
            milestones: []
          });
        });
        close();
        ui.toast('目标已创建 🎯');
      }
    });
  }

  function isoAdd(d, days) {
    var t = fmt.addDays(d, days);
    return t.getFullYear() + '-' + fmt.pad(t.getMonth() + 1) + '-' + fmt.pad(t.getDate());
  }

  /* ---------- 创建习惯 ---------- */
  function openCreateHabit() {
    var f = { area: 'body', freq: '每天', color: 'body' };
    ui.modal({
      title: '创建新习惯',
      body: '' +
        '<div class="field"><label class="field__label">名称 <span class="field__req">*</span></label>' +
        '<input class="input" data-f="name" placeholder="例如：每天阅读"></div>' +
        '<div class="field"><label class="field__label">目标</label>' +
        '<div class="chip-group" data-f="minutes">' +
        [15, 20, 25, 30, 45].map(function (m) {
          return '<button class="chip-select" data-v="' + m + '">' + m + ' 分钟</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label class="field__label">频率</label>' +
        '<div class="chip-group" data-f="freq">' +
        ['每天', '每周'].map(function (v) {
          return '<button class="chip-select" data-v="' + v + '">' + v + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label class="field__label">提醒</label>' +
        '<input class="input" type="time" data-f="remind" value="20:30"></div>' +
        '<div class="field"><label class="field__label">关联目标</label>' +
        '<div class="chip-group" data-f="goal">' +
        Store.state.goals.map(function (g) {
          return '<button class="chip-select" data-v="' + g.id + '">' + dom.esc(g.title) + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label class="field__label">颜色</label>' +
        '<div class="chip-group" data-f="color">' +
        SCH.AREA_ORDER.map(function (k) {
          return '<button class="chip-select" data-area="' + k + '" data-v="' + k +
            '" style="width:36px;padding:0">' + SCH.AREA[k].emoji + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label class="field__label">开始日期</label>' +
        '<input class="input" type="date" data-f="start" value="' + isoAdd(GOS.TODAY, 1) + '"></div>',
      primaryText: '创建',
      onMount: function (root) {
        ['minutes', 'freq', 'goal', 'color'].forEach(function (g) {
          dom.on(root, 'click', '[data-f="' + g + '"] .chip-select', function (e, el) {
            dom.$$('[data-f="' + g + '"] .chip-select', root).forEach(function (b) { b.classList.remove('is-on'); });
            el.classList.add('is-on'); f[g] = el.dataset.v;
          });
        });
        dom.$$('[data-f="minutes"] .chip-select', root)[1].classList.add('is-on'); f.minutes = 20;
        dom.$$('[data-f="freq"] .chip-select', root)[0].classList.add('is-on');
        dom.$$('[data-f="color"] .chip-select', root)[0].classList.add('is-on');
      },
      onPrimary: function (root, close) {
        var name = root.querySelector('[data-f="name"]').value.trim();
        if (!name) { ui.toast('先给习惯起个名字'); return; }
        Store.update(function (st) {
          st.habits.push({
            id: 'h' + Date.now().toString().slice(-5),
            name: name,
            goalText: (f.freq === '每天' ? '每天 ' : '每周 ') + (f.minutes || 20) + ' 分钟',
            area: f.color || 'body', freq: f.freq || '每天',
            type: (f.color === 'body' ? 'exercise' : f.color === 'mind' ? 'reading' : 'learning'),
            minMinutes: +(f.minutes || 20),
            remind: root.querySelector('[data-f="remind"]').value,
            goalId: f.goal || null,
            color: f.color || 'body',
            timesPerWeek: 3
          });
        });
        close();
        ui.toast('习惯已创建 ✓');
      }
    });
  }

  GOS.definePage('growth', {
    tab: true,

    render: function () {
      return '<div class="page">' +
        '<div class="page-head">' +
        '<h1 class="head-title grow">我的成长</h1>' +
        '<span class="chip chip--primary chip--lg"><span class="emoji">🎯</span> 当前目标 ' +
        Store.state.goals.length + '</span>' +
        '</div>' +
        '<div id="gr-areas">' + areaHTML() + '</div>' +
        '<div class="sec-head"><h2 class="sec-title">全部目标</h2>' +
        '<button class="sec-action" data-create-goal>＋ 新目标</button></div>' +
        '<div id="gr-goals">' + goalsHTML() + '</div>' +
        '</div>';
    },

    mount: function (root) {
      root._bind = function () {
        dom.$$('[data-bar]', root).forEach(function (el) {
          requestAnimationFrame(function () { ui.bar(el, +el.dataset.bar); });
        });
      };
      root._bind();

      dom.on(root, 'click', '[data-goal]', function (e, el) {
        GOS.router.go('#/goal/' + el.dataset.goal);
      });
      dom.on(root, 'click', '[data-create-goal]', function () { openCreateGoal(); });

      dom.on(root, 'click', '[data-area-open]', function (e, el) {
        var k = el.dataset.areaOpen;
        var gs = Sel.goalsByArea(k);
        if (!gs.length) { ui.toast('这个领域还没有目标'); return; }
        ui.sheet({
          title: SCH.AREA[k].label + ' · ' + gs.length + ' 个目标',
          items: gs.map(function (g) {
            return {
              icon: 'target',
              label: g.title,
              value: Math.round(Sel.goalProgress(g) * 100) + '%',
              onSelect: function () { GOS.router.go('#/goal/' + g.id); }
            };
          })
        });
      });
      dom.on(root, 'click', '[data-empty-action]', function () { openCreateGoal(); });
      dom.on(root, 'click', '[data-add-area]', function () {
        ui.modal({
          title: '自定义领域',
          body: '<div class="field"><label class="field__label">领域名称 <span class="field__req">*</span></label>' +
            '<input class="input" data-f="name" placeholder="例如：副业"></div>' +
            '<div class="field"><label class="field__label">图标</label>' +
            '<div class="chip-group" data-f="emoji">' +
            ['🌱', '🎨', '💰', '🎵', '🧘', '🌍'].map(function (x) {
              return '<button class="chip-select" data-v="' + x + '">' + x + '</button>';
            }).join('') + '</div></div>',
          primaryText: '添加领域',
          onPrimary: function (r, close) {
            var n = r.querySelector('[data-f="name"]').value.trim();
            if (!n) { ui.toast('填个名字'); return; }
            Store.update(function (st) {
              st.areas.push({ id: 'a' + Date.now(), key: 'custom', label: n, emoji: '🌱', desc: '自定义' });
            });
            close();
            ui.toast('领域已添加');
          }
        });
      });
    },

    refresh: function (root) {
      if (!root) return;
      var a = root.querySelector('#gr-areas'), g = root.querySelector('#gr-goals');
      var head = root.querySelector('.chip--primary');
      if (a) a.innerHTML = areaHTML();
      if (g) g.innerHTML = goalsHTML();
      if (head) head.innerHTML = '<span class="emoji">🎯</span> 当前目标 ' + Store.state.goals.length;
      if (root._bind) root._bind();
    },

    openCreateGoal: openCreateGoal,
    openCreateHabit: openCreateHabit
  });
})(window.GOS);
