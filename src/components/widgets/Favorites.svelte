<script>
  import { sqlQuery } from '@/libs/api';

  let { config, plugin } = $props();

  let favorites = $state([]);
  let loading = $state(true);
  let error = $state(false);

  $effect(() => {
    let cancelled = false;

    async function fetchFavorites() {
      loading = true;
      error = false;
      try {
        const rows = await sqlQuery(
          `SELECT b.id, b.content, b.hPath, b.updated, b.created
           FROM blocks b
           INNER JOIN attributes a ON a.block_id = b.id
           WHERE a.name = 'custom-favorite' AND a.value = '1' AND b.type = 'd'
           ORDER BY b.updated DESC
           LIMIT 20`
        );
        if (!cancelled) {
          favorites = rows;
        }
      } catch {
        if (!cancelled) {
          favorites = [];
          error = true;
        }
      } finally {
        if (!cancelled) loading = false;
      }
    }

    fetchFavorites();

    return () => {
      cancelled = true;
    };
  });

  function handleOpen(docId) {
    try {
      plugin?.openDoc?.(docId);
    } catch (e) {
      console.error('[Favorites] Failed to open doc:', e);
    }
  }

  function getTitle(item) {
    // Use hPath (hierarchical path) as fallback title, or content snippet
    if (item.hPath) {
      const parts = item.hPath.split('/');
      return parts[parts.length - 1];
    }
    if (item.content) {
      return item.content.replace(/^#+\s*/, '').slice(0, 80);
    }
    return 'Untitled';
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  }
</script>

<div class="hp-favorites">
  {#if loading}
    <div class="hp-favorites-loading">Loading...</div>
  {:else if error}
    <div class="hp-favorites-error">Failed to load favorites</div>
  {:else if favorites.length === 0}
    <p class="hp-favorites-empty">还没有收藏的文档</p>
  {:else}
    <ul class="hp-doc-list">
      {#each favorites as item (item.id)}
        <li class="hp-doc-item" onclick={() => handleOpen(item.id)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleOpen(item.id)}>
          <span class="hp-doc-icon">&#9733;</span>
          <span class="hp-doc-name" title={getTitle(item)}>{getTitle(item)}</span>
          <span class="hp-doc-time">{formatTime(item.updated)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .hp-favorites {
    padding: 0.75rem 1rem;
  }

  .hp-favorites-loading,
  .hp-favorites-error {
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    padding: 1rem 0;
  }

  .hp-favorites-error {
    color: var(--hp-danger, #dc3545);
  }

  .hp-favorites-empty {
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    margin: 0.5rem 0;
  }
</style>
