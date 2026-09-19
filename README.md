# 个人成长 OS（Growth OS）· Android App 第一版高保真原型

基于《个人成长 OS App 产品需求文档 V1》实现的**可交互高保真原型**。零依赖、零构建，双击 `index.html` 即可在浏览器里以 Android 手机壳形式运行。

## 打开方式

直接双击 `index.html`（推荐 Chrome / Edge）。首次打开会落在「今日」页。

可选参数：

| 参数 | 作用 |
|---|---|
| `?dev=1` | 控制台打印种子数据自洽校验结果 |
| `?today=auto` | 用真实系统日期代替固定的演示日期 2026-09-19 |

> 说明：演示日期默认固定为 **2026-09-19（星期六）**，这样 PRD 里的文案（"9月19日 · 星期六"、周报区间 9/14～9/20）才能稳定复现。

## 第一版覆盖范围

PRD 第 58 节点名的 6 个页面 + 3 项配套，全部做完：

| # | 模块 | 入口 |
|---|---|---|
| ① | 今日 | 底部 Tab |
| ② | 成长目标 | 底部 Tab |
| ③ | 目标详情 | 成长页点任意目标卡 |
| ④ | 灵感 | 底部 Tab |
| ⑤ | 阅读 | 底部 Tab（点书进入阅读记录） |
| ⑥ | 周报 | 今日页顶部「本周成长报告」卡 / 我的页入口 |
| ⑦ | 全局添加 ＋ | 右下角悬浮按钮，展开 5 个快捷入口 |
| ⑧ | 通知系统 | 我的 → 通知；进入 App 4 秒后也会推送一条横幅 |
| ⑨ | 我的 | 底部 Tab |

另外附带：成长趋势 / 习惯统计 / 阅读统计 / 灵感统计 4 个数据页、主题切换、关于与重置数据。

## 目录结构

```
index.html
assets/css/
  tokens.css        设计 token（唯一定义颜色/圆角/阴影/间距/字号的地方）
  base.css          reset 与工具类
  shell.css         手机外壳、状态栏、Tab 容器、二级页栈
  components.css    卡片/按钮/进度/行动行/时间线/Sheet/Toast/TabBar/FAB…
  pages/*.css       各页面布局（禁止重写圆角与阴影）
assets/js/
  core/             namespace / dom / bus / format / store / ui / router
  data/             schema / seed（PRD 数字自洽校准过的种子数据）
  components/       icon / fab / tabbar
  pages/            today / growth / goal-detail / capture / reading /
                    book-detail / weekly / stats / notifications / me
  app.js            启动 + 全局快速添加 + 应用内推送
```

## 数据是真的算出来的

所有展示数字都由 `assets/js/core/store.js` 的 `GOS.select` 从 actions 实时计算，没有一处写死在模板里。因此**在今日页完成一个行动，周报时长、目标进度、我的页本月时长会同时变化**——这是这个原型最值得演示的一点。

种子数据已按 PRD 示例校准（`node _check.js` 可复验）：

| PRD 数字 | 计算结果 |
|---|---|
| 今日完成率 72% · 3/5 项完成 · 85 分钟 | 85 ÷ 118 = 72.0% |
| 本周成长 6h 42min，比上周 +18% | 402min，上周 342min |
| 身体 2h 10min / 认知 2h 15min / 技能 2h 17min | 130 / 135 / 137 min |
| 本周灵感 17 条，形成行动 4 条 | 17 / 4 |
| 习惯完成率 82% | 14 / 17 |
| 本月成长 23h 40min · 坚持 21 天 · 完成率 78% | 1420min / 21 / 78.3% |
| 英语能力提升 62% · 连续 12 天 | 由 4 个里程碑均值算出 |

## 交互彩蛋

- 点行动**圆钮**直接完成；点**行**弹出 PRD 规定的 7 项操作（完成 / 开始计时 / 延后 30 分钟 / 改到晚些时候 / 改到明天 / 今天跳过 / 删除）
- 完成后有打勾动画，520ms 后卡片收起，折叠成「刚完成 N 项」
- 点今日页顶部周报卡可原地展开，或直接跳完整周报
- 阅读 → 点「创建行动」→ 真的会生成一条行动并出现在今日页
- 通知页的提醒卡给了 6 个按钮（开始 / 30分钟后 / 1小时后 / 今晚 21:30 / 改到明天 / 今天跳过），**永远不给"完成/未完成"二选一**
- 我的 → 主题，可一键切换柔和绿 / 浅蓝 / 暖黄

## 周报文案铁律

PRD 第 34 节：产品的角色是**记录 + 提醒 + 观察**，不是批评 + 督促 + 打分。
所有对比文案由 `fmtDelta()` 计算渲染，代码里不出现"只完成 / 不足 / 需要努力 / 未达标"这类措辞；下降时写成"比上周少 12 分钟，节奏也很稳"。

## 演示数据重置

我的 → 关于 → 「重置演示数据」。数据存在 `localStorage`（key `gos.v1`），file:// 下按目录隔离；若浏览器禁用了 localStorage，程序会自动降级为纯内存运行，不影响演示。

## 打包成真 Android APK

Capacitor 工程**已经配好了**（`android/`、`capacitor.config.json`、`package.json` 脚本、云端构建工作流都在）。你只差 JDK 21 + Android SDK 36。

完整步骤见 → **[PACKAGING.md](./PACKAGING.md)**，三条路径任选：

| 路径 | 适合 | 核心命令 |
|---|---|---|
| A. Android Studio | 第一次打包，最省事 | `npm run android` |
| B. 命令行 SDK | 不想装 Studio | `npm run apk` |
| C. GitHub Actions | 本机一个环境都不装 | 推仓库 → Run workflow |

产物：`android/app/build/outputs/apk/debug/app-debug.apk`（minSdk 24，Android 7.0+）

## 开发期脚本

| 命令 | 作用 |
|---|---|
| `npm run build` | 把 index.html + assets 同步到 `www/` |
| `npm run sync` | build + `cap sync android` |
| `npm run apk` | sync + Gradle 出 Debug APK |
| `node _check.js` | 打印种子数据的自洽校验结果 |
| `node _smoke.js` | jsdom 冒烟测试（需 `NODE_PATH` 指向装有 jsdom 的目录） |
