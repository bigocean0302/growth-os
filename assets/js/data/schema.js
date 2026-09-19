/* schema.js · 数据模型常量与表结构说明 */

/*
  users / growth_areas / goals / milestones / habits / actions / schedules /
  reminders / inspirations / books / reading_logs / reviews / tags / notifications
*/

(function (GOS) {
  GOS.schema = {
    STATUS: {
      pending: { key: 'pending', label: '待完成', symbol: '○' },
      doing: { key: 'doing', label: '进行中', symbol: '◐' },
      completed: { key: 'completed', label: '已完成', symbol: '✓' },
      deferred: { key: 'deferred', label: '已延后', symbol: '→' },
      skipped: { key: 'skipped', label: '已跳过', symbol: '×' }
    },
    STATUS_ORDER: ['doing', 'pending', 'deferred', 'completed', 'skipped'],

    AREA: {
      body: { key: 'body', label: '身体', emoji: '🏃', desc: '运动 / 睡眠 / 体能' },
      mind: { key: 'mind', label: '认知', emoji: '🧠', desc: '阅读 / 写作 / 思考' },
      skill: { key: 'skill', label: '技能', emoji: '💻', desc: '英语 / AI / 编程 / 专业能力' },
      life: { key: 'life', label: '生活', emoji: '🌱', desc: '兴趣 / 财务 / 人际' }
    },
    AREA_ORDER: ['body', 'mind', 'skill', 'life'],

    ACTION_TYPE: {
      habit: 'habit', reading: 'reading', exercise: 'exercise',
      learning: 'learning', reflection: 'reflection', custom: 'custom'
    },

    INSP_STATUS: {
      inbox: 'inbox', saved: 'saved', converted: 'converted', archived: 'archived'
    },

    BOOK_STATUS: {
      planned: 'planned', reading: 'reading', completed: 'completed', abandoned: 'abandoned'
    },

    TAGS: ['工作', '阅读', '生活', '学习', '健康', '技能']
  };
})(window.GOS);
