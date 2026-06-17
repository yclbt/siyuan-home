<script lang="ts">
  /**
   * Header.svelte — 主页头部组件
   * 展示头像、标题、副标题、状态文字、背景横幅
   * Svelte 5 runes 语法
   */
  import { onMount } from "svelte";
  import { getDocStats } from "@/libs/api";

  interface HomepageConfig {
    title: string;
    subtitle: string;
    avatar: string;
    banner: string;
    bannerEnabled: boolean;
    showHeader: boolean;
    statusText: string;
    statusType: "custom" | "ai" | "stats";
    [key: string]: any;
  }

  let {
    config, plugin,
  }: { config: HomepageConfig; plugin?: any } = $props();

  // ---- reactive state ----
  let docCount = $state<number>(0);
  let blockCount = $state<number>(0);
  let loadingStats = $state<boolean>(false);

  // ---- derived ----
  let showHeader = $derived(config?.showHeader !== false);
  let hasBanner = $derived(config?.bannerEnabled && config?.banner);
  let avatarSrc = $derived(config?.avatar?.trim() || "");
  let hasAvatar = $derived(!!avatarSrc);
  let displayTitle = $derived(config?.title || "我的主页");
  let displaySubtitle = $derived(config?.subtitle || "");

  // 状态文本: 自定义 / 自动统计
  let statusText = $derived.by(() => {
    if (!config) return "";
    if (config.statusType === "stats") {
      return loadingStats
        ? "加载中…"
        : `已创建 ${docCount} 篇文档，共 ${blockCount} 个内容块`;
    }
    // "custom" or "ai"
    return config.statusText || "";
  });

  // ---- methods ----
  async function refreshStats() {
    if (config?.statusType !== "stats") return;
    loadingStats = true;
    try {
      const stats = await getDocStats();
      docCount = stats.docs;
      blockCount = stats.blocks;
    } catch (e) {
      console.error("[Homepage Header] Failed to load stats:", e);
    } finally {
      loadingStats = false;
    }
  }

  // ---- lifecycle ----
  onMount(() => {
    if (config?.statusType === "stats") {
      refreshStats();
    }
  });

  // ---- reactivity to config changes ----
  $effect(() => {
    // re-fetch stats when config changes and stats mode is active
    if (config?.statusType === "stats") {
      refreshStats();
    }
  });
</script>

{#if showHeader}
  <header
    class="hp-header"
    class:has-banner={hasBanner}
    role="banner"
  >
    <!-- 背景横幅 -->
    {#if hasBanner}
      <div class="hp-banner">
        <img
          class="hp-banner-img"
          src={config.banner}
          alt="banner"
          loading="lazy"
        />
        <div class="hp-banner-overlay" />
      </div>
    {/if}

    <!-- 头部内容 -->
    <div class="hp-header-content">
      <!-- 头像 -->
      {#if hasAvatar}
        <img
          class="hp-avatar"
          src={avatarSrc}
          alt="avatar"
          loading="lazy"
        />
      {:else}
        <div class="hp-avatar-placeholder" aria-label="avatar placeholder">
          <span class="icon">&#x1F464;</span>
        </div>
      {/if}

      <!-- 标题区域 -->
      <div class="hp-title-area">
        <h1 class="hp-title">{displayTitle}</h1>
        {#if displaySubtitle}
          <p class="hp-subtitle">{displaySubtitle}</p>
        {/if}

        <!-- 状态文字 -->
        {#if statusText}
          <div class="hp-status-text">
            <span>{statusText}</span>
            {#if config?.statusType === "stats"}
              <button
                class="hp-status-refresh"
                onclick={refreshStats}
                title="刷新统计"
                disabled={loadingStats}
              >
                &#x21BB;
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </header>
{/if}

<style>
  /* 所有样式已在 global.css 中统一定义 */
  /* 此处仅保留组件特有的补充样式 */

  .hp-avatar {
    /* 确保图片自适应 */
    object-fit: cover;
  }

  .hp-header.has-banner .hp-header-content {
    /* 有 banner 时文字亮色 */
    color: #fff;
  }

  .hp-banner-overlay {
    background: linear-gradient(
      to bottom,
      transparent 40%,
      rgba(0, 0, 0, 0.5)
    );
  }

  .hp-avatar-placeholder .icon {
    font-size: 24px;
    line-height: 1;
  }

  .hp-status-refresh:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
