/* bus.js · 极简事件总线，支持按 scope 批量解绑 */
(function (GOS) {
  var map = {};

  var Bus = {
    on: function (evt, fn, scope) {
      (map[evt] = map[evt] || []).push({ fn: fn, scope: scope || null });
      return fn;
    },
    off: function (evt, fn, scope) {
      var list = map[evt];
      if (!list) return;
      if (!fn && !scope) { delete map[evt]; return; }
      map[evt] = list.filter(function (item) {
        if (fn && item.fn === fn) return false;
        if (scope && item.scope === scope) return false;
        return true;
      });
    },
    offScope: function (scope) {
      Object.keys(map).forEach(function (evt) {
        Bus.off(evt, null, scope);
      });
    },
    emit: function (evt, payload) {
      var list = (map[evt] || []).slice();
      list.forEach(function (item) {
        try { item.fn(payload); } catch (err) { console.error('[bus]', evt, err); }
      });
    }
  };

  GOS.bus = Bus;
})(window.GOS);
