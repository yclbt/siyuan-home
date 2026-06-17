<script>
  /**
   * Tasks.svelte — Svelte 5 widget
   * Shows outstanding (unchecked) TODO items from SiYuan.
   *
   * Props:
   *   config.tasksMax     — max tasks to show (default: 20)
   *   config.widgetTitle  — widget heading (default: "Tasks")
   *   plugin              — SiYuan plugin instance
   */

  import { sqlQuery } from '../../libs/api';

  let { config = {}, plugin } = $props();

  let tasksMax     = $derived(config.tasksMax ?? 20);
  let widgetTitle  = $derived(config.widgetTitle ?? 'Tasks');

  let tasks       = $state([]);
  let loading     = $state(true);
  let error       = $state('');

  async function loadTasks() {
    loading = true;
    error   = '';
    try {
      const stmt = `
        SELECT b.id, b.content, b.markdown, b.updated, b.root_id
        FROM blocks b
        WHERE b.type = 'i' AND b.content LIKE '%[ ]%'
        ORDER BY b.updated DESC
        LIMIT ${tasksMax}
      `;
      const rows = await sqlQuery(stmt);
      tasks = rows.map((row) => ({
        id:      row.id,
        content: cleanContent(row.content),
        markdown: row.markdown || '',
        updated: row.updated,
        root_id: row.root_id,
      }));
    } catch (e) {
      console.error('[Tasks Widget] Query failed:', e);
      error = 'Failed to load tasks';
      tasks = [];
    } finally {
      loading = false;
    }
  }

  /**
   * Remove the leading checkbox marker and trim excess whitespace.
   * Handles both '- [ ] ' and '* [ ] ' patterns.
   */
  function cleanContent(raw) {
    if (!raw) return '';
    return raw
      .replace(/^[-*]\s*\[\s*\]\s*/, '')     // strip leading "- [ ] " or "* [ ] "
      .replace(/^\[.*?\]\s*/, '')              // fallback: anything in brackets
      .trim();
  }

  function formatTime(ts) {
    try {
      const d = new Date(ts);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  }

  function openDoc(rootId) {
    if (plugin?.openDoc) {
      plugin.openDoc(rootId);
    } else {
      // fallback via siyuan global
      try {
        const siyuan = window.siyuan;
        if (siyuan?.openTab) {
          siyuan.openTab({ id: rootId, app: plugin?.app });
        }
      } catch (e) {
        console.error('[Tasks Widget] openDoc failed:', e);
      }
    }
  }

  // load on mount
  $effect(() => {
    loadTasks();
  });

  // refresh every 60s
  $effect(() => {
    const timer = setInterval(loadTasks, 60_000);
    return () => clearInterval(timer);
  });
</script>

<div class="hp-tasks">
  <h3 class="hp-tasks-title">{widgetTitle}</h3>

  {#if loading}
    <p class="hp-tasks-status">Loading tasks…</p>
  {:else if error}
    <p class="hp-tasks-status hp-tasks-error">{error}</p>
  {:else if tasks.length === 0}
    <p class="hp-tasks-status hp-tasks-empty">No outstanding tasks</p>
  {:else}
    <ul class="hp-tasks-list">
      {#each tasks as task (task.id)}
        <li
          class="hp-tasks-item"
          role="button"
          tabindex="0"
          onclick={() => openDoc(task.root_id)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDoc(task.root_id); } }}
          title="Open containing document"
        >
          <span class="hp-tasks-checkbox">□</span>
          <span class="hp-tasks-text">{task.content}</span>
          <span class="hp-tasks-time">{formatTime(task.updated)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .hp-tasks {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.75rem;
  }

  .hp-tasks-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--hp-text-primary, #1a1a2e);
    letter-spacing: 0.02em;
  }

  .hp-tasks-status {
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    margin: 0.5rem 0;
  }

  .hp-tasks-error {
    color: var(--hp-danger, #dc3545);
  }

  .hp-tasks-empty {
    font-style: italic;
  }

  .hp-tasks-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .hp-tasks-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.45rem 0.6rem;
    background: var(--hp-bg-secondary, #f8f9fa);
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    line-height: 1.45;
    cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease;
    outline: none;
    border: 1px solid transparent;
  }

  .hp-tasks-item:hover {
    background: var(--hp-bg-hover, #e9ecef);
  }

  .hp-tasks-item:focus-visible {
    border-color: var(--hp-accent, #4f46e5);
    box-shadow: 0 0 0 2px var(--hp-accent-dim, rgba(79, 70, 229, 0.15));
  }

  .hp-tasks-checkbox {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1.3;
    color: var(--hp-text-muted, #adb5bd);
    user-select: none;
  }

  .hp-tasks-text {
    flex: 1;
    color: var(--hp-text-primary, #1a1a2e);
    word-break: break-word;
    min-width: 0;
  }

  .hp-tasks-time {
    flex-shrink: 0;
    font-size: 0.6875rem;
    color: var(--hp-text-muted, #adb5bd);
    margin-top: 0.15rem;
    white-space: nowrap;
  }
</style>
