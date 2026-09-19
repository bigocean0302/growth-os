/* namespace.js · 全局命名空间与加载契约 */
window.GOS = window.GOS || {};

GOS.pages = GOS.pages || {};
GOS.components = GOS.components || {};
GOS.data = GOS.data || {};

/* 演示日期：固定为 2026-09-19（星期六），保证文案与星期一致。
   加 ?today=auto 可切换到真实系统日期。 */
(function () {
  var q = location.search || '';
  var auto = /[?&]today=auto/.test(q);
  var d = auto ? new Date() : new Date(2026, 8, 19, 9, 41, 0, 0);
  d.setHours(0, 0, 0, 0);
  GOS.TODAY = d;
  GOS.NOW = auto ? new Date() : new Date(2026, 8, 19, 9, 41, 0, 0);
  GOS.DEV = /[?&]dev=1/.test(q);
})();

/* 页面模块契约：
   { id, tab:true?, render(), mount(root), refresh(root), unmount() } */
GOS.definePage = function (id, def) {
  def.id = id;
  GOS.pages[id] = def;
  return def;
};
