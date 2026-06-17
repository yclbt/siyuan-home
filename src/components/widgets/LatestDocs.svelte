<script>
  import { getRecentDocs } from '@/libs/api';
  import { relativeTime, truncate } from '@/libs/utils';

  let { config, plugin } = $props();

  const limit = $derived(config.limit ?? 10);
  let docs = $state([]);
  let loading = $state(true);

  $effect(() => {
    loadDocs();
  });

  async function loadDocs() {
    loading = true;
    try {
      const data = await getRecentDocs(7, 20);
      docs = (data ?? []).slice(0, limit);
    } catch {
      docs = [];
    } finally {
      loading = false;
    }
  }

  function openDoc(id) {
    if (plugin?.openDoc) {
      plugin.openDoc(id);
    }
  }

  function getDocName(doc) {
    return doc.content || doc.hPath || 'Untitled';
  }
</script>

<div class="hp-doc-list">
  {#if loading}
    <p class="hp-doc-empty">Loading…</p>
  {:else if docs.length === 0}
    <p class="hp-doc-empty">No recent documents</p>
  {:else}
    {#each docs as doc (doc.id)}
      <button class="hp-doc-item" onclick={() => openDoc(doc.id)} type="button">
        <span class="hp-doc-icon">📄</span>
        <span class="hp-doc-name" title={getDocName(doc)}>{truncate(getDocName(doc), 30)}</span>
        <span class="hp-doc-time">{relativeTime(doc.updated)}</span>
      </button>
    {/each}
  {/if}
</div>

<style>
  .hp-doc-list {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
  }

  .hp-doc-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--hp-text-primary, #1a1a2e);
    border-radius: 0.25rem;
    transition: background 0.15s ease;
  }

  .hp-doc-item:hover {
    background: var(--hp-bg-secondary, #f8f9fa);
  }

  .hp-doc-icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1;
  }

  .hp-doc-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .hp-doc-time {
    flex-shrink: 0;
    font-size: 0.75rem;
    color: var(--hp-text-muted, #adb5bd);
    white-space: nowrap;
  }

  .hp-doc-empty {
    padding: 1rem;
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    margin: 0;
  }
</style>
