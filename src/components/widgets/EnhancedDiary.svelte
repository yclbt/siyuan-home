<script>
  import { getDailyNote, sqlQuery, createDocWithMd, lsNotebooks } from '@/libs/api';
  import { today, truncate, relativeTime } from '@/libs/utils';

  let { config, plugin } = $props();

  const limit = $derived(config?.limit ?? 10);
  let docs = $state([]);
  let loading = $state(true);
  let creating = $state(false);

  $effect(() => {
    loadTodayDocs();
  });

  async function loadTodayDocs() {
    loading = true;
    try {
      const stmt = `
        SELECT id, content, hPath, created, updated
        FROM blocks
        WHERE type = 'd'
          AND strftime('%Y-%m-%d', created/1000, 'unixepoch') = '${today()}'
        ORDER BY created DESC
        LIMIT ${limit}
      `;
      const data = await sqlQuery(stmt);
      docs = data ?? [];
    } catch (e) {
      console.error('Failed to load today\'s diary entries:', e);
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

  async function createDiary() {
    if (creating) return;
    creating = true;
    try {
      // Find the first notebook to create the diary in
      const nbData = await lsNotebooks();
      const notebooks = nbData?.notebooks ?? [];
      if (notebooks.length === 0) {
        console.warn('No notebooks available');
        return;
      }

      const notebookId = notebooks[0].id;
      const dateStr = today();
      // SiYuan daily note path convention: /daily note/YYYY/MM/YYYY-MM-DD
      const parts = dateStr.split('-');
      const path = `/daily note/${parts[0]}/${parts[1]}/${dateStr}`;
      const title = dateStr;
      const content = `# ${title}\n\n`;

      const result = await createDocWithMd(notebookId, path, content);
      if (result?.id) {
        // Add to list and reload
        await loadTodayDocs();
        // Optionally open the new doc
        openDoc(result.id);
      }
    } catch (e) {
      console.error('Failed to create diary entry:', e);
    } finally {
      creating = false;
    }
  }

  function getDocName(doc) {
    // Strip the date prefix from hPath for cleaner display, or use content
    if (doc.hPath) {
      const parts = doc.hPath.split('/');
      return parts[parts.length - 1] || doc.content || 'Untitled';
    }
    return doc.content || 'Untitled';
  }
</script>

<div class="hp-enhanced-diary">
  <div class="hp-diary-header">
    <div class="hp-diary-title">
      <span class="hp-diary-icon">📓</span>
      <span>今日日记</span>
      {#if !loading}
        <span class="hp-diary-count">{docs.length}</span>
      {/if}
    </div>
    <button
      class="hp-diary-create"
      onclick={createDiary}
      disabled={creating}
      title="创建今日日记"
    >
      {creating ? '⏳' : '✏️'} 写日记
    </button>
  </div>

  <div class="hp-diary-body">
    {#if loading}
      <p class="hp-diary-empty">加载中…</p>
    {:else if docs.length === 0}
      <p class="hp-diary-empty">今天还没有日记</p>
    {:else}
      <div class="hp-diary-list">
        {#each docs as doc (doc.id)}
          <button
            class="hp-diary-item"
            onclick={() => openDoc(doc.id)}
            type="button"
            title={doc.hPath || getDocName(doc)}
          >
            <span class="hp-diary-item-icon">📄</span>
            <span class="hp-diary-item-name">{truncate(getDocName(doc), 28)}</span>
            <span class="hp-diary-item-time">{relativeTime(doc.created)}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .hp-enhanced-diary {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 0;
    font-family: inherit;
  }

  .hp-diary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem 0.5rem;
    border-bottom: 1px solid var(--hp-border, #e9ecef);
  }

  .hp-diary-title {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--hp-text-primary, #1a1a2e);
  }

  .hp-diary-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .hp-diary-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.3rem;
    border-radius: 0.625rem;
    background: var(--hp-accent-dim, rgba(79, 70, 229, 0.12));
    color: var(--hp-accent, #4f46e5);
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
  }

  .hp-diary-create {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: inherit;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    background: var(--hp-accent, #4f46e5);
    color: #ffffff;
    transition: opacity 0.2s ease, transform 0.1s ease;
    white-space: nowrap;
  }

  .hp-diary-create:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  .hp-diary-create:active:not(:disabled) {
    transform: translateY(0);
  }

  .hp-diary-create:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .hp-diary-body {
    padding-top: 0.25rem;
  }

  .hp-diary-list {
    display: flex;
    flex-direction: column;
  }

  .hp-diary-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.45rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    font-size: 0.8125rem;
    color: var(--hp-text-primary, #1a1a2e);
    border-radius: 0.25rem;
    transition: background 0.15s ease;
  }

  .hp-diary-item:hover {
    background: var(--hp-bg-secondary, #f8f9fa);
  }

  .hp-diary-item-icon {
    flex-shrink: 0;
    font-size: 0.9rem;
    line-height: 1;
  }

  .hp-diary-item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .hp-diary-item-time {
    flex-shrink: 0;
    font-size: 0.6875rem;
    color: var(--hp-text-muted, #adb5bd);
    white-space: nowrap;
  }

  .hp-diary-empty {
    padding: 1rem;
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    margin: 0;
  }
</style>
