/* book-detail.js · ⑤b 阅读记录页（#/book/:id）· 含「阅读 → 行动」闭环 */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select;

  var state = { minutes: 25, tags: [], gain: '', excerpt: '', note: '' };

  function todayReadingMin(bookId) {
    var iso = Store.todayISO();
    var total = 0;
    Store.state.actions.forEach(function (a) {
      if (a.type === 'reading' && a.date === iso) total += Sel.invested(a);
    });
    void bookId;
    return total || 25;
  }

  GOS.definePage('book', {
    render: function (id) {
      var b = Sel.bookById(id);
      if (!b) return '<div class="topbar"><button class="btn-icon btn-icon--plain" data-back>' +
        icon('chevronLeft', 22) + '</button><div class="topbar__title">没有这本书</div><div></div></div>' +
        '<div class="stack-page__scroll"><div class="page"></div></div>';

      var logs = Store.state.readingLogs.filter(function (l) { return l.bookId === id; });
      var mins = todayReadingMin(id);
      state.minutes = mins;

      return '' +
        '<div class="topbar">' +
        '<button class="btn-icon btn-icon--plain" data-back>' + icon('chevronLeft', 22) + '</button>' +
        '<div><div class="topbar__title">阅读记录</div>' +
        '<div class="topbar__sub">' + fmt.fmtDateHead(GOS.TODAY) + '</div></div>' +
        '<button class="btn-icon btn-icon--plain" data-more>' + icon('more', 22) + '</button>' +
        '</div>' +
        '<div class="stack-page__scroll"><div class="page">' +

        '<div style="margin:0 calc(var(--gutter) * -1)">' +
        '<div class="book-head">' +
        '<div class="book-head__cover" data-theme="' + b.theme + '">' +
        '<span class="emoji" style="font-size:34px">📖</span></div>' +
        '<div><h1 class="goal-hero__title" style="font-size:var(--fs-20)">' + dom.esc(b.title) + '</h1>' +
        '<div class="a-meta" style="margin-top:6px;font-size:var(--fs-13)">' + dom.esc(b.author || '佚名') + '</div>' +
        '<div class="bar" style="margin-top:var(--sp-3)"><span class="bar__fill" data-bar="' +
        (b.progress / 100) + '"></span></div>' +
        '<div class="card__sub" style="margin-top:6px">进度 <b class="num">' + b.progress + '%</b>' +
        ' · ' + dom.esc(b.lastChapter || '') + '</div>' +
        '</div></div></div>' +

        '<div class="card">' +
        '<div class="log-line"><span class="log-line__t">今天阅读</span>' +
        '<span class="row" style="gap:var(--sp-3)"><b class="log-line__v" data-min>' + mins + ' min</b>' +
        '<button class="btn-mini" data-pick>修改</button></span></div>' +
        '<div class="log-line"><span class="log-line__t">今日目标</span>' +
        '<span class="log-line__v">' + (b.dailyGoalMin ? b.dailyGoalMin + ' min' : '随缘读') + '</span></div>' +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">今天有什么收获？</h2></div>' +
        '<div class="card">' +
        '<textarea class="textarea" data-f="gain" rows="3" placeholder="一句话就够"></textarea>' +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">摘录</h2>' +
        '<span class="sec-action">' + logs.length + ' 条</span></div>' +
        '<div class="card">' +
        (logs.length ? logs.slice(0, 4).map(function (l) {
          return '<div class="excerpt-item"><div class="quote">' + dom.esc(l.excerpt) + '</div>' +
            '<div class="card__sub" style="margin-top:6px">' + fmt.fmtShortDate(new Date(l.date + 'T00:00:00')) +
            '</div></div>';
        }).join('') : '<div class="card__sub">还没有摘录，读到好句子就存一句。</div>') +
        '<textarea class="textarea" data-f="excerpt" rows="2" placeholder="再记一句……" style="margin-top:var(--sp-3)"></textarea>' +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">我的理解</h2></div>' +
        '<div class="card"><textarea class="textarea" data-f="note" rows="3" placeholder="用自己的话说一遍"></textarea></div>' +

        '<div class="sec-head"><h2 class="sec-title">这和什么有关？</h2></div>' +
        '<div class="card"><div class="chip-group" data-f="tags">' +
        ['工作', '健康', '技能', '生活'].map(function (t) {
          return '<button class="chip-select" data-v="' + t + '">' + t + '</button>';
        }).join('') + '</div></div>' +

        '<button class="btn btn--primary btn--block" data-create-action style="margin-top:var(--gap-sec)">' +
        icon('zap', 18) + '创建行动</button>' +

        '</div></div>';
    },

    mount: function (root, id) {
      dom.$$('[data-bar]', root).forEach(function (el) {
        requestAnimationFrame(function () { ui.bar(el, +el.dataset.bar); });
      });

      dom.on(root, 'click', '[data-f="tags"] .chip-select', function (e, el) {
        el.classList.toggle('is-on');
        var v = el.dataset.v, i = state.tags.indexOf(v);
        if (i > -1) state.tags.splice(i, 1); else state.tags.push(v);
      });

      dom.on(root, 'click', '[data-pick]', function () {
        ui.sheet({
          title: '今天读了多久',
          items: [15, 25, 45, 60].map(function (m) {
            return {
              icon: 'clock', label: m + ' 分钟', value: m === state.minutes ? '当前' : '',
              onSelect: function () {
                state.minutes = m;
                var el = root.querySelector('[data-min]');
                if (el) el.textContent = m + ' min';
                ui.toast('今天阅读 ' + m + ' 分钟');
              }
            };
          })
        });
      });

      /* 阅读 → 行动 闭环 */
      dom.on(root, 'click', '[data-create-action]', function () {
        var b = Sel.bookById(id);
        var handle = ui.sheet({
          title: '已生成行动',
          body: '<div class="card" style="box-shadow:none;border:1px solid var(--border)">' +
            '<div class="row" style="justify-content:space-between"><span class="a-title">项目管理复盘</span>' +
            '<span class="chip chip--primary">30min</span></div>' +
            '<div class="a-meta">周五 19:00 · 来自《' + dom.esc(b.title) + '》的摘录</div></div>' +
            '<p class="card__sub" style="margin-top:var(--sp-3);line-height:var(--lh-relaxed)">' +
            '已经放进今日行动，完成它就会计入本周成长时间。</p>',
          foot: '<div class="row" style="gap:var(--sp-3)">' +
            '<button class="btn btn--ghost grow" data-ok>知道了</button>' +
            '<button class="btn btn--primary grow" data-goto-today>查看行动</button></div>',
          onMount: function (r) {
            r.querySelector('[data-ok]').addEventListener('click', function () { handle.close(); });
            r.querySelector('[data-goto-today]').addEventListener('click', function () {
              handle.close();
              GOS.router.go('#/today');
            });
          }
        });

        Store.update(function (st) {
          var d = GOS.TODAY;
          var iso = d.getFullYear() + '-' + fmt.pad(d.getMonth() + 1) + '-' + fmt.pad(d.getDate());
          st.actions.push({
            id: 'act' + Date.now(),
            title: '项目管理复盘', area: 'mind', type: 'reflection',
            minutes: 30, invested: 0, status: 'pending', time: '19:00',
            goalId: null, date: iso, scheduledAt: new Date(iso + 'T19:00:00')
          });
        });
        ui.toast('行动已加入今日');
      });

      dom.on(root, 'click', '[data-more]', function () {
        var b = Sel.bookById(id);
        ui.sheet({
          title: b.title,
          items: [{
            icon: 'check', label: '标记为读完', onSelect: function () {
              Store.update(function (st) {
                st.books.forEach(function (x) {
                  if (x.id === id) {
                    x.status = 'completed'; x.progress = 100;
                    x.completedAt = Store.todayISO();
                  }
                });
              });
              ui.toast('读完一本，真棒 🎉');
            }
          }, {
            icon: 'trash', label: '从书架移除', danger: true, onSelect: function () {
              Store.update(function (st) {
                st.books = st.books.filter(function (x) { return x.id !== id; });
              });
              ui.toast('已移除');
              GOS.router.go('#/reading');
            }
          }]
        });
      });
    },

    refresh: function (root, id) {
      if (!root) return;
      root.innerHTML = GOS.pages.book.render(id);
      GOS.router._bindBack(root);
      this.mount(root, id);
      dom.$$('[data-bar]', root).forEach(function (el) { ui.bar(el, +el.dataset.bar); });
    }
  });
})(window.GOS);
