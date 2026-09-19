/* weekly.js · ⑥ 周报（#/weekly）
   文案铁律：只做记录 + 提醒 + 观察，不做批评。所有对比文案由 fmtDelta 生成。 */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, ui = GOS.ui, fmt = GOS.fmt;
  var Sel = GOS.select, SCH = GOS.schema;

  var WEEK_LABEL = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  function barsHTML(w) {
    var max = Math.max.apply(null, w.byDay.concat([1]));
    return '<div class="bars">' + w.byDay.map(function (v, i) {
      var isToday = i === ((GOS.TODAY.getDay() + 6) % 7);
      return '<div class="bar-col' + (v === max ? ' is-max' : '') + (isToday ? ' is-today' : '') +
        '" data-bar-col="' + (max ? v / max : 0) + '" title="' + WEEK_LABEL[i] + ' ' +
        fmt.fmtDuration(v) + '">' +
        '<span class="grow"></span>' +
        '<span class="bar-col__fill" style="height:' + Math.max(6, Math.round(v / max * 46)) + 'px"></span>' +
        '<span class="bar-col__label">' + WEEK_LABEL[i].slice(1) + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  function domainHTML(w) {
    var order = ['body', 'mind', 'skill', 'life'].filter(function (k) { return w.byArea[k] > 0; });
    return '<div class="card">' +
      '<div class="card__head"><h3 class="card__title">分领域</h3>' +
      '<span class="card__sub">共 ' + fmt.fmtDuration(w.totalMin) + '</span></div>' +
      order.map(function (k) {
        var items = Object.keys(w.byItem).filter(function (t) {
          return (actionArea(t) === k);
        }).map(function (t) { return dom.esc(t) + ' ' + fmt.fmtDuration(w.byItem[t]); });
        var sub = k === 'body'
          ? Object.keys(w.sessions).map(function (t) { return dom.esc(t) + ' ' + w.sessions[t] + ' 次'; }).join(' · ')
          : items.join(' · ');
        return '<div class="domain-row">' +
          '<div><div class="domain-name"><span class="dot" data-area="' + k + '"></span>' +
          SCH.AREA[k].label + '</div>' +
          '<div class="domain-sub">' + (sub || '—') + '</div>' +
          '<div class="bar bar--thin" style="margin-top:8px"><span class="bar__fill" data-area="' + k +
          '" data-bar="' + (w.totalMin ? w.byArea[k] / w.totalMin : 0) + '"></span></div></div>' +
          '<div class="domain-value">' + fmt.fmtDuration(w.byArea[k]) + '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  function actionArea(title) {
    var hit = null;
    GOS.store.state.actions.forEach(function (a) {
      if (a.title === title) hit = a.area;
    });
    return hit;
  }

  function reportText(w) {
    var d = fmt.fmtDelta(w.totalMin, w.prevMin, 'min');
    return '本周成长报告 ' + fmt.weekRange(w.range.start, w.range.end) + '\n' +
      '成长时间 ' + fmt.fmtDuration(w.totalMin) + '（' + d.text + '）\n' +
      '身体 ' + fmt.fmtDuration(w.byArea.body) + ' · 认知 ' + fmt.fmtDuration(w.byArea.mind) +
      ' · 技能 ' + fmt.fmtDuration(w.byArea.skill) + '\n' +
      '灵感 ' + w.inspirationCount + ' 条，其中 ' + w.convertedCount + ' 条变成了行动\n' +
      '习惯完成率 ' + Math.round(w.habitRate.rate * 100) + '%\n' +
      '本周完成得最好的：' + (w.best ? w.best.title : '—');
  }

  GOS.definePage('weekly', {
    render: function () {
      var w = Sel.weekStats(0);
      var delta = fmt.fmtDelta(w.totalMin, w.prevMin, 'min');
      var h = w.habitRate;

      return '' +
        '<div class="topbar">' +
        '<button class="btn-icon btn-icon--plain" data-back>' + icon('chevronLeft', 22) + '</button>' +
        '<div><div class="topbar__title">本周成长报告</div>' +
        '<div class="topbar__sub">' + fmt.weekRange(w.range.start, w.range.end) + '</div></div>' +
        '<button class="btn-icon btn-icon--plain" data-prev>' + icon('chevronLeft', 20) + '</button>' +
        '</div>' +
        '<div class="stack-page__scroll"><div class="page">' +

        '<div class="weekly-hero">' +
        '<div class="weekly-hero__row">' +
        '<div><div class="weekly-hero__label">本周成长时间</div>' +
        '<div class="weekly-hero__value num" data-count-to="' + w.totalMin + '">0min</div></div>' +
        '<span class="chip chip--amber">' + delta.icon + ' ' + delta.text + '</span>' +
        '</div>' +
        barsHTML(w) +
        '</div>' +

        '<div style="margin-top:var(--gap-card)">' + domainHTML(w) + '</div>' +

        '<div class="card" style="margin-top:var(--gap-card)">' +
        '<div class="card__head"><h3 class="card__title">灵感</h3></div>' +
        '<div class="stat-grid stat-grid--2" style="box-shadow:none;padding:0">' +
        '<div class="stat"><span class="stat__value num">' + w.inspirationCount + '</span>' +
        '<span class="stat__label">记录灵感</span></div>' +
        '<div class="stat"><span class="stat__value num">' + w.convertedCount + '</span>' +
        '<span class="stat__label">形成行动</span></div>' +
        '</div>' +
        '<div class="card__sub" style="text-align:center">有 ' + w.convertedCount +
        ' 个想法变成了行动 <span class="emoji">🌱</span></div>' +
        '</div>' +

        '<div class="card" style="margin-top:var(--gap-card)">' +
        '<div class="card__head"><h3 class="card__title">习惯</h3>' +
        '<span class="card__sub">完成 ' + h.done + ' / ' + h.total + ' 次</span></div>' +
        h.rows.map(function (r) {
          return '<div class="row" style="justify-content:space-between;padding:var(--sp-2) 0">' +
            '<div><div class="a-title">' + dom.esc(r.habit.name) + '</div>' +
            '<div class="a-meta">' + dom.esc(r.habit.goalText) + '</div></div>' +
            '<div class="habit-dots">' + r.matrix.map(function (ok, i) {
              return '<span class="habit-dot' + (ok ? ' is-done' : '') + (i === 6 ? ' is-today' : '') + '">' +
                (ok ? icon('check', 14) : '') + '</span>';
            }).join('') + '</div></div>';
        }).join('') +
        '<div class="bar bar--thin" style="margin-top:var(--sp-2)"><span class="bar__fill" data-bar="' +
        h.rate + '"></span></div>' +
        '<div class="card__sub">完成率 <b class="num">' + Math.round(h.rate * 100) + '%</b></div>' +
        '</div>' +

        '<div class="card" style="margin-top:var(--gap-card)">' +
        '<div class="card__head"><h3 class="card__title">本周完成得最好的</h3></div>' +
        '<div class="row" style="gap:var(--sp-3)">' +
        '<span class="list-row__icon emoji" style="font-size:20px">🏃</span>' +
        '<div class="grow"><div class="a-title">' + dom.esc(w.best ? w.best.title : '—') + '</div>' +
        '<div class="a-meta">投入 ' + fmt.fmtDuration(w.best ? w.best.minutes : 0) + '</div></div>' +
        '</div>' +
        '<div class="card__sub">这周最稳的一件事，节奏保持得很好。</div>' +
        '</div>' +

        '<div class="sec-head"><h2 class="sec-title">下周建议</h2>' +
        '<button class="sec-action" data-apply>加入下周计划</button></div>' +
        '<div class="suggest-list">' +
        [['英语', 3], ['阅读', 4], ['运动', 3]].map(function (x) {
          return '<div class="suggest-item"><span>' + x[0] + ' ' + x[1] + ' 次</span>' +
            '<span class="chip chip--outline">约 ' + (x[1] * 25) + ' min</span></div>';
        }).join('') +
        '</div>' +

        '<button class="copy-btn" data-copy>' + icon('copy', 16) + '复制周报文案</button>' +

        '</div></div>';
    },

    mount: function (root) {
      var el = root.querySelector('[data-count-to]');
      if (el) {
        var to = +el.dataset.countTo;
        ui.countUp(el, 0, to, {
          duration: 900,
          format: function (v) { return fmt.fmtDuration(v); }
        });
      }
      dom.$$('[data-bar-col]', root).forEach(function (col, i) {
        setTimeout(function () {
          var f = col.querySelector('.bar-col__fill');
          if (f) f.style.transform = 'scaleY(' + (+col.dataset.barCol || 0.06) + ')';
        }, 60 + i * 60);
      });
      dom.$$('.bar__fill[data-bar]', root).forEach(function (b) {
        requestAnimationFrame(function () { ui.bar(b, +b.dataset.bar); });
      });

      dom.on(root, 'click', '[data-prev]', function () {
        ui.toast('原型阶段：只提供本周报告');
      });

      dom.on(root, 'click', '[data-apply]', function () { ui.toast('已加入下周计划'); });

      dom.on(root, 'click', '[data-copy]', function () {
        var text = reportText(Sel.weekStats(0));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            ui.toast('周报已复制');
          }, function () { ui.toast('复制失败，可手动选择文本'); });
        } else {
          ui.toast('复制失败，可手动选择文本');
        }
      });
    },

    refresh: function (root) {
      if (!root) return;
      root.innerHTML = GOS.pages.weekly.render();
      GOS.router._bindBack(root);
      this.mount(root);
    }
  });
})(window.GOS);
