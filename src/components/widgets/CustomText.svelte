<script>
  /**
   * CustomText.svelte — Svelte 5 widget
   * Displays user-defined HTML/text content.
   *
   * Props:
   *   config.content  — HTML string to render (optional; shows placeholder if empty)
   *   plugin          — plugin instance (passed for compatibility)
   */
  let { config = {}, plugin } = $props();

  let content = $derived(config.content ?? '');
</script>

<div class="hp-widget-body custom-text-body">
  {#if content}
    {@html content}
  {:else}
    <p class="custom-text-placeholder">在此处添加自定义内容</p>
  {/if}
</div>

<style>
  .custom-text-body {
    line-height: 1.7;
    font-size: 0.95rem;
    color: var(--hp-text-primary, #1a1a2e);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .custom-text-body :global(p) {
    margin: 0 0 0.5rem 0;
  }

  .custom-text-body :global(p:last-child) {
    margin-bottom: 0;
  }

  .custom-text-body :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  .custom-text-body :global(a) {
    color: var(--hp-accent, #4a6cf7);
    text-decoration: none;
  }

  .custom-text-body :global(a:hover) {
    text-decoration: underline;
  }

  .custom-text-placeholder {
    color: var(--hp-text-secondary, #999);
    font-style: italic;
    margin: 0;
  }
</style>
