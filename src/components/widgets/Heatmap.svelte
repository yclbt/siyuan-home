<script>
  import { sqlQuery } from '@/libs/api';
  import { calcHeatmapData } from '@/libs/utils';

  let { config, plugin } = $props();

  let heatmapData = $state([]);
  let loading = $state(true);
  let error = $state('');
  let grid = $state([]);
  let monthLabels = $state([]);

  $effect(() => {
    loadHeatmap();
  });

  async function loadHeatmap() {
    loading = true;
    error = '';
    try {
      const data = await calcHeatmapData(sqlQuery);
      heatmapData = data ?? [];
    } catch (e) {
      error = 'Failed to load heatmap data';
      heatmapData = [];
    } finally {
      loading = false;
    }
  }

  // Recompute grid whenever heatmapData changes
  $effect(() => {
    if (heatmapData.length === 0) {
      grid = [];
      monthLabels = [];
      return;
    }
    computeGrid();
  });

  function colorClass(count) {
    if (count === 0) return 'level-0';
    if (count <= 1) return 'level-1';
    if (count <= 3) return 'level-2';
    if (count <= 6) return 'level-3';
    if (count <= 10) return 'level-4';
    return 'level-5';
  }

  function computeGrid() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    startDate.setHours(0, 0, 0, 0);

    // Row 0 = Monday. Compute offset so first real day lands on correct row.
    const startDay = startDate.getDay(); // 0=Sun
    // Map day-of-week to row index (Mon=0, Tue=1, ..., Sun=6)
    const dayToRow = [6, 0, 1, 2, 3, 4, 5]; // Sun->6, Mon->0, ..., Sat->5
    const rowOffset = dayToRow[startDay];

    const totalSlots = 52 * 7; // 364

    // Pre-fill all slots as empty
    const cells = [];
    for (let i = 0; i < totalSlots; i++) {
      cells.push({ date: '', count: 0, level: 'level-0' });
    }

    // Build lookup from date string to count
    const dataLookup = {};
    for (const item of heatmapData) {
      dataLookup[item.date] = item.count;
    }

    // Place each of the 365 days into the appropriate slot
    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = dataLookup[key] || 0;
      const slot = rowOffset + i;
      if (slot < totalSlots) {
        cells[slot] = { date: key, count, level: colorClass(count) };
      }
    }

    // Build month labels: find which column (week) each month first appears in
    const mlabels = [];
    let lastMonth = -1;
    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const month = d.getMonth();
      if (month !== lastMonth) {
        const col = Math.floor((i + rowOffset) / 7);
        if (col < 52) {
          mlabels.push({
            label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month],
            col
          });
        }
        lastMonth = month;
      }
    }
    monthLabels = mlabels;

    // Reshape linear cells into 7 rows × 52 cols (column-major layout)
    const rows = [];
    for (let r = 0; r < 7; r++) {
      const row = [];
      for (let c = 0; c < 52; c++) {
        row.push(cells[c * 7 + r] || { date: '', count: 0, level: 'level-0' });
      }
      rows.push(row);
    }
    grid = rows;
  }
</script>

<div class="hp-heatmap">
  {#if loading}
    <p class="hp-heatmap-empty">Loading heatmap…</p>
  {:else if error}
    <p class="hp-heatmap-empty">{error}</p>
  {:else}
    <div class="hp-heatmap-wrapper">
      <!-- Month labels row (aligns with grid columns) -->
      <div class="hp-heatmap-months">
        <span class="hp-heatmap-day-spacer"></span>
        {#each monthLabels as ml}
          <span
            class="hp-heatmap-month"
            style="margin-left: {ml.col * 12}px;"
          >{ml.label}</span>
        {/each}
      </div>

      <div class="hp-heatmap-body">
        <!-- Day-of-week labels column -->
        <div class="hp-heatmap-days">
          <span class="hp-heatmap-day-label">Mon</span>
          <span class="hp-heatmap-day-label"></span>
          <span class="hp-heatmap-day-label">Wed</span>
          <span class="hp-heatmap-day-label"></span>
          <span class="hp-heatmap-day-label">Fri</span>
          <span class="hp-heatmap-day-label"></span>
          <span class="hp-heatmap-day-label"></span>
        </div>

        <!-- 52×7 grid -->
        <div class="hp-heatmap-grid">
          {#each grid as row, ri}
            {#each row as cell, ci}
              <div
                class="hp-heatmap-cell {cell.level}"
                title={cell.date ? `${cell.date}: ${cell.count} document${cell.count === 1 ? '' : 's'}` : ''}
              ></div>
            {/each}
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .hp-heatmap {
    padding: 0.75rem;
    font-family: inherit;
  }

  .hp-heatmap-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hp-heatmap-months {
    display: flex;
    align-items: flex-end;
    font-size: 0.6rem;
    color: var(--hp-text-muted, #adb5bd);
    margin-bottom: 2px;
    height: 12px;
  }

  .hp-heatmap-day-spacer {
    width: 28px;
    flex-shrink: 0;
  }

  .hp-heatmap-month {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .hp-heatmap-body {
    display: flex;
    gap: 4px;
  }

  .hp-heatmap-days {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
    width: 28px;
  }

  .hp-heatmap-day-label {
    height: 10px;
    line-height: 10px;
    font-size: 0.55rem;
    color: var(--hp-text-muted, #adb5bd);
    white-space: nowrap;
  }

  .hp-heatmap-grid {
    display: grid;
    grid-template-columns: repeat(52, 10px);
    grid-template-rows: repeat(7, 10px);
    gap: 2px;
  }

  .hp-heatmap-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background-color: var(--hp-heatmap-0, #ebedf0);
  }

  .hp-heatmap-cell.level-1 {
    background-color: var(--hp-heatmap-1, #9be9a8);
  }

  .hp-heatmap-cell.level-2 {
    background-color: var(--hp-heatmap-2, #40c463);
  }

  .hp-heatmap-cell.level-3 {
    background-color: var(--hp-heatmap-3, #30a14e);
  }

  .hp-heatmap-cell.level-4 {
    background-color: var(--hp-heatmap-4, #216e39);
  }

  .hp-heatmap-cell.level-5 {
    background-color: var(--hp-heatmap-5, #0d421f);
  }

  .hp-heatmap-empty {
    padding: 1rem;
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    margin: 0;
  }
</style>
