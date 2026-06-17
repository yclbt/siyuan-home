<script lang="ts">
  /**
   * WidgetGrid.svelte
   * Renders enabled widgets in a CSS grid layout.
   * Svelte 5 runes syntax.
   */
  import TimeDate from "@/components/widgets/TimeDate.svelte";
  import Weather from "@/components/widgets/Weather.svelte";
  import StatisticalCard from "@/components/widgets/StatisticalCard.svelte";
  import DailyQuote from "@/components/widgets/DailyQuote.svelte";
  import Countdown from "@/components/widgets/Countdown.svelte";
  import QuickNotes from "@/components/widgets/QuickNotes.svelte";
  import LatestDocs from "@/components/widgets/LatestDocs.svelte";
  import Favorites from "@/components/widgets/Favorites.svelte";
  import Tasks from "@/components/widgets/Tasks.svelte";
  import Heatmap from "@/components/widgets/Heatmap.svelte";
  import HotSearch from "@/components/widgets/HotSearch.svelte";
  import CustomText from "@/components/widgets/CustomText.svelte";
  import EnhancedDiary from "@/components/widgets/EnhancedDiary.svelte";

  import type { WidgetInstance } from "@/types";
  import { eventBus } from "@/libs/eventBus";

  type WidgetComponent = typeof TimeDate;

  interface Props {
    widgets: WidgetInstance[];
    plugin: any;
  }

  let { widgets, plugin }: Props = $props();

  const widgetMap: Record<string, WidgetComponent> = {
    timedate: TimeDate,
    weather: Weather,
    statisticalCard: StatisticalCard,
    dailyQuote: DailyQuote,
    countdown: Countdown,
    quickNotes: QuickNotes,
    latestDocs: LatestDocs,
    favorites: Favorites,
    tasks: Tasks,
    heatmap: Heatmap,
    hotSearch: HotSearch,
    customText: CustomText,
    enhancedDiary: EnhancedDiary,
  };

  function getComponent(type: string): WidgetComponent | undefined {
    return widgetMap[type];
  }

  function handleRemove(widget: WidgetInstance, e: MouseEvent) {
    e.stopPropagation();
    eventBus.emit("homepage:widget-removed", { widgetId: widget.id });
  }
</script>

{#if widgets.length === 0}
  <div class="widget-grid-empty">
    <div class="widget-grid-empty-icon">📦</div>
    <p class="widget-grid-empty-text">暂无启用的组件</p>
    <p class="widget-grid-empty-hint">前往设置页面添加组件以开始使用</p>
  </div>
{:else}
  <div class="widget-grid">
    {#each widgets as widget (widget.id)}
      {@const Widget = getComponent(widget.type)}
      {#if Widget}
        <div
          class="widget-cell grid-w-{widget.gridW} grid-h-{widget.gridH}"
          data-widget-id={widget.id}
        >
          <button
            class="widget-remove-btn"
            onclick={(e) => handleRemove(widget, e)}
            aria-label="移除组件"
            title="移除组件"
          >
            &times;
          </button>
          <Widget config={widget.config} {plugin} />
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .widget-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    width: 100%;
  }

  .widget-cell {
    position: relative;
    min-height: 80px;
  }

  /* Grid width classes — span N columns */
  .grid-w-1 { grid-column: span 1; }
  .grid-w-2 { grid-column: span 2; }
  .grid-w-3 { grid-column: span 3; }
  .grid-w-4 { grid-column: span 4; }

  /* Grid height classes — span N rows */
  .grid-h-1 { grid-row: span 1; }
  .grid-h-2 { grid-row: span 2; }
  .grid-h-3 { grid-row: span 3; }
  .grid-h-4 { grid-row: span 4; }

  .widget-remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 10;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .widget-cell:hover .widget-remove-btn {
    opacity: 1;
  }

  .widget-remove-btn:hover {
    background: rgba(224, 49, 49, 0.8);
  }

  /* ---- Empty state ---- */
  .widget-grid-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    color: var(--b3-theme-on-surface, #666);
  }

  .widget-grid-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .widget-grid-empty-text {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 8px 0;
  }

  .widget-grid-empty-hint {
    font-size: 14px;
    margin: 0;
    opacity: 0.7;
  }
</style>
