<script>
  let { config, plugin } = $props();

  let city = $state(localStorage.getItem('hp-weather-city') || '北京');
  let temperature = $state(23);
  let description = $state('晴');

  let tempStr = $derived(`${temperature}°`);
  let weatherIcon = $derived.by(() => {
    if (description === '晴') return '☀️';
    if (description === '多云') return '⛅';
    if (description === '阴') return '☁️';
    if (description === '雨') return '🌧️';
    if (description === '雪') return '❄️';
    return '🌤️';
  });

  function refreshTemp() {
    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    temperature = Math.max(-20, Math.min(50, temperature + delta));
  }

  function setCity(e) {
    const newCity = e.target.value.trim() || city;
    city = newCity;
    localStorage.setItem('hp-weather-city', newCity);
  }
</script>

<div class="hp-weather">
  <div class="hp-weather-temp">
    <span class="hp-weather-icon">{weatherIcon}</span>
    <span class="hp-weather-value">{tempStr}</span>
  </div>

  <div class="hp-weather-info">
    <span class="hp-weather-desc">{description}</span>
    <button class="hp-weather-refresh" onclick={refreshTemp} title="刷新天气">
      ↻
    </button>
  </div>

  <div class="hp-weather-detail">
    <span class="hp-weather-city">{city}</span>
  </div>
</div>

<style>
  .hp-weather {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    gap: 0.25rem;
  }

  .hp-weather-temp {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--hp-text-primary, #1a1a2e);
  }

  .hp-weather-icon {
    font-size: 2.5rem;
  }

  .hp-weather-value {
    letter-spacing: 0.02em;
  }

  .hp-weather-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    color: var(--hp-text-secondary, #6c757d);
  }

  .hp-weather-desc {
    /* inherits parent styling */
  }

  .hp-weather-refresh {
    background: none;
    border: 1px solid var(--hp-border, #dee2e6);
    border-radius: 50%;
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: var(--hp-text-secondary, #6c757d);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .hp-weather-refresh:hover {
    transform: rotate(180deg);
    background-color: var(--hp-bg-hover, #f0f0f5);
  }

  .hp-weather-detail {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--hp-text-secondary, #6c757d);
    margin-top: 0.15rem;
  }

  .hp-weather-city {
    /* inherits parent styling */
  }
</style>
