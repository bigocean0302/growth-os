/* router.js · hash 路由：5 个常驻 Tab + 二级页栈 */
(function (GOS) {
  var dom = GOS.dom, bus = GOS.bus;

  var TABS = ['today', 'growth', 'capture', 'reading', 'me'];
  var panes = {};
  var stack = [];          // [{ key, root, page, params }]
  var current = { tab: 'today', key: '#/today' };

  var Router = {
    TABS: TABS,

    init: function () {
      var layer = document.getElementById('tab-layer');
      TABS.forEach(function (id) {
        var pane = document.createElement('div');
        pane.className = 'tab-pane';
        pane.dataset.tab = id;
        layer.appendChild(pane);
        panes[id] = pane;
        var page = GOS.pages[id];
        if (page && page.render) {
          pane.innerHTML = page.render();
          if (page.mount) page.mount(pane);
        }
      });
      window.addEventListener('hashchange', Router.handle);
      Router.handle();
    },

    parse: function (hash) {
      hash = (hash || location.hash || '').replace(/^#/, '');
      if (!hash || hash === '/') hash = '/today';
      var seg = hash.split('/').filter(Boolean);
      if (TABS.indexOf(seg[0]) > -1 && seg.length === 1) {
        return { type: 'tab', tab: seg[0], key: '#/' + seg[0] };
      }
      return { type: 'page', name: seg[0], param: seg[1] || null, key: '#' + hash };
    },

    handle: function () {
      var r = Router.parse();
      if (r.key === current.key) return;
      current = r;
      bus.emit('route:changed', r);

      if (r.type === 'tab') {
        Router.showTab(r.tab);
        Router.popAll();
        return;
      }
      Router.push(r);
    },

    showTab: function (id) {
      Object.keys(panes).forEach(function (k) {
        panes[k].classList.toggle('is-active', k === id);
      });
      var page = GOS.pages[id];
      if (page && page.onShow) page.onShow(panes[id]);
      bus.emit('tab:shown', id);
    },

    refreshAll: function () {
      TABS.forEach(function (id) {
        var page = GOS.pages[id];
        if (page && page.refresh) page.refresh(panes[id]);
      });
      stack.forEach(function (s) {
        if (s.page.refresh) s.page.refresh(s.root, s.param);
      });
    },

    /* ---------- 二级页栈 ---------- */
    push: function (r) {
      var page = GOS.pages[r.name];
      var layer = document.getElementById('stack-layer');
      if (!page) {
        Router.go('#/today');
        return;
      }
      var root = document.createElement('div');
      root.className = 'stack-page';
      root.innerHTML = page.render(r.param);
      layer.appendChild(root);

      /* 前一页后退 */
      if (stack.length) {
        var prev = stack[stack.length - 1];
        prev.root.classList.remove('is-in');
        prev.root.classList.add('is-behind');
        prev.root.style.pointerEvents = 'none';
      }

      requestAnimationFrame(function () { root.classList.add('is-in'); });
      if (page.mount) page.mount(root, r.param);

      var entry = { key: r.key, root: root, page: page, param: r.param };
      stack.push(entry);
      Router._bindBack(root);
    },

    _bindBack: function (root) {
      var btn = root.querySelector('[data-back]');
      if (btn) {
        btn.addEventListener('click', function () { Router.back(); });
      }
    },

    pop: function () {
      if (!stack.length) return;
      var top = stack.pop();
      if (top.page.unmount) top.page.unmount(top.root);
      top.root.classList.remove('is-in');
      setTimeout(function () {
        if (top.root.parentNode) top.root.parentNode.removeChild(top.root);
      }, 300);
      var prev = stack[stack.length - 1];
      if (prev) {
        prev.root.classList.remove('is-behind');
        prev.root.classList.add('is-in');
        prev.root.style.pointerEvents = '';
      }
    },

    popAll: function () {
      while (stack.length) Router.pop();
    },

    go: function (hash) {
      if (location.hash === hash) Router.handle();
      else location.hash = hash;
    },

    back: function () {
      if (stack.length > 1) {
        history.back();
      } else {
        Router.go('#/' + (current.tab || 'today'));
      }
    },

    currentTab: function () { return current.tab || 'today'; },

    stackDepth: function () { return stack.length; }
  };

  GOS.router = Router;
})(window.GOS);
