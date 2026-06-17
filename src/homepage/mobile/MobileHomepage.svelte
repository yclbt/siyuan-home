<script lang="ts">
  /**
   * MobileHomepage.svelte
   * Mobile-optimized version of the homepage.
   * Uses a single-column, touch-friendly layout.
   */
  import { onMount } from "svelte";
  import Header from "../Header.svelte";
  import WidgetGrid from "../WidgetGrid.svelte";
  import { configManager } from "@/libs/config";
  import { isMobile } from "@/libs/utils";
  import type { HomepageConfig } from "@/types";
  import "../style/global.css";

  interface Props {
    plugin: any;
  }

  let { plugin }: Props = $props();
  let config: HomepageConfig = $state(configManager.get());
  let loading = $state(true);

  onMount(async () => {
    try {
      config = await configManager.load();
    } catch {
      config = configManager.get();
    }
    loading = false;

    configManager.onChange((newConfig: HomepageConfig) => {
      config = newConfig;
    });
  });

  // Force single column on mobile
  let columns = $derived(1);

  let enabledWidgets = $derived(
    config.layout.filter((w) => w.enabled)
  );
</script>

<div
  class="homepage-pro-app mobile"
  class:dark={document.documentElement.classList.contains("dark")}
>
  {#if loading}
    <div class="hp-loading">
      <div class="hp-spinner"></div>
    </div>
  {:else}
    {#if config.showHeader}
      <Header {config} {plugin} />
    {/if}

    <div class="hp-scroll">
      <WidgetGrid
        widgets={enabledWidgets}
        {columns}
        {plugin}
        {config}
        isMobile={true}
      />
    </div>
  {/if}
</div>

<style>
  .homepage-pro-app.mobile {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .homepage-pro-app.mobile :global(.hp-header) {
    padding: 10px 12px 8px;
  }

  .homepage-pro-app.mobile :global(.hp-avatar),
  .homepage-pro-app.mobile :global(.hp-avatar-placeholder) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .homepage-pro-app.mobile :global(.hp-title) {
    font-size: 16px;
  }

  .homepage-pro-app.mobile :global(.hp-scroll) {
    padding: 0 10px 16px;
  }

  .homepage-pro-app.mobile :global(.hp-widget-header) {
    padding: 10px 10px 4px;
  }

  .homepage-pro-app.mobile :global(.hp-widget-body) {
    padding: 0 10px 10px;
  }

  .homepage-pro-app.mobile :global(.hp-widget-actions) {
    opacity: 1;
  }

  .homepage-pro-app.mobile :global(.hp-action-btn) {
    min-height: 40px;
    font-size: 16px;
  }
</style>
