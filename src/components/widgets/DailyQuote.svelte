<script>
  let { config, plugin } = $props();

  const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
    { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
    { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
    { text: '知人者智，自知者明。', author: '老子' },
    { text: '千里之行，始于足下。', author: '老子' },
    { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
    { text: '天行健，君子以自强不息。', author: '《周易》' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
    { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
    { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  ];

  let currentIndex = $state(Math.floor(Math.random() * quotes.length));

  let quote = $derived(quotes[currentIndex]);

  function getRandomQuote() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (quotes.length > 1 && newIndex === currentIndex);
    currentIndex = newIndex;
  }
</script>

<div class="hp-quote">
  <p class="hp-quote-text">“{quote.text}”</p>
  <p class="hp-quote-author">— {quote.author}</p>
  <button class="hp-quote-refresh" onclick={getRandomQuote} title="换一条">
    ↻
  </button>
</div>

<style>
  .hp-quote {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 1rem;
    gap: 0.5rem;
    text-align: center;
  }

  .hp-quote-text {
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.6;
    color: var(--hp-text-primary, #1a1a2e);
    margin: 0;
    max-width: 100%;
  }

  .hp-quote-author {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--hp-text-secondary, #6c757d);
    margin: 0;
    font-style: italic;
  }

  .hp-quote-refresh {
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
    margin-top: 0.25rem;
  }

  .hp-quote-refresh:hover {
    transform: rotate(180deg);
    background-color: var(--hp-bg-hover, #f0f0f5);
  }
</style>
