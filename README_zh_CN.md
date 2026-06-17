# HOME Pro — 思源主页插件

高仿 siyuan-homepage，提供个性化首页布局和丰富的功能模块，**完美适配移动端**。

---

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

---

## 安装方法

### 方法一：从集市安装

1. 打开思源笔记
2. 进入 **设置 → 集市 → 插件**
3. 搜索 **"主页 Pro"**
4. 点击安装

### 方法二：手动安装

1. 从 [Releases](https://github.com/YOUR_USERNAME/siyuan-homepage-pro/releases) 下载 `package.zip`
2. 将压缩包解压到你的思源工作空间的 `data/plugins/siyuan-homepage-pro/` 目录下
3. 重启思源或在 **设置 → 集市 → 插件** 中启用

---

## 构建与开发

### 前置要求

- Node.js >= 18
- pnpm（推荐）或 npm

### 命令

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化，自动构建）
pnpm run dev

# 生产构建（输出到 dist/）
pnpm run build

# 创建开发链接（将 dist/ 链接到思源插件目录，方便调试）
pnpm run make-link
```

**make-link** 命令会引导你输入思源工作空间路径，然后创建一个符号链接，使思源能够自动检测 `dist/` 目录的变更。

---

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

---

## 技术栈

- **框架**: Svelte 5 + TypeScript
- **构建**: Vite 6
- **SDK**: siyuan 1.2.0
- **样式**: CSS Variables + 响应式媒体查询
- **外部依赖**: SortableJS, ECharts

---

## 许可证

MIT
