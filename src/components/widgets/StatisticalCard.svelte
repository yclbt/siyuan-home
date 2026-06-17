<script>
  import { getDocStats } from '@/libs/api';

  let { config, plugin } = $props();

  let stats = $state({ docs: 0, blocks: 0, tags: 0 });
  let error = $state(false);
  let loading = $state(true);

  $effect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await getDocStats();
        if (!cancelled) {
          stats = data;
          error = false;
        }
      } catch {
        if (!cancelled) {
          stats = { docs: 0, blocks: 0, tags: 0 };
          error = true;
        }
      } finally {
        if (!cancelled) loading = false;
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  });
</script>

<div class="hp-stat-grid">
  <div class="hp-stat-item">
    <span class="hp-stat-value">{stats.docs}</span>
    <span class="hp-stat-label">Documents</span>
  </div>
  <div class="hp-stat-item">
    <span class="hp-stat-value">{stats.blocks}</span>
    <span class="hp-stat-label">Blocks</span>
  </div>
  <div class="hp-stat-item">
    <span class="hp-stat-value">{stats.tags}</span>
    <span class="hp-stat-label">Tags</span>
  </div>
</div>

{#if error}
  <div class="hp-stat-error">Could not load stats from SiYuan</div>
{/if}

<style>
  .hp-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }

  .hp-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .hp-stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--hp-text-primary, #1a1a2e);
  }

  .hp-stat-label {
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--hp-text-secondary, #6c757d);
    margin-top: 0.15rem;
  }

  .hp-stat-error {
    text-align: center;
    font-size: 0.75rem;
    color: var(--hp-danger, #dc3545);
    padding: 0 1rem 0.75rem;
  }
</style>
