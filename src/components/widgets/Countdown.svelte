<script>
  /**
   * Countdown.svelte — Svelte 5 widget
   * Shows days/hours/minutes remaining to a configurable target date.
   *
   * Props:
   *   config.targetDate   — YYYY-MM-DD string (default: next Jan 1)
   *   config.targetLabel  — label shown under the countdown (default: "新年")
   *   plugin              — plugin instance (unused, but passed for compatibility)
   */

  let { config = {}, plugin } = $props();

  // ── defaults ───────────────────────────────────────────────────
  const now = new Date();
  const defaultYear = now.getFullYear() + 1;
  let targetDate   = $derived(config.targetDate ?? `${defaultYear}-01-01`);
  let targetLabel  = $derived(config.targetLabel ?? '新年');

  // ── reactive countdown state ───────────────────────────────────
  let days    = $state(0);
  let hours   = $state(0);
  let minutes = $state(0);

  function calc() {
    const end   = new Date(targetDate + 'T00:00:00');
    const diff  = end.getTime() - Date.now();

    if (diff <= 0) {
      days = hours = minutes = 0;
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    days    = Math.floor(totalSeconds / 86400);
    hours   = Math.floor((totalSeconds % 86400) / 3600);
    minutes = Math.floor((totalSeconds % 3600) / 60);
  }

  // initial calculation
  $effect(() => { calc(); });

  // update every 60 seconds
  $effect(() => {
    const timer = setInterval(calc, 60_000);
    return () => clearInterval(timer);
  });
</script>

<div class="countdown-widget">
  <div class="countdown-display">
    <span class="countdown-days">{days}</span>
    <span class="countdown-unit">天</span>
    <span class="countdown-sep">&nbsp;</span>
    <span class="countdown-hours">{String(hours).padStart(2, '0')}</span>
    <span class="countdown-unit">:</span>
    <span class="countdown-minutes">{String(minutes).padStart(2, '0')}</span>
  </div>
  <div class="countdown-label">{targetLabel}</div>
</div>

<style>
  .countdown-widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    padding: 1rem;
    text-align: center;
  }

  .countdown-display {
    display: flex;
    align-items: baseline;
    gap: 0.15em;
  }

  .countdown-days {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
  }

  .countdown-unit {
    font-size: 1.25rem;
    font-weight: 400;
    opacity: 0.7;
  }

  .countdown-sep {
    width: 0.5em;
  }

  .countdown-hours,
  .countdown-minutes {
    font-size: 1.5rem;
    font-weight: 500;
  }

  .countdown-label {
    margin-top: 0.5rem;
    font-size: 1rem;
    opacity: 0.6;
  }
</style>
