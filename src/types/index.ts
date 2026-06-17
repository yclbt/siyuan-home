/// <reference types="svelte" />

declare module "*.svelte" {
  import type { ComponentType } from "svelte";
  const component: ComponentType;
  export default component;
}

// ============ 思源内核类型 ============

export interface Notebook {
  id: string;
  name: string;
  icon: string;
  sort: number;
  closed: boolean;
}

export interface Document {
  id: string;
  name: string;
  path: string;
  hPath: string;
  icon: string;
  sort: number;
  updated: string;
  created: string;
  subDocCount: number;
  notebookId: string;
}

export interface Block {
  id: string;
  type: string;
  content: string;
  markdown: string;
  parentId: string;
  rootId: string;
}

export interface Attr {
  [key: string]: string;
}

// ============ 插件自身类型 ============

export type WidgetType =
  | "weather"
  | "timedate"
  | "statisticalCard"
  | "dailyQuote"
  | "countdown"
  | "quickNotes"
  | "latestDocs"
  | "favorites"
  | "childDocs"
  | "conditionDocs"
  | "sqlQuery"
  | "protyle"
  | "tasks"
  | "tasksPlus"
  | "enhancedDiary"
  | "latestDailyNotes"
  | "heatmap"
  | "visualChart"
  | "databaseChart"
  | "fixedAssets"
  | "focus"
  | "hotSearch"
  | "news"
  | "almanac"
  | "constellation"
  | "historyToday"
  | "musicPlayer"
  | "stickyNote"
  | "picCarousel"
  | "customText"
  | "webView"
  | "customHtml";

export type WidgetSize = "small" | "medium" | "large" | "xlarge";

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
  config: Record<string, any>;
  enabled: boolean;
}

export interface LayoutTemplate {
  name: string;
  label: string;
  widgets: WidgetInstance[];
}

export interface HomepageConfig {
  title: string;
  subtitle: string;
  avatar: string;
  banner: string;
  bannerEnabled: boolean;
  showHeader: boolean;
  statusText: string;
  statusType: "custom" | "ai" | "stats";
  layout: WidgetInstance[];
  layoutTemplate: string;
  theme: "light" | "dark" | "auto";
  columns: number;
  gap: number;
  widgetPadding: "compact" | "normal" | "comfortable";
  backgroundImage: string;
  backgroundOpacity: number;
  roundedCorners: boolean;
  showBorder: boolean;
  animationEnabled: boolean;
  autoRefresh: boolean;
  autoRefreshInterval: number; // minutes
}

export interface AIProvider {
  name: string;
  provider: "openai" | "anthropic" | "ollama" | "custom";
  apiKey: string;
  apiUrl: string;
  model: string;
  enabled: boolean;
}

export interface SearchProvider {
  name: string;
  provider: "serpapi" | "bing" | "custom";
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
}

// ============ 事件类型 ============

export type EventBusMap = {
  "homepage:widget-moved": { widgetId: string; x: number; y: number };
  "homepage:widget-resized": { widgetId: string; w: number; h: number };
  "homepage:widget-removed": { widgetId: string };
  "homepage:widget-added": { widget: WidgetInstance };
  "homepage:refresh": void;
  "homepage:config-changed": { config: HomepageConfig };
  "homepage:theme-changed": { theme: string };
  "homepage:mobile-toggle": { mobile: boolean };
};

export type HomepageEventName = keyof EventBusMap;
