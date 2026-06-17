/**
 * 配置管理模块
 */
import type { HomepageConfig, WidgetInstance } from "@/types";
import { getFile, putFile } from "@/libs/api";

const CONFIG_PATH = "/data/storage/petal/homepage-pro/config.json";

const DEFAULT_WIDGETS: WidgetInstance[] = [
  {
    id: "w-timedate", type: "timedate", title: "时间日期",
    size: "small", gridX: 0, gridY: 0, gridW: 1, gridH: 1, config: {}, enabled: true,
  },
  {
    id: "w-statistical", type: "statisticalCard", title: "统计卡片",
    size: "small", gridX: 1, gridY: 0, gridW: 1, gridH: 1, config: {}, enabled: true,
  },
  {
    id: "w-dailyquote", type: "dailyQuote", title: "每日一言",
    size: "medium", gridX: 2, gridY: 0, gridW: 2, gridH: 1, config: {}, enabled: true,
  },
  {
    id: "w-weather", type: "weather", title: "天气",
    size: "medium", gridX: 0, gridY: 1, gridW: 2, gridH: 1, config: {}, enabled: true,
  },
  {
    id: "w-latestdocs", type: "latestDocs", title: "最近文档",
    size: "large", gridX: 2, gridY: 1, gridW: 2, gridH: 2, config: { limit: 10 }, enabled: true,
  },
  {
    id: "w-heatmap", type: "heatmap", title: "创作热力图",
    size: "large", gridX: 0, gridY: 2, gridW: 2, gridH: 2, config: {}, enabled: true,
  },
  {
    id: "w-tasks", type: "tasks", title: "任务管理",
    size: "medium", gridX: 0, gridY: 4, gridW: 2, gridH: 2, config: {}, enabled: true,
  },
  {
    id: "w-quicknotes", type: "quickNotes", title: "快速记录",
    size: "small", gridX: 2, gridY: 3, gridW: 1, gridH: 1, config: {}, enabled: true,
  },
  {
    id: "w-countdown", type: "countdown", title: "倒计时",
    size: "small", gridX: 3, gridY: 3, gridW: 1, gridH: 1, config: {}, enabled: false,
  },
  {
    id: "w-hotsearch", type: "hotSearch", title: "热搜",
    size: "medium", gridX: 0, gridY: 6, gridW: 2, gridH: 1, config: {}, enabled: false,
  },
];

export const DEFAULT_CONFIG: HomepageConfig = {
  title: "我的主页",
  subtitle: "欢迎回来",
  avatar: "",
  banner: "",
  bannerEnabled: true,
  showHeader: true,
  statusText: "今天也是元气满满的一天！",
  statusType: "custom",
  layout: DEFAULT_WIDGETS,
  layoutTemplate: "default",
  theme: "auto",
  columns: 4,
  gap: 16,
  widgetPadding: "normal",
  backgroundImage: "",
  backgroundOpacity: 0.1,
  roundedCorners: true,
  showBorder: false,
  animationEnabled: true,
  autoRefresh: false,
  autoRefreshInterval: 5,
};

class ConfigManager {
  private config: HomepageConfig = { ...DEFAULT_CONFIG };
  private _onChange: ((config: HomepageConfig) => void) | null = null;

  get(): HomepageConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<HomepageConfig>): void {
    this.config = { ...this.config, ...config };
    this._save();
    this._onChange?.(this.config);
  }

  getWidgets(): WidgetInstance[] {
    return this.config.layout.filter((w) => w.enabled);
  }

  updateWidget(id: string, updates: Partial<WidgetInstance>): void {
    this.config.layout = this.config.layout.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    this._save();
    this._onChange?.(this.config);
  }

  addWidget(widget: WidgetInstance): void {
    this.config.layout.push(widget);
    this._save();
    this._onChange?.(this.config);
  }

  removeWidget(id: string): void {
    this.config.layout = this.config.layout.map((w) =>
      w.id === id ? { ...w, enabled: false } : w
    );
    this._save();
    this._onChange?.(this.config);
  }

  reorderWidgets(widgets: WidgetInstance[]): void {
    this.config.layout = widgets;
    this._save();
    this._onChange?.(this.config);
  }

  onChange(fn: (config: HomepageConfig) => void): void {
    this._onChange = fn;
  }

  async load(): Promise<HomepageConfig> {
    try {
      const raw = await getFile(CONFIG_PATH);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
        // Ensure all default widgets exist
        for (const def of DEFAULT_WIDGETS) {
          if (!this.config.layout.find((w) => w.id === def.id)) {
            this.config.layout.push(def);
          }
        }
      }
    } catch {
      // First load, use defaults
      await this._save();
    }
    return this.config;
  }

  private async _save(): Promise<void> {
    try {
      await putFile(CONFIG_PATH, JSON.stringify(this.config, null, 2));
    } catch (e) {
      console.error("[Homepage] Config save failed:", e);
    }
  }
}

export const configManager = new ConfigManager();
