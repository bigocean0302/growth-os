/* format.js · 时间与数字格式化 */
(function (GOS) {
  var WEEK_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var F = {
    pad: pad,

    /* 85 -> "1h25min"；402 -> "6h 42min" */
    fmtDuration: function (min, spaced) {
      min = Math.max(0, Math.round(min || 0));
      var h = Math.floor(min / 60), m = min % 60;
      var s = h > 0 ? (h + 'h' + (spaced === false ? '' : ' ') + pad(m) + 'min') : (m + 'min');
      return s;
    },

    /* 85 -> "85 分钟" */
    fmtMinutes: function (min) {
      return Math.round(min || 0) + ' 分钟';
    },

    /* 3.5 -> "3.5h" */
    fmtHours: function (hour) {
      return (Math.round((hour || 0) * 10) / 10) + 'h';
    },

    fmtClock: function (d) {
      d = (d instanceof Date) ? d : new Date(d);
      return pad(d.getHours()) + ':' + pad(d.getMinutes());
    },

    /* 2026-09-19 -> "9月19日 · 星期六" */
    fmtDateHead: function (d) {
      d = (d instanceof Date) ? d : new Date(d);
      return (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + WEEK_CN[d.getDay()];
    },

    /* -> "2026/09/01" */
    fmtDate: function (d) {
      d = (d instanceof Date) ? d : new Date(d);
      return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
    },

    /* -> "9月15日" */
    fmtShortDate: function (d) {
      d = (d instanceof Date) ? d : new Date(d);
      return (d.getMonth() + 1) + '月' + d.getDate() + '日';
    },

    /* -> "9/14～9/20" */
    weekRange: function (start, end) {
      return (start.getMonth() + 1) + '/' + start.getDate() + '～' + (end.getMonth() + 1) + '/' + end.getDate();
    },

    /* 相对分组：今天 / 昨天 / 本周 / 更早 */
    relDay: function (d, today) {
      var a = new Date(d); a.setHours(0, 0, 0, 0);
      var b = new Date(today); b.setHours(0, 0, 0, 0);
      var diff = Math.round((b - a) / 86400000);
      if (diff === 0) return '今天';
      if (diff === 1) return '昨天';
      if (diff > 1 && diff < 7) return '本周';
      return '更早';
    },

    daysBetween: function (a, b) {
      var x = new Date(a); x.setHours(0, 0, 0, 0);
      var y = new Date(b); y.setHours(0, 0, 0, 0);
      return Math.round((y - x) / 86400000);
    },

    pct: function (v) { return Math.round((v || 0) * 100) + '%'; },

    /* 周报文案铁律：只做观察，不做批评。所有对比文案由本函数生成。 */
    fmtDelta: function (cur, prev, unit) {
      unit = unit || '';
      if (!prev) return { icon: '', text: '本周刚刚开始记录', tone: 'flat' };
      var diff = cur - prev;
      if (diff >= 0) {
        var p = Math.round(diff / prev * 100);
        return { icon: '↑', text: '比上周 +' + p + '%', tone: 'up' };
      }
      var d = Math.abs(diff);
      if (unit === 'min') {
        return { icon: '↓', text: '比上周少 ' + d + ' 分钟，节奏也很稳', tone: 'flat' };
      }
      return { icon: '↓', text: '比上周少 ' + d + ' ' + (unit || '次') + '，继续保持', tone: 'flat' };
    },

    /* 本周一 00:00 */
    weekStart: function (d, offset) {
      var t = new Date(d);
      t.setHours(0, 0, 0, 0);
      var day = t.getDay() === 0 ? 7 : t.getDay();
      t.setDate(t.getDate() - (day - 1) + (offset || 0) * 7);
      return t;
    },

    addDays: function (d, n) {
      var t = new Date(d);
      t.setDate(t.getDate() + n);
      return t;
    },

    sameDay: function (a, b) {
      var x = new Date(a), y = new Date(b);
      return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
    },

    easeOutCubic: function (t) { return 1 - Math.pow(1 - t, 3); }
  };

  GOS.fmt = F;
})(window.GOS);
