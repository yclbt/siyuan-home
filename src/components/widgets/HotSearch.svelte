<script>
  /**
   * HotSearch.svelte
   * Mock/static hot search trends widget for Svelte 5.
   * Shows rank number, title, and heat level for 15 trending topics.
   */
  let { config, plugin } = $props();

  const hotSearches = [
    { rank: 1, title: "DeepSeek发布新一代AI模型", heat: 9850000 },
    { rank: 2, title: "神舟二十号成功发射", heat: 9720000 },
    { rank: 3, title: "2026世界杯预选赛战报", heat: 9580000 },
    { rank: 4, title: "华为鸿蒙生态用户突破8亿", heat: 9340000 },
    { rank: 5, title: "全国多地迎来高温天气", heat: 9120000 },
    { rank: 6, title: "苹果Vision Pro 2正式发布", heat: 8870000 },
    { rank: 7, title: "国产大模型全面超越GPT", heat: 8650000 },
    { rank: 8, title: "新能源汽车渗透率超60%", heat: 8410000 },
    { rank: 9, title: "量子计算重大突破", heat: 8230000 },
    { rank: 10, title: "2026电商618大促数据出炉", heat: 7980000 },
    { rank: 11, title: "国际AI安全峰会召开", heat: 7750000 },
    { rank: 12, title: "城市极端降雨防汛响应升级", heat: 7520000 },
    { rank: 13, title: "国产科幻电影票房破50亿", heat: 7280000 },
    { rank: 14, title: "数字人民币跨境支付试点扩大", heat: 7050000 },
    { rank: 15, title: "全国高考分数线陆续公布", heat: 6810000 },
  ];

  function heatLevel(heat) {
    if (heat >= 9000000) return 'fire';
    if (heat >= 8000000) return 'hot';
    if (heat >= 7500000) return 'warm';
    return 'normal';
  }

  function formatHeat(heat) {
    if (heat >= 10000000) return (heat / 10000000).toFixed(1) + '亿';
    if (heat >= 10000) return (heat / 10000).toFixed(0) + '万';
    return heat.toString();
  }
</script>

<div class="hot-search-widget">
  <div class="widget-header">
    <span class="widget-icon">🔥</span>
    <h3 class="widget-title">热搜榜单</h3>
  </div>
  <div class="hot-search-list">
    {#each hotSearches as item, i}
      <div class="hot-search-item level-{heatLevel(item.heat)}">
        <span class="rank-badge {i < 3 ? 'top-three' : ''}">{item.rank}</span>
        <span class="search-title">{item.title}</span>
        <span class="heat-tag">{formatHeat(item.heat)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .hot-search-widget {
    background: var(--widget-bg, #ffffff);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    max-width: 400px;
  }

  .widget-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color, #eaeaea);
  }

  .widget-icon {
    font-size: 20px;
  }

  .widget-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary, #1a1a1a);
  }

  .hot-search-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hot-search-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 6px;
    border-radius: 6px;
    transition: background 0.2s ease;
    cursor: default;
  }

  .hot-search-item:hover {
    background: var(--hover-bg, #f5f5f5);
  }

  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary, #666);
    background: var(--badge-bg, #f0f0f0);
    border-radius: 4px;
    padding: 0 4px;
    flex-shrink: 0;
  }

  .rank-badge.top-three {
    color: #fff;
    background: #ff6b35;
  }

  .hot-search-item:nth-child(1) .rank-badge.top-three {
    background: #e84118;
  }

  .hot-search-item:nth-child(2) .rank-badge.top-three {
    background: #ff6b35;
  }

  .hot-search-item:nth-child(3) .rank-badge.top-three {
    background: #f39c12;
  }

  .search-title {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary, #1a1a1a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .heat-tag {
    font-size: 11px;
    color: var(--text-muted, #999);
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--tag-bg, #f5f5f5);
  }

  /* Heat level indicators */
  .hot-search-item.level-fire .heat-tag {
    color: #e84118;
    background: #fce4e0;
  }

  .hot-search-item.level-hot .heat-tag {
    color: #d68910;
    background: #fef5e7;
  }

  .hot-search-item.level-warm .heat-tag {
    color: #b7950b;
    background: #fef9e7;
  }

  .hot-search-item.level-normal .heat-tag {
    color: #7f8c8d;
    background: #f2f3f4;
  }
</style>
