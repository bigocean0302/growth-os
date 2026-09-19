/* reading.js · ⑤ 阅读页（书架 + 添加书籍） */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select;

  function statHTML() {
    var m = Sel.monthStats();
    return '<div class="stat-strip">' +
      '<div class="stat-strip__cell"><span class="stat-strip__v">' + fmt.fmtDuration(m.readingMin) +
      '</span><span class="stat-strip__l">本月阅读</span></div>' +
      '<div class="stat-strip__cell"><span class="stat-strip__v num">' + m.finishedBooks +
      '</span><span class="stat-strip__l">完成本数</span></div>' +
      '<div class="stat-strip__cell"><span class="stat-strip__v num">' + m.excerptCount +
      '</span><span class="stat-strip__l">摘录</span></div>' +
      '</div>';
  }

  function shelfHTML() {
    var books = Sel.readingBooks('reading');
    if (!books.length) {
      return ui.empty({
        icon: 'book', title: '还没有在读的书',
        desc: '加一本正在读的书，阅读时间会自动记进你的成长数据',
        actionText: '添加第一本书'
      });
    }
    return '<div class="book-shelf">' + books.map(function (b) {
      var logs = Store.state.readingLogs.filter(function (l) { return l.bookId === b.id; });
      return '<button class="book-card" data-book="' + b.id + '">' +
        '<div class="book-cover" data-theme="' + b.theme + '">' +
        '<span class="book-cover__mark emoji">📖</span>' +
        '<span class="book-cover__title">' + dom.esc(b.title) + '</span>' +
        '</div>' +
        '<div class="book-card__title">' + dom.esc(b.title) + '</div>' +
        '<div class="book-card__row"><span class="bar grow"><span class="bar__fill" data-bar="' +
        (b.progress / 100) + '"></span></span><span class="book-card__pct">' + b.progress + '%</span></div>' +
        '<div class="book-card__hint">' + (b.lastChapter ? '昨天读到 ' + dom.esc(b.lastChapter) : '还没开始') +
        ' · ' + logs.length + ' 条摘录</div>' +
        '</button>';
    }).join('') + '</div>';
  }

  function doneHTML() {
    var books = Sel.readingBooks('completed');
    if (!books.length) return '';
    return '<div class="sec-head"><h2 class="sec-title">最近完成</h2></div>' +
      books.map(function (b) {
        return '<button class="done-book pressable" data-book="' + b.id + '">' +
          '<span class="done-book__icon">' + icon('check', 20) + '</span>' +
          '<span class="grow"><span class="a-title">《' + dom.esc(b.title) + '》</span>' +
          '<span class="a-meta">完成于 ' + fmt.fmtShortDate(new Date(b.completedAt + 'T00:00:00')) + '</span></span>' +
          '<span class="chip chip--success">读完</span>' +
          '</button>';
      }).join('');
  }

  /* ---------- 添加书籍 ---------- */
  function openAddBook() {
    var f = { goal: '每天阅读', minutes: 25, remind: '20:30' };
    ui.modal({
      title: '添加阅读',
      body: '' +
        '<div class="field"><label class="field__label">书名 <span class="field__req">*</span></label>' +
        '<input class="input" data-f="title" placeholder="例如：原子习惯"></div>' +
        '<div class="field"><label class="field__label">作者</label>' +
        '<input class="input" data-f="author" placeholder="可不填"></div>' +
        '<div class="field"><label class="field__label">目标</label>' +
        '<div class="chip-group" data-f="goal">' +
        ['随便读', '每天阅读', '每周阅读'].map(function (v) {
          return '<button class="chip-select' + (v === '每天阅读' ? ' is-on' : '') + '" data-v="' + v + '">' + v + '</button>';
        }).join('') + '</div>' +
        '<div class="collapse" data-only="每天阅读" data-expanded="true"><div style="padding-top:8px">' +
        '<div class="input-unit"><input class="input num" type="number" data-f="minutes" value="25">' +
        '<span class="input-unit__suffix">min / 天</span></div></div></div></div>' +
        '<div class="field"><label class="field__label">提醒</label>' +
        '<input class="input" type="time" data-f="remind" value="20:30"></div>',
      primaryText: '保存',
      onMount: function (root) {
        dom.on(root, 'click', '[data-f="goal"] .chip-select', function (e, el) {
          dom.$$('[data-f="goal"] .chip-select', root).forEach(function (b) { b.classList.remove('is-on'); });
          el.classList.add('is-on');
          f.goal = el.dataset.v;
          var c = el.closest('.field').querySelector('.collapse[data-only]');
          if (c) c.setAttribute('data-expanded', f.goal === c.dataset.only ? 'true' : 'false');
        });
      },
      onPrimary: function (root, close) {
        var title = root.querySelector('[data-f="title"]').value.trim();
        if (!title) { ui.toast('先填书名'); return; }
        var author = root.querySelector('[data-f="author"]').value.trim();
        var mins = +root.querySelector('[data-f="minutes"]').value || 25;
        var theme = ['teal', 'amber', 'violet', 'blue', 'green'][Store.state.books.length % 5];
        Store.update(function (st) {
          st.books.push({
            id: 'b' + Date.now().toString().slice(-5),
            title: title, author: author, status: 'reading', progress: 0,
            dailyGoalMin: f.goal === '每天阅读' ? mins : 0,
            remind: root.querySelector('[data-f="remind"]').value,
            lastChapter: '', theme: theme,
            startedAt: GOS.store.todayISO()
          });
          st.reminders.push({
            id: 'r' + Date.now().toString().slice(-5),
            title: '读《' + title + '》', desc: mins + ' 分钟 · 认知',
            time: root.querySelector('[data-f="remind"]').value,
            type: '重复提醒', on: true
          });
        });
        close();
        ui.toast('已加入书架 📖');
      }
    });
  }

  GOS.definePage('reading', {
    tab: true,

    render: function () {
      return '<div class="page">' +
        '<div class="page-head">' +
        '<h1 class="head-title grow">阅读</h1>' +
        '<button class="btn-icon" data-add-book>' + icon('plus', 20) + '</button>' +
        '</div>' +
        '<div id="rd-stat">' + statHTML() + '</div>' +
        '<div class="sec-head"><h2 class="sec-title">正在阅读</h2>' +
        '<span class="sec-action">' + Sel.readingBooks('reading').length + ' 本</span></div>' +
        '<div id="rd-shelf">' + shelfHTML() + '</div>' +
        '<div id="rd-done">' + doneHTML() + '</div>' +
        '</div>';
    },

    mount: function (root) {
      root._bind = function () {
        dom.$$('[data-bar]', root).forEach(function (el) {
          requestAnimationFrame(function () { ui.bar(el, +el.dataset.bar); });
        });
      };
      root._bind();

      dom.on(root, 'click', '[data-book]', function (e, el) {
        GOS.router.go('#/book/' + el.dataset.book);
      });
      dom.on(root, 'click', '[data-add-book]', function () { openAddBook(); });
      dom.on(root, 'click', '[data-empty-action]', function () { openAddBook(); });
    },

    refresh: function (root) {
      if (!root) return;
      var s = root.querySelector('#rd-stat'), sh = root.querySelector('#rd-shelf'), d = root.querySelector('#rd-done');
      if (s) s.innerHTML = statHTML();
      if (sh) sh.innerHTML = shelfHTML();
      if (d) d.innerHTML = doneHTML();
      if (root._bind) root._bind();
    },

    openAddBook: openAddBook
  });
})(window.GOS);
