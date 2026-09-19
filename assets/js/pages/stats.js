/* stats.js · 成长趋势 / 习惯统计 / 阅读统计 / 灵感统计 */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Store = GOS.store, Sel = GOS.select;

  var TITLES = {
    trend: '成长趋势', habit: '习惯统计', reading: '阅读统计', inspiration: '灵感统计'
  };

  function topbar(title, sub) {
    return '<div class="topbar">' +
      '<button class="btn-icon btn-icon--plain" data-back>' + icon('chevronLeft', 22) + '</button>' +
      '<div><div class="topbar__title">' + title + '</div>' +
      (sub ? '<div class="topbar__sub">' + sub + '</div>' : '') + '</div>' +
      '<div></div></div>';
  }

  /* ---------- 面积折线（纯 SVG，无依赖） ---------- */
  function trendSVG(series) {
    var W = 340, H = 120, pad = 6;
    var max = Math.max.apply(null, series.map(function (d) { return d.minutes; }).concat([60]));
    var n = series.length;
    var pts = series.map(function (d, i) {
      var x = pad + (W - pad * 2) * (n === 1 ? 0.5 : i / (n - 1));
      var y = H - pad - (H - pad * 2) * (d.minutes / max);
      return [x, y];
    });
    var line = pts.map(function (p, i) {
      return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }).join(' ');
    var area = line + ' L' + pts[n - 1][0].toFixed(1) + ' ' + (H - pad) +
      ' L' + pts[0][0].toFixed(1) + ' ' + (H - pad) + ' Z';

    return '<div class="trend-wrap">' +
      '<svg class="trend-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--green-300)" stop-opacity=".55"/>' +
      '<stop offset="100%" stop-color="var(--green-300)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#gArea)"></path>' +
      '<path d="' + line + '" fill="none" stroke="var(--green-500)" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"></path>' +
      pts.map(function (p) {
        return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) +
          '" r="1.8" fill="var(--surface)" stroke="var(--green-500)" stroke-width="1.2"></circle>';
      }).join('') +
      '</svg>' +
      '<div class="row" style="justify-content:space-between;margin-top:var(--sp-2)">' +
      '<span class="card__sub">' + fmt.fmtShortDate(series[0].date) + '</span>' +
      '<span class="card__sub">峰值 ' + fmt.fmtDuration(max) + '</span>' +
      '<span class="card__sub">' + fmt.fmtShortDate(series[n - 1].date) + '</span>' +
      '</div></div>';
  }

  GOS.definePage('stats', {
    render: function (type) {
      var m = Sel.monthStats();
      var body = '';

      if (type === 'trend') {
        var series = Sel.dailySeries(19);
        body = topbar(TITLES.trend, fmt.fmtShortDate(series[0].date) + ' - ' + fmt.fmtShortDate(series[18].date)) +
          '<div class="stack-page__scroll"><div class="page">' +
          '<div class="stat-grid stat-grid--3">' +
          '<div class="stat"><span class="stat__value">' + fmt.fmtDuration(m.totalMin) +
          '</span><span class="stat__label">本月总计</span></div>' +
          '<div class="stat"><span class="stat__value num">' + m.streakDays +
          '</span><span class="stat__label">最长连续（天）</span></div>' +
          '<div class="stat"><span class="stat__value num">' + Math.round(m.completionRate * 100) +
          '%</span><span class="stat__label">完成率</span></div>' +
          '</div>' +
          '<div class="sec-head"><h2 class="sec-title">每日投入</h2></div>' +
          trendSVG(series) +
          '<div class="card" style="margin-top:var(--gap-card)">' +
          '<div class="card__sub" style="line-height:var(--lh-relaxed)">' +
          '这个月你一共投入了 ' + fmt.fmtDuration(m.totalMin) +
          '，平均每天 ' + Math.round(m.totalMin / 19) + ' 分钟。起伏很正常，只要还在动。</div>' +
          '</div>' +
          '</div></div>';
      } else if (type === 'habit') {
        var h = Sel.habitRate();
        body = topbar(TITLES.habit, '最近 7 天') +
          '<div class="stack-page__scroll"><div class="page">' +
          '<div class="stat-grid stat-grid--2">' +
          '<div class="stat"><span class="stat__value num">' + Math.round(h.rate * 100) +
          '%</span><span class="stat__label">本周完成率</span></div>' +
          '<div class="stat"><span class="stat__value num">' + h.done + '/' + h.total +
          '</span><span class="stat__label">完成 / 计划</span></div>' +
          '</div>' +
          '<div class="sec-head"><h2 class="sec-title">习惯明细</h2></div>' +
          '<div class="card">' + h.rows.map(function (r) {
            return '<div class="habit-stat-row">' +
              '<div><div class="a-title">' + dom.esc(r.habit.name) + '</div>' +
              '<div class="a-meta">' + dom.esc(r.habit.goalText) + ' · 完成 ' + r.done + '/' + r.plan + '</div></div>' +
              '<div class="habit-dots">' + r.matrix.map(function (ok) {
                return '<span class="habit-dot' + (ok ? ' is-done' : '') + '">' +
                  (ok ? icon('check', 14) : '') + '</span>';
              }).join('') + '</div>' +
              '</div>';
          }).join('') + '</div>' +
          '<div class="card" style="margin-top:var(--gap-card)">' +
          '<div class="card__sub" style="line-height:var(--lh-relaxed)">' +
          '断一次不会清零，也不会有惩罚。看的是整体节奏，不是完美连续。</div></div>' +
          '</div></div>';
      } else if (type === 'reading') {
        var books = Store.state.books.filter(function (b) { return b.status !== 'completed'; });
        body = topbar(TITLES.reading, '本月') +
          '<div class="stack-page__scroll"><div class="page">' +
          '<div class="stat-grid stat-grid--3">' +
          '<div class="stat"><span class="stat__value">' + fmt.fmtDuration(m.readingMin) +
          '</span><span class="stat__label">阅读时长</span></div>' +
          '<div class="stat"><span class="stat__value num">' + m.finishedBooks +
          '</span><span class="stat__label">完成本数</span></div>' +
          '<div class="stat"><span class="stat__value num">' + m.excerptCount +
          '</span><span class="stat__label">摘录</span></div>' +
          '</div>' +
          '<div class="sec-head"><h2 class="sec-title">在读进度</h2></div>' +
          '<div class="card">' + books.map(function (b) {
            return '<div style="padding:var(--sp-2) 0">' +
              '<div class="row" style="justify-content:space-between"><span class="a-title">' +
              dom.esc(b.title) + '</span><span class="domain-value num">' + b.progress + '%</span></div>' +
              '<div class="bar bar--thin" style="margin-top:8px"><span class="bar__fill" data-bar="' +
              (b.progress / 100) + '"></span></div></div>';
          }).join('') + '</div>' +
          '<div class="sec-head"><h2 class="sec-title">最近摘录</h2></div>' +
          '<div class="card">' + Store.state.readingLogs.slice(-5).reverse().map(function (l) {
            var b = Sel.bookById(l.bookId);
            return '<div class="excerpt-item"><div class="quote">' + dom.esc(l.excerpt) + '</div>' +
              '<div class="card__sub" style="margin-top:6px">《' + dom.esc(b ? b.title : '') + '》</div></div>';
          }).join('') + '</div>' +
          '</div></div>';
      } else {
        var insps = Store.state.inspirations;
        var conv = insps.filter(function (i) { return i.status === 'converted'; }).length;
        var tagMap = {};
        insps.forEach(function (i) {
          (i.tags || []).forEach(function (t) { tagMap[t] = (tagMap[t] || 0) + 1; });
        });
        var tags = Object.keys(tagMap).sort(function (a, b) { return tagMap[b] - tagMap[a]; }).slice(0, 6);
        var maxT = tagMap[tags[0]] || 1;
        body = topbar(TITLES.inspiration, '累计') +
          '<div class="stack-page__scroll"><div class="page">' +
          '<div class="stat-grid stat-grid--2">' +
          '<div class="stat"><span class="stat__value num">' + insps.length +
          '</span><span class="stat__label">记录灵感</span></div>' +
          '<div class="stat"><span class="stat__value num">' + conv +
          '</span><span class="stat__label">转成行动</span></div>' +
          '</div>' +
          '<div class="sec-head"><h2 class="sec-title">标签分布</h2></div>' +
          '<div class="card">' + tags.map(function (t) {
            return '<div style="padding:var(--sp-2) 0">' +
              '<div class="row" style="justify-content:space-between"><span class="a-title">#' +
              dom.esc(t) + '</span><span class="domain-value num">' + tagMap[t] + '</span></div>' +
              '<div class="bar bar--thin" style="margin-top:8px"><span class="bar__fill" data-bar="' +
              (tagMap[t] / maxT) + '"></span></div></div>';
          }).join('') + '</div>' +
          '<div class="card" style="margin-top:var(--gap-card)">' +
          '<div class="card__sub" style="line-height:var(--lh-relaxed)">' +
          '灵感不是用来攒的。每周复盘时挑几条变成行动，它们才算真的发生。</div></div>' +
          '</div></div>';
      }

      return body;
    },

    mount: function (root) {
      dom.$$('.bar__fill[data-bar]', root).forEach(function (el) {
        requestAnimationFrame(function () { ui.bar(el, +el.dataset.bar); });
      });
    },

    refresh: function (root, type) {
      if (!root) return;
      root.innerHTML = GOS.pages.stats.render(type);
      GOS.router._bindBack(root);
      this.mount(root);
    }
  });
})(window.GOS);
