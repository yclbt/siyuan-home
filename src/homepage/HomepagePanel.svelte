<script lang="ts">
  import { onMount } from "svelte";
  import { configManager } from "@/libs/config";
  import { eventBus } from "@/libs/eventBus";
  import { isMobile as detectMobile, isDarkMode } from "@/libs/utils";
  import Header from "./Header.svelte";
  import WidgetGrid from "./WidgetGrid.svelte";
  import "./style/global.css";

  let { plugin, isMobile = false }: any = $props();

  let config = $state(configManager.get());
  let loading = $state(true);
  let darkMode = $state(false);

  let columns = $derived.by(() => {
    if (isMobile) return 1;
    if (typeof window !== "undefined" && window.innerWidth < 1024) return 2;
    return config.columns || 4;
  });

  let widgets = $derived(configManager.getWidgets());

  onMount(async () => {
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

    configManager.onChange((newConfig: any) => {
      config = newConfig;
    });

    const unsubTheme = eventBus.on("theme-changed", () => {
      darkMode = isDarkMode();
    });

    const unsubReorder = eventBus.on("widgets-reordered", (w: any[]) => {
      configManager.reorderWidgets(w);
    });

    return () => {
      unsubTheme();
      unsubReorder();
    };
  });

  $effect(() => {
    document.documentElement.style.setProperty("--hp-columns", String(columns));
    document.documentElement.style.setProperty("--hp-gap", `${config.gap}px`);
    document.documentElement.style.setProperty(
      "--hp-card-radius",
      config.roundedCorners ? "12px" : "0px",
    );
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
    {#if config.showHeader !== false}
      <Header {config} {plugin} />
    {/if}
    <div class="hp-scroll">
      <WidgetGrid {widgets} {columns} {plugin} {config} {isMobile} />
    </div>
  </div>
{/if}
