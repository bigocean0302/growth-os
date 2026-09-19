/* ui.js · Toast / Sheet / Modal / Confirm / Empty / countUp */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon;
  var layer = null;
  function L() { return layer || (layer = document.getElementById('ui-layer')); }

  var openStack = [];

  function mount(node) {
    L().appendChild(node);
    requestAnimationFrame(function () { node.classList.add('is-in'); });
  }

  function unmount(node, done) {
    node.classList.remove('is-in');
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
      if (done) done();
    }, node.classList.contains('sheet') ? 320 : 200);
  }

  var UI = {
    /* ---------- Toast ---------- */
    toast: function (msg, opts) {
      opts = opts || {};
      var wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      var t = document.createElement('div');
      t.className = 'toast';
      t.textContent = msg;
      wrap.appendChild(t);
      L().appendChild(wrap);
      requestAnimationFrame(function () { t.classList.add('is-in'); });
      setTimeout(function () {
        t.classList.remove('is-in');
        setTimeout(function () {
          if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        }, 200);
      }, opts.duration || 2000);
    },

    /* ---------- Sheet ---------- */
    sheet: function (opts) {
      var scrim = document.createElement('div');
      scrim.className = 'scrim';

      var sheet = document.createElement('div');
      sheet.className = 'sheet' + (opts.tall ? ' sheet--tall' : '');

      var html = '<div class="sheet__grabber"></div>';
      if (opts.title) {
        html += '<div class="sheet__head"><div></div><div class="sheet__title">' +
          dom.esc(opts.title) + '</div><div></div></div>';
      }
      html += '<div class="sheet__body">' + (opts.body || '') + '</div>';

      if (opts.items && opts.items.length) {
        html = html.replace('</div><div class="sheet__body">', '</div><div class="sheet__body">');
        html += '<div style="padding:4px 0 12px">';
        opts.items.forEach(function (it, i) {
          html += '<button class="sheet-item' + (it.danger ? ' sheet-item--danger' : '') +
            '" data-idx="' + i + '">' +
            '<span class="sheet-item__icon">' + icon(it.icon || 'check', 20) + '</span>' +
            '<span class="sheet-item__label">' + dom.esc(it.label) + '</span>' +
            (it.value ? '<span class="a-right">' + dom.esc(it.value) + '</span>' : '<span></span>') +
            '</button>';
        });
        html += '</div>';
      }
      if (opts.foot) html += '<div class="sheet__foot">' + opts.foot + '</div>';

      sheet.innerHTML = html;
      L().appendChild(scrim);
      L().appendChild(sheet);
      requestAnimationFrame(function () { scrim.classList.add('is-in'); sheet.classList.add('is-in'); });
      document.getElementById('fab-layer').classList.add('is-hidden');

      function close() {
        unmount(scrim);
        unmount(sheet);
        if (openStack.indexOf(close) > -1) openStack.splice(openStack.indexOf(close), 1);
        if (!openStack.length) document.getElementById('fab-layer').classList.remove('is-hidden');
        if (opts.onClose) opts.onClose();
      }
      openStack.push(close);

      scrim.addEventListener('click', close);
      var cancelBtn = sheet.querySelector('[data-cancel]');
      if (cancelBtn) cancelBtn.addEventListener('click', close);

      if (opts.items) {
        sheet.addEventListener('click', function (e) {
          var btn = e.target.closest('.sheet-item');
          if (!btn) return;
          var item = opts.items[+btn.dataset.idx];
          close();
          setTimeout(function () { if (item.onSelect) item.onSelect(); }, 60);
        });
      }
      if (opts.onMount) opts.onMount(sheet);
      return { close: close, root: sheet };
    },

    /* ---------- Modal（表单型，底部升起 92%） ---------- */
    modal: function (opts) {
      var scrim = document.createElement('div');
      scrim.className = 'scrim';

      var sheet = document.createElement('div');
      sheet.className = 'sheet sheet--tall';
      sheet.innerHTML =
        '<div class="sheet__grabber"></div>' +
        '<div class="sheet__head">' +
        '<button class="sheet__cancel" data-cancel>' + dom.esc(opts.cancelText || '取消') + '</button>' +
        '<div class="sheet__title">' + dom.esc(opts.title || '') + '</div>' +
        '<div></div>' +
        '</div>' +
        '<div class="sheet__body">' + (opts.body || '') + '</div>' +
        '<div class="sheet__foot"><button class="btn btn--primary btn--block" data-ok>' +
        dom.esc(opts.primaryText || '保存') + '</button></div>';

      L().appendChild(scrim);
      L().appendChild(sheet);
      requestAnimationFrame(function () { scrim.classList.add('is-in'); sheet.classList.add('is-in'); });
      document.getElementById('fab-layer').classList.add('is-hidden');

      var okBtn = sheet.querySelector('[data-ok]');

      function close() {
        unmount(scrim);
        unmount(sheet);
        if (openStack.indexOf(close) > -1) openStack.splice(openStack.indexOf(close), 1);
        if (!openStack.length) document.getElementById('fab-layer').classList.remove('is-hidden');
      }
      openStack.push(close);

      sheet.querySelector('[data-cancel]').addEventListener('click', close);
      /* Modal 不点击遮罩关闭，避免误触丢失输入 */
      scrim.style.pointerEvents = 'none';

      okBtn.addEventListener('click', function () { opts.onPrimary(sheet, close); });
      if (opts.onMount) opts.onMount(sheet, okBtn);
      return { close: close, root: sheet };
    },

    /* ---------- Confirm ---------- */
    confirm: function (opts) {
      var handle = UI.sheet({
        title: opts.title,
        body: '<p style="font-size:var(--fs-14);color:var(--text-2);line-height:var(--lh-relaxed);padding:4px 0 12px">' +
          dom.esc(opts.desc || '') + '</p>',
        foot: '<button class="btn ' + (opts.danger ? 'btn--ghost' : 'btn--primary') +
          ' btn--block" data-confirm>' + dom.esc(opts.okText || '确定') + '</button>',
        onMount: function (root) {
          root.querySelector('[data-confirm]').addEventListener('click', function () {
            handle.close();
            if (opts.onOk) opts.onOk();
          });
        }
      });
      return handle;
    },

    /* ---------- Empty ---------- */
    empty: function (opts) {
      return '<div class="empty">' +
        '<div class="empty__art">' + icon(opts.icon || 'sprout', 40) + '</div>' +
        '<div class="empty__title">' + dom.esc(opts.title) + '</div>' +
        '<div class="empty__desc">' + dom.esc(opts.desc || '') + '</div>' +
        (opts.actionText ? '<button class="btn btn--primary" data-empty-action style="margin-top:4px">' +
          dom.esc(opts.actionText) + '</button>' : '') +
        '</div>';
    },

    /* ---------- 进度条 / 环形 赋值 ---------- */
    bar: function (el, ratio) {
      if (!el) return;
      el.style.transform = 'scaleX(' + Math.max(0, Math.min(1, ratio || 0)) + ')';
    },

    ring: function (svg, ratio) {
      if (!svg) return;
      var circle = svg.querySelector('.ring__fill');
      if (!circle) return;
      var r = +circle.getAttribute('r');
      var c = 2 * Math.PI * r;
      circle.style.strokeDasharray = c;
      circle.style.strokeDashoffset = c * (1 - Math.max(0, Math.min(1, ratio || 0)));
    },

    ringHTML: function (size, ratio, inner) {
      var s = size || 88;
      var sw = Math.max(6, Math.round(s / 11));
      var r = (s - sw) / 2;
      return '<div class="ring" style="width:' + s + 'px;height:' + s + 'px">' +
        '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
        '<circle class="ring__track" cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r +
        '" fill="none" stroke-width="' + sw + '"></circle>' +
        '<circle class="ring__fill" cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r +
        '" fill="none" stroke-width="' + sw + '"></circle>' +
        '</svg>' +
        '<div class="ring__center">' + (inner || '') + '</div>' +
        '</div>';
    },

    /* ---------- 数字增长 ---------- */
    countUp: function (el, from, to, opts) {
      opts = opts || {};
      if (!el) return;
      var dur = opts.duration || 900;
      var fmtFn = opts.format || function (v) { return Math.round(v); };
      var start = performance.now();
      if (from === to) { el.textContent = fmtFn(to); return; }
      function step(now) {
        var t = Math.min(1, (now - start) / dur);
        var v = from + (to - from) * GOS.fmt.easeOutCubic(t);
        el.textContent = fmtFn(v);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = fmtFn(to);
      }
      requestAnimationFrame(step);
    },

    closeAll: function () {
      openStack.slice().forEach(function (fn) { fn(); });
    },

    isOpen: function () { return openStack.length > 0; }
  };

  /* ESC 关闭最上层 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openStack.length) openStack[openStack.length - 1]();
  });

  GOS.ui = UI;
})(window.GOS);
