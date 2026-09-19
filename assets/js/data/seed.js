/* seed.js · 演示种子数据
   所有展示数字均由 actions 计算得出，种子本身已按 PRD 示例做过自洽校准：
     今日 118min 计划 / 已投入 85min → 72%，3/5 项完成
     本周 402min = 6h42min，上周 342min → +18%
     本月 1420min = 23h40min，连续 21 天，完成率 78%
*/
(function (GOS) {
  var S = GOS.schema;

  function at(iso, hhmm) {
    return new Date(iso + 'T' + hhmm + ':00');
  }

  var seq = 0;
  function A(title, area, type, min, status, hhmm, goal, invested) {
    return {
      id: 'a' + (++seq),
      title: title, area: area, type: type,
      minutes: min, invested: invested == null ? (status === 'completed' ? min : 0) : invested,
      status: status, time: hhmm, goalId: goal || null
    };
  }

  /* ---------- 逐日行动计划（8/30 ~ 9/19） ---------- */
  var PLAN = {
    '2026-08-30': [A('读《原子习惯》', 'mind', 'reading', 20, 'completed', '21:00', 'g3')],
    '2026-08-31': [
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:10', 'g1'),
      A('读《人类简史》', 'mind', 'reading', 20, 'completed', '21:00', 'g3')
    ],

    '2026-09-01': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('单词复习', 'skill', 'learning', 20, 'completed', '22:00', 'g1'),
      A('力量训练', 'body', 'exercise', 30, 'skipped', '19:30', 'g2')
    ],
    '2026-09-02': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('单词复习', 'skill', 'learning', 20, 'completed', '22:00', 'g1'),
      A('写日记', 'life', 'reflection', 30, 'skipped', '22:30', null)
    ],
    '2026-09-03': [
      A('力量训练', 'body', 'exercise', 25, 'completed', '19:30', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《人类简史》', 'mind', 'reading', 30, 'completed', '21:00', 'g3'),
      A('单词复习', 'skill', 'learning', 20, 'completed', '22:00', 'g1')
    ],
    '2026-09-04': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('单词复习', 'skill', 'learning', 20, 'completed', '22:00', 'g1'),
      A('写作输出', 'mind', 'reflection', 30, 'skipped', '21:30', 'g3')
    ],
    '2026-09-05': [
      A('长跑', 'body', 'exercise', 45, 'completed', '08:00', 'g2'),
      A('力量训练', 'body', 'exercise', 28, 'completed', '18:00', 'g2'),
      A('读《原子习惯》', 'mind', 'reading', 45, 'completed', '15:00', 'g3'),
      A('英语听力', 'skill', 'learning', 30, 'completed', '10:00', 'g1'),
      A('周复盘', 'mind', 'reflection', 30, 'skipped', '20:30', null)
    ],
    '2026-09-06': [
      A('长跑', 'body', 'exercise', 45, 'completed', '08:00', 'g2'),
      A('力量训练', 'body', 'exercise', 28, 'completed', '18:00', 'g2'),
      A('读《人类简史》', 'mind', 'reading', 45, 'completed', '15:00', 'g3'),
      A('英语听力', 'skill', 'learning', 30, 'completed', '10:00', 'g1'),
      A('早睡打卡', 'life', 'habit', 30, 'skipped', '23:00', 'g5')
    ],

    '2026-09-07': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('读《原子习惯》', 'mind', 'reading', 20, 'completed', '12:30', 'g3'),
      A('力量训练', 'body', 'exercise', 30, 'skipped', '19:30', 'g2')
    ],
    '2026-09-08': [
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('力量训练', 'body', 'exercise', 25, 'completed', '19:30', 'g2'),
      A('读《人类简史》', 'mind', 'reading', 10, 'completed', '21:00', 'g3'),
      A('跑步', 'body', 'exercise', 30, 'skipped', '07:00', 'g2')
    ],
    '2026-09-09': [
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 15, 'completed', '12:30', 'g3'),
      A('力量训练', 'body', 'exercise', 30, 'skipped', '19:30', 'g2')
    ],
    '2026-09-10': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('AI 学习', 'skill', 'learning', 15, 'completed', '21:00', 'g4'),
      A('读《原子习惯》', 'mind', 'reading', 30, 'skipped', '12:30', 'g3')
    ],
    '2026-09-11': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('单词复习', 'skill', 'learning', 30, 'skipped', '22:00', 'g1')
    ],
    '2026-09-12': [
      A('英语听力', 'skill', 'learning', 15, 'completed', '09:00', 'g1'),
      A('读《人类简史》', 'mind', 'reading', 15, 'completed', '15:00', 'g3')
    ],
    '2026-09-13': [
      A('单词复习', 'skill', 'learning', 12, 'completed', '09:30', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 20, 'completed', '14:00', 'g3'),
      A('跑步', 'body', 'exercise', 30, 'skipped', '08:00', 'g2')
    ],

    '2026-09-14': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:00', 'g2'),
      A('英语听力', 'skill', 'learning', 15, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('力量训练', 'body', 'exercise', 30, 'skipped', '19:30', 'g2')
    ],
    '2026-09-15': [
      A('英语听力', 'skill', 'learning', 15, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 20, 'completed', '12:30', 'g3')
    ],
    '2026-09-16': [
      A('单词复习', 'skill', 'learning', 12, 'completed', '08:30', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 20, 'completed', '12:30', 'g3')
    ],
    '2026-09-17': [
      A('英语听力', 'skill', 'learning', 15, 'completed', '08:00', 'g1'),
      A('AI 学习', 'skill', 'learning', 30, 'completed', '20:00', 'g4'),
      A('力量训练', 'body', 'exercise', 25, 'completed', '19:30', 'g2'),
      A('读《人类简史》', 'mind', 'reading', 10, 'completed', '22:00', 'g3')
    ],
    '2026-09-18': [
      A('英语听力', 'skill', 'learning', 15, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('AI 学习', 'skill', 'learning', 15, 'completed', '20:30', 'g4'),
      A('跑步', 'body', 'exercise', 45, 'completed', '07:00', 'g2')
    ],

    /* 今天 */
    '2026-09-19': [
      A('跑步', 'body', 'exercise', 30, 'completed', '07:30', 'g2'),
      A('英语听力', 'skill', 'learning', 20, 'completed', '08:00', 'g1'),
      A('读《原子习惯》', 'mind', 'reading', 25, 'completed', '12:30', 'g3'),
      A('力量训练', 'body', 'exercise', 28, 'pending', '19:30', 'g2'),
      A('周复盘', 'mind', 'reflection', 15, 'doing', '21:00', null, 10)
    ]
  };

  /* ---------- 目标 ---------- */
  var GOALS = [
    {
      id: 'g1', title: '英语能力提升', area: 'skill',
      desc: '能够进行专业英文交流',
      start: '2026-09-01', target: '2027-06-30',
      weeklyTargetMin: 120, why: '能直接读英文文档、开会不再卡壳',
      milestones: [
        { id: 'm1', title: '核心词汇 3000', pct: 100, doneAt: '2026-08-20' },
        { id: 'm2', title: '完成初级听力', pct: 100, doneAt: '2026-09-05' },
        { id: 'm3', title: '技术英文阅读', pct: 40 },
        { id: 'm4', title: '专业口语交流', pct: 10 }
      ]
    },
    {
      id: 'g2', title: '每周运动 3 次', area: 'body',
      desc: '保持体能与整天的精力',
      start: '2026-08-01', target: '2027-02-28',
      weeklyTargetMin: 150, why: '下午不犯困，体能不掉线',
      milestones: [
        { id: 'm5', title: '每周 3 次 连续 4 周', pct: 100, doneAt: '2026-09-01' },
        { id: 'm6', title: '5 公里跑进 30 分钟', pct: 35 },
        { id: 'm7', title: '体脂降到 18%', pct: 0 }
      ]
    },
    {
      id: 'g3', title: '一年读 12 本书', area: 'mind',
      desc: '建立系统认知，而不是碎片输入',
      start: '2026-01-01', target: '2026-12-31',
      weeklyTargetMin: 180, why: '把看过的东西变成自己的框架',
      milestones: [
        { id: 'm8', title: '读完 4 本', pct: 100, doneAt: '2026-06-12' },
        { id: 'm9', title: '读完 8 本', pct: 75 },
        { id: 'm10', title: '读完 12 本', pct: 0 }
      ]
    },
    {
      id: 'g4', title: 'AI 应用能力', area: 'skill',
      desc: '把 AI 真正用进日常工作',
      start: '2026-08-15', target: '2027-03-31',
      weeklyTargetMin: 90, why: '让工具替我完成重复的部分',
      milestones: [
        { id: 'm11', title: '学完 Prompt 工程', pct: 70 },
        { id: 'm12', title: '用 AI 完成一次工作交付', pct: 20 },
        { id: 'm13', title: '搭建个人 AI 工作流', pct: 0 }
      ]
    },
    {
      id: 'g5', title: '早睡 23:30', area: 'life',
      desc: '睡够 7 小时，白天才有余量',
      start: '2026-09-01', target: '2026-12-31',
      weeklyTargetMin: 0, why: '早上能自然醒，不靠闹钟',
      milestones: [
        { id: 'm14', title: '连续 7 天 23:30 前睡', pct: 100, doneAt: '2026-09-10' },
        { id: 'm15', title: '连续 30 天', pct: 40 }
      ]
    },
    {
      id: 'g6', title: '记账习惯', area: 'life',
      desc: '看清钱到底去哪了',
      start: '2026-09-01', target: '2026-12-31',
      weeklyTargetMin: 30, why: '不为花钱焦虑，只为心里有数',
      milestones: [
        { id: 'm16', title: '连续记账 7 天', pct: 65 },
        { id: 'm17', title: '连续记账 30 天', pct: 10 },
        { id: 'm18', title: '完成一次月度复盘', pct: 0 }
      ]
    }
  ];

  /* ---------- 习惯 ---------- */
  var HABITS = [
    { id: 'h1', name: '每周运动', goalText: '每周 3 次', area: 'body', freq: '每周', type: 'exercise', minMinutes: 20, remind: '19:30', goalId: 'g2', color: 'body', timesPerWeek: 3 },
    { id: 'h2', name: '每天阅读', goalText: '每天 25 分钟', area: 'mind', freq: '每天', type: 'reading', minMinutes: 20, remind: '20:30', goalId: 'g3', color: 'mind' },
    { id: 'h3', name: '每天英语', goalText: '每天 15 分钟', area: 'skill', freq: '每天', type: 'learning', minMinutes: 15, remind: '08:00', goalId: 'g1', color: 'skill' }
  ];

  /* ---------- 书籍 ---------- */
  var BOOKS = [
    {
      id: 'b1', title: '原子习惯', author: '詹姆斯·克利尔', status: 'reading', progress: 67,
      dailyGoalMin: 25, remind: '20:30', lastChapter: '第 8 章', theme: 'teal',
      startedAt: '2026-08-24'
    },
    {
      id: 'b2', title: '人类简史', author: '尤瓦尔·赫拉利', status: 'reading', progress: 32,
      dailyGoalMin: 20, remind: '21:00', lastChapter: '第 5 章', theme: 'amber',
      startedAt: '2026-08-30'
    },
    {
      id: 'b3', title: 'AI 时代', author: '里德·霍夫曼', status: 'reading', progress: 18,
      dailyGoalMin: 20, remind: '21:00', lastChapter: '第 2 章', theme: 'violet',
      startedAt: '2026-09-10'
    },
    {
      id: 'b4', title: '认知觉醒', author: '周岭', status: 'completed', progress: 100,
      dailyGoalMin: 0, remind: '', lastChapter: '读完', theme: 'blue',
      startedAt: '2026-08-01', completedAt: '2026-09-15'
    },
    {
      id: 'b5', title: '深度工作', author: '卡尔·纽波特', status: 'completed', progress: 100,
      dailyGoalMin: 0, remind: '', lastChapter: '读完', theme: 'green',
      startedAt: '2026-07-20', completedAt: '2026-09-08'
    }
  ];

  /* ---------- 灵感 ---------- */
  var INSP = [
    { t: '关于周报的想法：不要把完成率做成 KPI，要做成观察。看到自己做了什么，比被打分有用得多。', tags: ['工作'], d: '2026-09-19 14:20', status: 'inbox' },
    { t: '英语听力可以放在通勤路上做，20 分钟刚好，不用专门腾时间。', tags: ['学习'], d: '2026-09-19 09:05', status: 'saved' },
    { t: '《原子习惯》第 8 章：环境设计 > 意志力。把跑鞋放在门口，比提醒自己"要自律"有效一百倍。', tags: ['阅读'], d: '2026-09-19 12:55', status: 'converted' },
    { t: '项目复盘可以固定用"事实—判断—下一步"三段式，省掉每次现想框架的时间。', tags: ['工作'], d: '2026-09-18 20:45', status: 'converted' },
    { t: '周末把下周的三件重点事前先排进日历，周一就不会被会议冲散。', tags: ['工作', '生活'], d: '2026-09-18 11:30', status: 'saved' },
    { t: 'AI 学习路径可以拆成三个阶段：会用 → 会改 → 会搭。现在我在第一个阶段的中段。', tags: ['学习', '技能'], d: '2026-09-18 21:10', status: 'saved' },
    { t: '跑步的时候不听播客，只听呼吸，反而更容易跑满 30 分钟。', tags: ['健康'], d: '2026-09-18 07:50', status: 'inbox' },
    { t: '记账这件事，难的不是记，是坚持到月底看那一次。', tags: ['生活'], d: '2026-09-17 22:10', status: 'inbox' },
    { t: '读《人类简史》：农业革命可能是"陷阱"，人均幸福感反而下降。增长不等于更好。', tags: ['阅读'], d: '2026-09-17 22:40', status: 'saved' },
    { t: '把"我要学英语"改成"我要能读完一篇英文技术文档"，目标一下子就具体了。', tags: ['学习'], d: '2026-09-16 13:20', status: 'converted' },
    { t: '提醒不要只给"完成/未完成"，给"稍后 30 分钟"这种选项，人才不会直接忽略它。', tags: ['工作'], d: '2026-09-16 20:15', status: 'saved' },
    { t: '每天 25 分钟阅读看起来很少，一个月就是 12 小时，差不多两本书。', tags: ['阅读'], d: '2026-09-15 12:40', status: 'inbox' },
    { t: '力量训练放在下班后 19:30 最容易坚持，再晚就开始找借口了。', tags: ['健康'], d: '2026-09-15 20:05', status: 'saved' },
    { t: '周报里那一句"本周完成得最好的"，比任何完成率数字都更能让人想继续。', tags: ['工作'], d: '2026-09-15 22:15', status: 'inbox' },
    { t: '《原子习惯》：习惯堆叠——做完 A 之后立刻做 B。把英语听力接在刷牙后面。', tags: ['阅读', '学习'], d: '2026-09-14 21:30', status: 'converted' },
    { t: '周末的长跑配一段 podcast，45 分钟一点都不难熬。', tags: ['健康'], d: '2026-09-14 09:20', status: 'inbox' },
    { t: '想做一个"本周完成得最好的一件事"的模块，周报里只看这一个就够了。', tags: ['工作'], d: '2026-09-14 22:00', status: 'saved' },
    { t: 'AI 时代的竞争力不是会用工具，是知道该让工具做什么。', tags: ['技能'], d: '2026-09-13 20:30', status: 'saved' },
    { t: '早睡的关键不是早点躺下，是早点把手机放到客厅。', tags: ['生活', '健康'], d: '2026-09-12 23:10', status: 'inbox' },
    { t: '读完一本书当天写三句话，一个月后还能想起来讲了什么。', tags: ['阅读'], d: '2026-09-10 21:40', status: 'saved' },
    { t: '成长这件事，最怕的不是慢，是看不到自己在动。', tags: [], d: '2026-09-08 22:30', status: 'saved' },
    { t: '把目标拆成里程碑之后，"还有多久能完成"就变成了一个可以回答的问题。', tags: ['工作'], d: '2026-09-05 15:20', status: 'inbox' }
  ];

  var EXCERPTS = [
    '环境设计比意志力更可靠。',
    '你不是在追求目标，你是在成为那样的人。',
    '每天进步 1%，一年后是 37 倍。',
    '习惯是自我改善的复利。',
    '真正的改变发生在身份认同改变的那一刻。',
    '让好习惯显而易见、有吸引力、简便易行、令人愉悦。',
    '你每一次选择，都是在为你想成为的人投票。'
  ];

  /* ---------- 提醒 / 通知 ---------- */
  var REMINDERS = [
    { id: 'r1', title: '力量训练', desc: '28 分钟 · 身体', time: '19:30', type: '一次性提醒', on: true, actionId: 'a-today-strength' },
    { id: 'r2', title: '每日成长提醒', desc: '看看今天还有什么没做完', time: '21:30', type: '每日成长提醒', on: true },
    { id: 'r3', title: '周复盘提醒', desc: '每周日 · 花 15 分钟回顾这一周', time: '20:30', type: '周复盘提醒', on: true },
    { id: 'r4', title: '每天阅读', desc: '25 分钟 · 认知', time: '20:30', type: '重复提醒', on: true },
    { id: 'r5', title: '英语听力', desc: '20 分钟 · 技能', time: '20:00', type: '重复提醒', on: true },
    { id: 'r6', title: '提前提醒', desc: '行动开始前 10 分钟', time: '', type: '提前提醒', on: false }
  ];

  GOS.seed = {
    build: function () {
      var actions = [];
      var idSeq = 0;
      Object.keys(PLAN).forEach(function (iso) {
        PLAN[iso].forEach(function (a) {
          a.id = 'act' + (++idSeq);
          a.date = iso;
          a.scheduledAt = at(iso, a.time);
          actions.push(a);
        });
      });

      /* 阅读摘录 */
      var logs = [];
      var books = BOOKS.map(function (b) { return Object.assign({}, b); });
      var li = 0;
      ['b1', 'b2', 'b3'].forEach(function (bid, bi) {
        for (var k = 0; k < 7; k++) {
          logs.push({
            id: 'rl' + (++li),
            bookId: bid,
            excerpt: EXCERPTS[(bi * 7 + k) % EXCERPTS.length],
            note: '',
            date: '2026-09-' + String(4 + k).replace(/^(\d)$/, '0$1'),
            tags: [['阅读'], ['学习'], ['技能']][bi]
          });
        }
      });

      var inspirations = INSP.map(function (it, i) {
        return {
          id: 'i' + (i + 1),
          content: it.t,
          tags: it.tags,
          createdAt: new Date(it.d.replace(' ', 'T') + ':00'),
          status: it.status,
          linkedGoalId: null,
          linkedActionId: null,
          source: '手动记录'
        };
      });

      return {
        version: 1,
        user: {
          name: '小林',
          initial: '林',
          joinedAt: '2026-05-14',
          days: 128,
          studyHistogram: { 19: 2, 20: 3, 21: 9, 22: 4 }
        },
        areas: S.AREA_ORDER.map(function (k) {
          return { id: k, key: k, label: S.AREA[k].label, emoji: S.AREA[k].emoji, desc: S.AREA[k].desc };
        }),
        goals: JSON.parse(JSON.stringify(GOALS)),
        habits: JSON.parse(JSON.stringify(HABITS)),
        actions: actions,
        books: books,
        readingLogs: logs,
        inspirations: inspirations,
        reminders: JSON.parse(JSON.stringify(REMINDERS)),
        notifications: [],
        reviews: [],
        theme: 'green'
      };
    },

    /* 开发期自洽校验（?dev=1 时打印） */
    assert: function (state) {
      var out = [];
      function inRange(d, s, e) {
        var t = new Date(d.date + 'T00:00:00');
        return t >= new Date(s + 'T00:00:00') && t <= new Date(e + 'T23:59:59');
      }
      var week = GOS.select.weekStats(0);
      var today = GOS.select.todayStats();
      var month = GOS.select.monthStats();
      out.push(['本周总时长', week.totalMin, 402]);
      out.push(['今日完成率', today.pct, 0.72]);
      out.push(['今日已投入分钟', today.doneMin, 85]);
      out.push(['今日完成项', today.doneCount + '/' + today.totalCount, '3/5']);
      out.push(['本月总时长', month.totalMin, 1420]);
      if (GOS.DEV) {
        console.group('[seed] 自洽校验');
        out.forEach(function (r) {
          console.log((Math.abs(r[1] - r[2]) < 1.5 ? '✓' : '!'), r[0], '=', r[1], '期望', r[2]);
        });
        console.groupEnd();
      }
      return out;
    }
  };
})(window.GOS);
