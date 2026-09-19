/* capture.js · ④ 灵感页（时间流 + 编辑器 Sheet） */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select, SCH = GOS.schema;

  var GROUP_LABEL = { today: '今天', yesterday: '昨天', week: '本周', earlier: '更早' };

  function cardHTML(i) {
    var tags = (i.tags || []).map(function (t) {
      return '<span class="chip chip--outline" style="height:22px;padding:0 8px">#' + dom.esc(t) + '</span>';
    }).join('');
    return '<button class="insp-card" data-insp="' + i.id + '">' +
      '<div class="insp-card__text clamp-4">' + dom.esc(i.content) + '</div>' +
      '<div class="insp-card__meta">' +
      '<span class="insp-card__time">' + fmt.fmtClock(i.createdAt) + '</span>' + tags +
      '<span class="grow"></span>' +
      (i.status === 'converted' ? '<span class="insp-card__converted">↗ 已转行动</span>' : '') +
      '</div></button>';
  }

  function groupsHTML() {
    var g = Sel.inspGroups();
    var order = ['today', 'yesterday', 'week', 'earlier'];
    var html = order.filter(function (k) { return g[k].length; }).map(function (k) {
      return '<div class="group">' +
        '<div class="group__head"><span class="group__title">' + GROUP_LABEL[k] + '</span>' +
        '<span class="group__count">' + g[k].length + ' 条</span></div>' +
        g[k].map(cardHTML).join('') +
        '</div>';
    }).join('');
    if (!html) {
      return ui.empty({
        icon: 'bulb',
        title: '这里会留下你所有一闪而过的念头',
        desc: '想到什么，先记下来。分类、标签、标题都可以以后再说',
        actionText: '写下第一条'
      });
    }
    return html;
  }

  /* ---------- 编辑器 Sheet：写一句 → 保存 ---------- */
  function openEditor() {
    var picked = [];
    var handle = ui.sheet({
      title: '记录灵感',
      body: '' +
        '<div class="editor-body">' +
        '<textarea class="editor-area" data-f="content" placeholder="写下此刻的想法……"></textarea>' +
        '<div class="editor-tools">' +
        '<button class="editor-tool" data-media="mic">' + icon('mic', 16) + '<span>语音</span></button>' +
        '<button class="editor-tool" data-media="image">' + icon('image', 16) + '<span>图片</span></button>' +
        '<span class="grow"></span>' +
        '<span class="chip chip--outline">分类可不填</span>' +
        '</div>' +
        '<div class="chip-group" data-f="tags" style="padding:var(--sp-3) 0">' +
        SCH.TAGS.map(function (t) {
          return '<button class="chip-select" data-v="' + t + '">#' + t + '</button>';
        }).join('') + '</div>' +
        '</div>',
      foot: '<button class="btn btn--primary btn--block" data-save>保存</button>',
      onMount: function (root) {
        var ta = root.querySelector('[data-f="content"]');
        setTimeout(function () { ta.focus(); }, 340);

        dom.on(root, 'click', '[data-f="tags"] .chip-select', function (e, el) {
          el.classList.toggle('is-on');
          var v = el.dataset.v, idx = picked.indexOf(v);
          if (idx > -1) picked.splice(idx, 1); else picked.push(v);
        });

        dom.on(root, 'click', '[data-media="mic"]', function (e, el) {
          el.innerHTML = '<span class="rec-bar"><span></span><span></span><span></span><span></span><span></span></span>' +
            '<span>录音中…</span>';
          setTimeout(function () {
            el.innerHTML = icon('mic', 16) + '<span>语音已转文字（演示）</span>';
            if (ta && !ta.value) ta.value = '（语音转文字）' ;
          }, 2600);
        });

        dom.on(root, 'click', '[data-media="image"]', function () {
          ui.toast('原型阶段：图片位占位');
        });

        dom.on(root, 'click', '[data-save]', function () {
          var content = ta.value.trim();
          if (!content) { ui.toast('写一句再保存吧'); return; }
          Store.update(function (st) {
            st.inspirations.unshift({
              id: 'i' + Date.now(),
              content: content,
              tags: picked.slice(),
              createdAt: new Date(GOS.TODAY.getFullYear(), GOS.TODAY.getMonth(), GOS.TODAY.getDate(),
                GOS.NOW.getHours(), GOS.NOW.getMinutes(), 0),
              status: 'inbox',
              linkedGoalId: null, linkedActionId: null, source: '手动记录'
            });
          });
          handle.close();
          ui.toast('已记下 ✨');
        });
      }
    });
    return handle;
  }

  GOS.definePage('capture', {
    tab: true,

    render: function () {
      return '<div class="page">' +
        '<div class="page-head">' +
        '<h1 class="head-title grow">灵感</h1>' +
        '<span class="chip chip--primary chip--lg">本周 ' +
        Store.state.inspirations.filter(function (i) {
          return fmt.relDay(i.createdAt, GOS.TODAY) !== '更早';
        }).length + ' 条</span>' +
        '</div>' +
        '<div class="capture-bar" data-open-editor>' +
        '<span class="capture-bar__plus">' + icon('plus', 20) + '</span>' +
        '<input class="capture-bar__input" placeholder="写下此刻的想法……" readonly>' +
        '<button class="capture-bar__btn" data-media="mic">' + icon('mic', 18) + '</button>' +
        '<button class="capture-bar__btn" data-media="image">' + icon('image', 18) + '</button>' +
        '</div>' +
        '<div id="cp-list">' + groupsHTML() + '</div>' +
        '</div>';
    },

    mount: function (root) {
      dom.on(root, 'click', '[data-open-editor]', function () { openEditor(); });
      dom.on(root, 'click', '[data-empty-action]', function () { openEditor(); });

      dom.on(root, 'click', '[data-insp]', function (e, el) {
        var id = el.dataset.insp;
        var it = Store.state.inspirations.filter(function (x) { return x.id === id; })[0];
        if (!it) return;
        ui.sheet({
          title: '这条灵感',
          body: '<div class="quote" style="margin:var(--sp-3) 0">' + dom.esc(it.content) + '</div>',
          items: [
            {
              icon: 'zap', label: '转为行动', onSelect: function () {
                Store.update(function (st) {
                  var d = GOS.TODAY;
                  var iso = d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
                  st.actions.push({
                    id: 'act' + Date.now(),
                    title: it.content.slice(0, 14), area: 'mind', type: 'custom',
                    minutes: 30, invested: 0, status: 'pending', time: '20:00',
                    goalId: null, date: iso, scheduledAt: new Date(iso + 'T20:00:00')
                  });
                  st.inspirations.forEach(function (x) { if (x.id === id) x.status = 'converted'; });
                });
                ui.toast('已生成行动，去今日页看看');
              }
            },
            {
              icon: 'target', label: '关联目标', onSelect: function () {
                var gid = Store.state.goals[0] && Store.state.goals[0].id;
                Store.update(function (st) {
                  st.inspirations.forEach(function (x) { if (x.id === id) x.linkedGoalId = gid; });
                });
                ui.toast('已关联到「' + Store.state.goals[0].title + '」');
              }
            },
            {
              icon: 'edit', label: '编辑', onSelect: function () { ui.toast('原型阶段：暂不提供编辑'); }
            },
            {
              icon: 'archive', label: '归档', onSelect: function () {
                Store.update(function (st) {
                  st.inspirations.forEach(function (x) { if (x.id === id) x.status = 'archived'; });
                });
                ui.toast('已归档');
              }
            },
            {
              icon: 'trash', label: '删除', danger: true, onSelect: function () {
                Store.update(function (st) {
                  st.inspirations = st.inspirations.filter(function (x) { return x.id !== id; });
                });
                ui.toast('已删除');
              }
            }
          ]
        });
      });
    },

    refresh: function (root) {
      if (!root) return;
      var list = root.querySelector('#cp-list');
      if (list) list.innerHTML = groupsHTML();
    },

    openEditor: openEditor
  });
})(window.GOS);
