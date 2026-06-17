# HOME Pro — 思源主页插件

高仿 siyuan-homepage，提供个性化首页布局和丰富的功能模块，**完美适配移动端**。

## 功能特性

### 🧩 组件系统（13 个内置组件）

| 组件 | 类型 | 说明 |
|------|------|------|
| 🕐 时间日期 | 通用 | 实时时钟 + 日期显示 |
| 🌤 天气 | 通用 | 温度、天气描述 |
| 📊 统计卡片 | 统计 | 文档数、内容块数、标签数 |
| 💬 每日一言 | 通用 | 中英文名言警句 |
| ⏱ 倒计时 | 通用 | 距离目标日期的天数 |
| 📝 快速记录 | 任务 | 快速保存灵感（localStorage） |
| 📄 最近文档 | 文档 | 展示最近编辑的文档列表 |
| ⭐ 收藏文档 | 文档 | 展示收藏的文档 |
| ✅ 任务管理 | 任务 | 展示待办任务列表 |
| 🔥 创作热力图 | 统计 | GitHub 风格的一年创作贡献图 |
| 🔍 热搜 | 生活 | 热点话题展示 |
| ✏️ 自定义文本 | 通用 | 自定义 HTML 内容 |
| 📓 增强日记 | 任务 | 今日日记概览 + 快速创建 |

### 🎨 可定制主页

- 自定义标题、副标题、状态语
- 头像 & 横幅背景
- 组件启停、尺寸调整
- 列数、间距、圆角、边框开关
- 亮/暗/跟随系统 主题

### 📱 移动端适配

- 自适应列数（桌面 4 列 → 平板 2 列 → 手机 1 列）
- 触控友好的交互尺寸
- safe-area-inset 适配刘海屏
- 独立的 MobileHomepage 组件

## 构建

```bash
pnpm install
pnpm run dev    # 开发模式
pnpm run build  # 生产构建（输出到 dist/）
```

## 安装

1. 构建后，将 `dist/` 中的 `index.js`、`index.css`（即 `siyuan-homepage-pro.css`）和 `plugin.json` 放入 `{workspace}/data/plugins/siyuan-homepage-pro/`
2. 在思源集市中启用插件
3. 或在设置 - 集市 - 手动安装中选择 `dist/package.zip`

## 项目结构

```
src/
├── index.ts                          # 插件入口
├── types/index.ts                    # 类型定义
├── libs/
│   ├── api.ts                        # 思源内核 API 封装
│   ├── config.ts                     # 配置管理
│   ├── eventBus.ts                   # 事件总线
│   └── utils.ts                      # 工具函数
├── homepage/
│   ├── HomepagePanel.svelte          # 主页主面板
│   ├── Header.svelte                 # 头部组件
│   ├── WidgetGrid.svelte             # 组件网格布局
│   ├── style/global.css              # 全局样式
│   ├── settings/HomepageSettings.svelte  # 设置面板
│   └── mobile/MobileHomepage.svelte  # 移动端适配
└── components/widgets/               # 13 个内置组件
    ├── TimeDate.svelte
    ├── Weather.svelte
    ├── StatisticalCard.svelte
    ├── DailyQuote.svelte
    ├── Countdown.svelte
    ├── QuickNotes.svelte
    ├── LatestDocs.svelte
    ├── Favorites.svelte
    ├── Tasks.svelte
    ├── Heatmap.svelte
    ├── HotSearch.svelte
    ├── CustomText.svelte
    └── EnhancedDiary.svelte
```

## 技术栈

- **框架**: Svelte 5 + TypeScript
- **构建**: Vite 6
- **SDK**: siyuan 1.2.0
- **样式**: CSS Variables + 响应式媒体查询
- **外部依赖**: SortableJS, ECharts

## 许可证

MIT
