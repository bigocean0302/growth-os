/* fab.js · 全局添加 ＋ 悬浮按钮 */
(function (GOS) {
  var dom = GOS.dom, icon = GOS.icon;

  var ITEMS = [
    { id: 'inspiration', emoji: '💡', label: '灵感' },
    { id: 'action', emoji: '🏃', label: '行动' },
    { id: 'book', emoji: '📖', label: '阅读' },
    { id: 'goal', emoji: '🎯', label: '目标' },
    { id: 'habit', emoji: '✓', label: '习惯' }
  ];

  var open = false;

  function close() {
    open = false;
    var fab = document.querySelector('.fab');
    var menu = document.querySelector('.fab-menu');
    var scrim = document.querySelector('.fab-scrim');
    fab.classList.remove('is-open');
    menu.classList.remove('is-in');
    scrim.classList.remove('is-in');
  }

  function toggle() {
    open = !open;
    var fab = document.querySelector('.fab');
    var menu = document.querySelector('.fab-menu');
    var scrim = document.querySelector('.fab-scrim');
    fab.classList.toggle('is-open', open);
    scrim.classList.toggle('is-in', open);
    menu.classList.toggle('is-in', open);
    if (open) {
      dom.$$('.fab-item', menu).forEach(function (el, i) {
        el.style.transitionDelay = (i * 40) + 'ms';
      });
    } else {
      dom.$$('.fab-item', menu).forEach(function (el) { el.style.transitionDelay = '0ms'; });
    }
  }

  function dispatch(id) {
    var q = GOS.quick || {};
    if (q[id]) q[id]();
    else GOS.ui.toast('「' + id + '」暂未接入');
  }

  GOS.components.fab = {
    init: function () {
      var layer = document.getElementById('fab-layer');
      layer.innerHTML =
        '<div class="fab-scrim"></div>' +
        '<div class="fab-menu">' +
        ITEMS.map(function (it) {
          return '<button class="fab-item" data-quick="' + it.id + '">' +
            '<span class="fab-item__emoji emoji">' + it.emoji + '</span>' +
            '<span>' + it.label + '</span>' +
            '</button>';
        }).join('') +
        '</div>' +
        '<button class="fab" aria-label="添加">' + icon('plus', 28) + '</button>';

      dom.on(layer, 'click', '.fab', function () { toggle(); });
      dom.on(layer, 'click', '.fab-scrim', function () { if (open) close(); });
      dom.on(layer, 'click', '.fab-item', function (e, el) {
        close();
        setTimeout(function () { dispatch(el.dataset.quick); }, 120);
      });
    },
    close: close,
    isOpen: function () { return open; }
  };
})(window.GOS);
