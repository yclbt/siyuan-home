<script>
  let { config, plugin } = $props();

  let now = $state(new Date());
  let intervalId = $state(null);

  $effect(() => {
    intervalId = setInterval(() => {
      now = new Date();
    }, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  let timeStr = $derived(`${pad(now.getHours())}:${pad(now.getMinutes())}`);

  let dateStr = $derived(
    now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
</script>

<div class="hp-timedate">
  <div class="hp-time">{timeStr}</div>
  <div class="hp-date">{dateStr}</div>
</div>

<style>
  .hp-timedate {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .hp-time {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.05em;
    color: var(--hp-text-primary, #1a1a2e);
  }

  .hp-date {
    font-size: 1rem;
    font-weight: 400;
    color: var(--hp-text-secondary, #6c757d);
    margin-top: 0.25rem;
  }
</style>
