/* dom.js · 极简 DOM 助手 */
(function (GOS) {
  var D = {};

  D.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  D.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  D.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /* 事件委托：on(root, 'click', '.btn', handler) */
  D.on = function (root, type, sel, handler) {
    if (typeof sel === 'function') {
      handler = sel;
      sel = null;
    }
    if (!root) return;
    root.addEventListener(type, function (e) {
      if (!sel) return handler(e, e.target);
      var t = e.target.closest(sel);
      if (t && root.contains(t)) handler(e, t);
    });
  };

  D.html = function (strings) {
    var out = strings[0];
    for (var i = 1; i < arguments.length; i++) {
      out += arguments[i] + strings[i];
    }
    return out;
  };

  D.setHTML = function (root, html) {
    if (root) root.innerHTML = html;
  };

  GOS.dom = D;
})(window.GOS);
