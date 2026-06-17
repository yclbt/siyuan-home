<script lang="ts">
  /**
   * HomepageSettings.svelte
   * Comprehensive settings panel for the homepage plugin.
   * Svelte 5 runes syntax.
   */
  import { onMount } from "svelte";
  import { configManager } from "@/libs/config";
  import { eventBus } from "@/libs/eventBus";
  import type { HomepageConfig, WidgetInstance, WidgetSize, WidgetType } from "@/types";

  // ── Props ──────────────────────────────────────────────────────
  let { plugin }: { plugin: any } = $props();

  // ── Available widget types for "add widget" ────────────────────
  interface WidgetDef {
    type: WidgetType;
    label: string;
    icon: string;
  }

  const AVAILABLE_WIDGETS: WidgetDef[] = [
    { type: "timedate", label: "时间日期", icon: "🕐" },
    { type: "weather", label: "天气", icon: "🌤" },
    { type: "statisticalCard", label: "统计卡片", icon: "📊" },
    { type: "dailyQuote", label: "每日一言", icon: "💬" },
    { type: "countdown", label: "倒计时", icon: "⏳" },
    { type: "quickNotes", label: "快速记录", icon: "📝" },
    { type: "latestDocs", label: "最近文档", icon: "📄" },
    { type: "favorites", label: "收藏", icon: "⭐" },
    { type: "tasks", label: "任务管理", icon: "✅" },
    { type: "heatmap", label: "创作热力图", icon: "🔥" },
    { type: "hotSearch", label: "热搜", icon: "🔍" },
    { type: "customText", label: "自定义文本", icon: "✏️" },
  ];

  // ── Local editable copy of config ──────────────────────────────
  let config = $state<HomepageConfig>({ ...configManager.get() });
  let widgets = $state<WidgetInstance[]>(
    config.layout.map((w) => ({ ...w, config: { ...w.config } }))
  );
  let statusType = $state<"custom" | "stats">(config.statusType === "stats" ? "stats" : "custom");

  // ── Reset confirmation ───────────────────────────────────────
  let showResetConfirm = $state(false);

  // ── Add-widget dropdown ──────────────────────────────────────
  let showAddDropdown = $state(false);

  // ── Sync config.layout when widgets change ───────────────────
  $effect(() => {
    config.layout = widgets;
  });

  // ── Handlers ─────────────────────────────────────────────────

  /** Update a simple config field */
  function updateConfig<K extends keyof HomepageConfig>(
    key: K,
    value: HomepageConfig[K]
  ) {
    config = { ...config, [key]: value };
  }

  /** Toggle a widget's enabled state */
  function toggleWidget(id: string) {
    widgets = widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
  }

  /** Update a widget field */
  function updateWidget(id: string, field: string, value: any) {
    widgets = widgets.map((w) =>
      w.id === id ? { ...w, [field]: value } : w
    );
  }

  /** Remove a widget entirely */
  function removeWidget(id: string) {
    widgets = widgets.filter((w) => w.id !== id);
  }

  /** Add a new widget to the layout */
  function addWidget(type: WidgetType) {
    const existing = widgets.filter((w) => w.enabled);
    const maxY = existing.length > 0
      ? Math.max(...existing.map((w) => w.gridY + w.gridH))
      : 0;
    const newWidget: WidgetInstance = {
      id: `w-${type}-${Date.now()}`,
      type,
      title: AVAILABLE_WIDGETS.find((d) => d.type === type)?.label ?? type,
      size: "medium",
      gridX: 0,
      gridY: maxY,
      gridW: 2,
      gridH: 1,
      config: {},
      enabled: true,
    };
    widgets = [...widgets, newWidget];
    showAddDropdown = false;
  }

  /** Save configuration */
  function save() {
    configManager.setConfig({ ...config, layout: widgets });
    eventBus.emit("homepage:config-changed", { config: { ...config, layout: widgets } });
  }

  /** Reset to defaults */
  function confirmReset() {
    showResetConfirm = true;
  }

  function executeReset() {
    import("@/libs/config").then(({ DEFAULT_CONFIG }) => {
      const defaults = { ...DEFAULT_CONFIG };
      config = defaults;
      widgets = defaults.layout.map((w: WidgetInstance) => ({ ...w, config: { ...w.config } }));
      configManager.setConfig(defaults);
      eventBus.emit("homepage:config-changed", { config: defaults });
      showResetConfirm = false;
    });
  }

  function cancelReset() {
    showResetConfirm = false;
  }

  /** Close / back */
  function close() {
    eventBus.emit("homepage:refresh");
    if (plugin?.closeTab) {
      plugin.closeTab();
    }
  }

  // ── Size label helper ────────────────────────────────────────
  const SIZE_LABELS: Record<WidgetSize, string> = {
    small: "小",
    medium: "中",
    large: "大",
    xlarge: "超大",
  };

  // ── Load config on mount ─────────────────────────────────────
  onMount(async () => {
    await configManager.load();
    const loaded = configManager.get();
    config = { ...loaded };
    widgets = loaded.layout.map((w) => ({ ...w, config: { ...w.config } }));
    statusType = loaded.statusType === "stats" ? "stats" : "custom";
  });
</script>

<div class="hp-settings">
  <!-- ── Header ───────────────────────────────────────────── -->
  <div class="hp-settings-header">
    <h2>设置</h2>
    <div class="hp-settings-header-actions">
      <button class="hp-btn hp-btn-primary" onclick={save}>保存</button>
      <button class="hp-btn hp-btn-secondary" onclick={confirmReset}>重置默认</button>
      <button class="hp-btn hp-btn-ghost" onclick={close}>✕</button>
    </div>
  </div>

  <!-- ── 基本设置 ──────────────────────────────────────────── -->
  <section>
    <h3>基本设置</h3>

    <!-- Title -->
    <div class="hp-setting-group">
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">标题</div>
          <div class="desc">主页顶部显示的主标题</div>
        </div>
        <input
          type="text"
          value={config.title}
          oninput={(e) => updateConfig("title", (e.target as HTMLInputElement).value)}
          placeholder="我的主页"
        />
      </div>

      <!-- Subtitle -->
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">副标题</div>
          <div class="desc">标题下方显示的副标题文字</div>
        </div>
        <input
          type="text"
          value={config.subtitle}
          oninput={(e) => updateConfig("subtitle", (e.target as HTMLInputElement).value)}
          placeholder="欢迎回来"
        />
      </div>

      <!-- Status text / auto-stats -->
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">状态文字</div>
          <div class="desc">自定义或自动统计显示</div>
        </div>
        <select
          value={statusType}
          onchange={(e) => {
            const val = (e.target as HTMLSelectElement).value;
            statusType = val as "custom" | "stats";
            updateConfig("statusType", val === "stats" ? "stats" : "custom");
          }}
        >
          <option value="custom">自定义</option>
          <option value="stats">自动统计</option>
        </select>
      </div>

      {#if statusType === "custom"}
        <div class="hp-setting-row">
          <div class="hp-setting-label">
            <div class="label">自定义状态</div>
            <div class="desc">自定义状态文本内容</div>
          </div>
          <input
            type="text"
            value={config.statusText}
            oninput={(e) => updateConfig("statusText", (e.target as HTMLInputElement).value)}
            placeholder="今天也是元气满满的一天！"
          />
        </div>
      {/if}
    </div>

    <!-- Theme -->
    <div class="hp-setting-group">
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">主题</div>
          <div class="desc">页面配色方案</div>
        </div>
        <select
          value={config.theme}
          onchange={(e) => updateConfig("theme", (e.target as HTMLSelectElement).value as "light" | "dark" | "auto")}
        >
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>

      <!-- Columns -->
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">列数</div>
          <div class="desc">组件网格列数（2-6）</div>
        </div>
        <input
          type="range"
          min="2"
          max="6"
          step="1"
          value={config.columns}
          oninput={(e) => updateConfig("columns", parseInt((e.target as HTMLInputElement).value))}
        />
        <span class="hp-setting-value">{config.columns}</span>
      </div>

      <!-- Gap -->
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">间距</div>
          <div class="desc">组件之间的间距（px）</div>
        </div>
        <input
          type="range"
          min="8"
          max="32"
          step="2"
          value={config.gap}
          oninput={(e) => updateConfig("gap", parseInt((e.target as HTMLInputElement).value))}
        />
        <span class="hp-setting-value">{config.gap}px</span>
      </div>

      <!-- Rounded corners -->
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">圆角</div>
          <div class="desc">组件卡片圆角样式</div>
        </div>
        <label class="hp-toggle">
          <input
            type="checkbox"
            checked={config.roundedCorners}
            onchange={(e) => updateConfig("roundedCorners", (e.target as HTMLInputElement).checked)}
          />
          <span class="hp-toggle-slider"></span>
        </label>
      </div>

      <!-- Show border -->
      <div class="hp-setting-row">
        <div class="hp-setting-label">
          <div class="label">边框</div>
          <div class="desc">组件卡片边框显示</div>
        </div>
        <label class="hp-toggle">
          <input
            type="checkbox"
            checked={config.showBorder}
            onchange={(e) => updateConfig("showBorder", (e.target as HTMLInputElement).checked)}
          />
          <span class="hp-toggle-slider"></span>
        </label>
      </div>
    </div>
  </section>

  <!-- ── 组件管理 ──────────────────────────────────────────── -->
  <section>
    <h3>组件管理</h3>

    <div class="hp-setting-group">
      {#if widgets.length === 0}
        <div class="hp-no-widgets">暂无组件。点击下方按钮添加。</div>
      {:else}
        {#each widgets as widget (widget.id)}
          <div class="hp-widget-item" class:disabled={!widget.enabled}>
            <!-- Enable/disable toggle -->
            <label class="hp-toggle">
              <input
                type="checkbox"
                checked={widget.enabled}
                onchange={() => toggleWidget(widget.id)}
              />
              <span class="hp-toggle-slider"></span>
            </label>

            <!-- Widget type icon & title -->
            <div class="hp-widget-info">
              <span class="hp-widget-icon">
                {AVAILABLE_WIDGETS.find((d) => d.type === widget.type)?.icon ?? "📦"}
              </span>
              <div class="hp-widget-title-group">
                <span class="hp-widget-title">{widget.title}</span>
                <span class="hp-widget-type-tag">{widget.type}</span>
              </div>
            </div>

            <!-- Size selector -->
            <select
              value={widget.size}
              onchange={(e) =>
                updateWidget(widget.id, "size", (e.target as HTMLSelectElement).value as WidgetSize)
              }
              disabled={!widget.enabled}
            >
              {#each Object.entries(SIZE_LABELS) as [key, label]}
                <option value={key}>{label}</option>
              {/each}
            </select>

            <!-- Grid position -->
            <span class="hp-widget-pos">
              ({widget.gridX},{widget.gridY}) {widget.gridW}×{widget.gridH}
            </span>

            <!-- Remove button -->
            <button
              class="hp-widget-remove"
              onclick={() => removeWidget(widget.id)}
              title="移除组件"
              aria-label="移除组件"
            >✕</button>
          </div>
        {/each}
      {/if}

      <!-- Add widget button -->
      <div class="hp-add-widget-area">
        <div class="hp-add-widget-dropdown" class:open={showAddDropdown}>
          <button
            class="hp-btn hp-btn-primary hp-add-widget-btn"
            onclick={() => (showAddDropdown = !showAddDropdown)}
          >
            + 添加组件
          </button>
          {#if showAddDropdown}
            <div class="hp-add-widget-menu">
              {#each AVAILABLE_WIDGETS as def}
                <button
                  class="hp-add-widget-option"
                  onclick={() => addWidget(def.type)}
                >
                  <span class="hp-widget-icon">{def.icon}</span>
                  <span>{def.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- ── Reset Confirmation Modal ──────────────────────────── -->
  {#if showResetConfirm}
    <div class="hp-modal-overlay" onclick={cancelReset}>
      <div class="hp-modal" onclick={(e) => e.stopPropagation()}>
        <h3>确认重置</h3>
        <p>确定要将所有设置恢复为默认值吗？此操作无法撤销。</p>
        <div class="hp-modal-actions">
          <button class="hp-btn hp-btn-danger" onclick={executeReset}>确认重置</button>
          <button class="hp-btn hp-btn-ghost" onclick={cancelReset}>取消</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* ── Settings header ───────────────────────────────────── */
  .hp-settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .hp-settings-header h2 {
    margin: 0;
  }

  .hp-settings-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* ── Buttons ────────────────────────────────────────────── */
  .hp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    border: 1px solid var(--hp-border);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    background: var(--hp-card-bg);
    color: var(--hp-text);
    line-height: 1.4;
  }

  .hp-btn:hover {
    opacity: 0.9;
  }

  .hp-btn-primary {
    background: var(--hp-primary);
    color: #fff;
    border-color: var(--hp-primary);
  }

  .hp-btn-secondary {
    background: transparent;
    border-color: var(--hp-border);
    color: var(--hp-text);
  }

  .hp-btn-secondary:hover {
    background: var(--hp-bg2);
  }

  .hp-btn-ghost {
    background: transparent;
    border: none;
    font-size: 18px;
    padding: 4px 8px;
    color: var(--hp-text2);
  }

  .hp-btn-ghost:hover {
    color: var(--hp-text);
  }

  .hp-btn-danger {
    background: #e03131;
    color: #fff;
    border-color: #e03131;
  }

  /* ── Range slider value label ──────────────────────────── */
  .hp-setting-value {
    min-width: 40px;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    color: var(--hp-text2);
  }

  /* ── Widget list items ─────────────────────────────────── */
  .hp-widget-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    border-bottom: 1px solid var(--hp-border);
    transition: opacity 0.2s;
  }

  .hp-widget-item:last-child {
    border-bottom: none;
  }

  .hp-widget-item.disabled {
    opacity: 0.5;
  }

  .hp-widget-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .hp-widget-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .hp-widget-title-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .hp-widget-title {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hp-widget-type-tag {
    font-size: 11px;
    color: var(--hp-text2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hp-widget-item select {
    border: 1px solid var(--hp-border);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12px;
    background: var(--hp-bg);
    color: var(--hp-text);
    outline: none;
    flex-shrink: 0;
  }

  .hp-widget-item select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hp-widget-pos {
    font-size: 11px;
    color: var(--hp-text2);
    font-family: monospace;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .hp-widget-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: var(--hp-text2);
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  .hp-widget-remove:hover {
    background: rgba(224, 49, 49, 0.1);
    color: #e03131;
  }

  /* ── No widgets ─────────────────────────────────────────── */
  .hp-no-widgets {
    text-align: center;
    padding: 24px;
    color: var(--hp-text2);
    font-size: 14px;
  }

  /* ── Add widget area ────────────────────────────────────── */
  .hp-add-widget-area {
    padding: 12px 8px 4px;
    border-top: 1px solid var(--hp-border);
  }

  .hp-add-widget-dropdown {
    position: relative;
    display: inline-block;
  }

  .hp-add-widget-btn {
    width: 100%;
  }

  .hp-add-widget-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 100;
    margin-top: 4px;
    background: var(--hp-card-bg);
    border: 1px solid var(--hp-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    min-width: 200px;
    max-height: 280px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .hp-add-widget-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 14px;
    border: none;
    background: none;
    font-size: 13px;
    color: var(--hp-text);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .hp-add-widget-option:hover {
    background: var(--hp-bg2);
  }

  /* ── Modal ──────────────────────────────────────────────── */
  .hp-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .hp-modal {
    background: var(--hp-card-bg);
    border: 1px solid var(--hp-border);
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .hp-modal h3 {
    margin: 0 0 12px;
    font-size: 18px;
  }

  .hp-modal p {
    margin: 0 0 20px;
    font-size: 14px;
    color: var(--hp-text2);
    line-height: 1.5;
  }

  .hp-modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Toggle already defined in global.css ──────────────── */
  /* (repeated here for scoped safety in older Svelte versions) */
  .hp-toggle {
    position: relative;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
  }

  .hp-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .hp-toggle-slider {
    position: absolute;
    inset: 0;
    background: var(--hp-border);
    border-radius: 11px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .hp-toggle-slider::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    left: 2px;
    top: 2px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .hp-toggle input:checked + .hp-toggle-slider {
    background: var(--hp-primary);
  }

  .hp-toggle input:checked + .hp-toggle-slider::before {
    transform: translateX(18px);
  }
</style>
