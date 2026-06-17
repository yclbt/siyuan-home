<script lang="ts">
  import { onMount } from "svelte";
  import { configManager } from "@/libs/config";
  import { eventBus } from "@/libs/eventBus";
  import { isMobile as detectMobile, isDarkMode } from "@/libs/utils";
  import Header from "./Header.svelte";
  import WidgetGrid from "./WidgetGrid.svelte";
  import "./style/global.css";

  interface Plugin {
    [key: string]: any;
  }

  let {
    plugin,
    isMobile = false,
  }: { plugin: Plugin; isMobile: boolean } = $props();

  /** Reactive config snapshot from configManager */
  let config = $state(configManager.get());

  /** Loading state while config loads from disk */
  let loading = $state(true);

  /** Dark mode detection */
  let darkMode = $state(false);

  /**
   * Responsive columns:
   *   1 column  on mobile  (<768px)
   *   2 columns on tablet  (768-1024px)
   *   configured columns on desktop (>=1024px, default 4)
   */
  let columns = $derived.by(() => {
    if (isMobile) return 1;
    if (typeof window !== "undefined" && window.innerWidth < 1024) return 2;
    return config.columns || 4;
  });

  /** Only enabled widgets, passed down to the grid */
  let widgets = $derived(configManager.getWidgets());

  onMount(async () => {
    // 1. Load persisted config
    try {
      loading = true;
      await configManager.load();
      config = configManager.get();
      darkMode = isDarkMode();
    } catch (e) {
      console.error("[HomepagePanel] Failed to load config:", e);
    } finally {
      loading = false;
    }

    // 2. Listen for config changes from the manager
    configManager.onChange((newConfig) => {
      config = newConfig;
    });

    // 3. Listen for theme changes propagated by children
    const unsubTheme = eventBus.on("theme-changed", () => {
      darkMode = isDarkMode();
    });

    // 4. Listen for drag-reorder events from WidgetGrid
    const unsubReorder = eventBus.on(
      "widgets-reordered",
      (widgets: any[]) => {
        configManager.reorderWidgets(widgets);
      },
    );

    return () => {
      unsubTheme();
      unsubReorder();
    };
  });

  /**
   * Sync CSS custom properties whenever config/columns change.
   * This drives the responsive grid and spacing in global.css.
   */
  $effect(() => {
    document.documentElement.style.setProperty("--hp-columns", String(columns));
    document.documentElement.style.setProperty("--hp-gap", `${config.gap}px`);
    if (config.roundedCorners) {
      document.documentElement.style.setProperty(
        "--hp-card-radius",
        "12px",
      );
    } else {
      document.documentElement.style.setProperty("--hp-card-radius", "0px");
    }
  });
</script>

{#if loading}
  <div class="homepage-pro-app" class:dark={darkMode}>
    <div class="hp-loading">
      <div class="hp-spinner"></div>
    </div>
  </div>
{:else}
  <div class="homepage-pro-app" class:dark={darkMode}>
    <!-- ── Header ──────────────────────────────────── -->
    {#if config.showHeader !== false}
      <Header {config} {plugin} />
    {/if}

    <!-- ── Scrollable widget grid area ──────────────── -->
    <div class="hp-scroll">
      <WidgetGrid {widgets} {columns} {plugin} {config} {isMobile} />
    </div>
  </div>
{/if}
