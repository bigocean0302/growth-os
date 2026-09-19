/* tabbar.js · 底部 5 Tab */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon, bus = GOS.bus;

  var ITEMS = [
    { id: 'today', label: '今日', icon: 'sprout' },
    { id: 'growth', label: '成长', icon: 'target' },
    { id: 'capture', label: '灵感', icon: 'bulb' },
    { id: 'reading', label: '阅读', icon: 'book' },
    { id: 'me', label: '我的', icon: 'user' }
  ];

  GOS.components.tabbar = {
    init: function () {
      var bar = document.getElementById('tabbar');
      bar.innerHTML = ITEMS.map(function (it) {
        return '<button class="tabbar__item" data-tab="' + it.id + '">' +
          '<span class="tabbar__icon">' + icon(it.icon, 22) + '</span>' +
          '<span class="tabbar__label">' + it.label + '</span>' +
          '</button>';
      }).join('');

      dom.on(bar, 'click', '.tabbar__item', function (e, el) {
        GOS.router.go('#/' + el.dataset.tab);
      });

      bus.on('route:changed', function (r) {
        bus.emit('tab:sync', r);
        dom.$$('.tabbar__item', bar).forEach(function (btn) {
          btn.classList.toggle('is-on', r.type === 'tab' && btn.dataset.tab === r.tab);
        });
      }, 'tabbar');
    }
  };
})(window.GOS);
