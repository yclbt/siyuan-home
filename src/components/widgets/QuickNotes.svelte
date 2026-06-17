<script>
  let { config, plugin } = $props();

  const STORAGE_KEY = 'hp-quick-notes';

  let notes = $state(loadNotes());
  let content = $state('');

  let savedMessage = $state('');

  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function handleSubmit() {
    const text = content.trim();
    if (!text) return;

    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      createdAt: new Date().toISOString(),
    };

    notes = [note, ...notes].slice(0, 5);
    saveNotes();
    content = '';
    savedMessage = 'Saved!';
    setTimeout(() => {
      savedMessage = '';
    }, 2000);
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  }
</script>

<div class="hp-quick-note">
  <div class="hp-quick-note-form">
    <textarea
      class="hp-quick-note-input"
      bind:value={content}
      onkeydown={handleKeydown}
      placeholder="Type a quick note…"
      rows="2"
    ></textarea>
    <div class="hp-quick-note-actions">
      <button class="hp-quick-note-save" onclick={handleSubmit} disabled={!content.trim()}>
        Save
      </button>
      {#if savedMessage}
        <span class="hp-quick-note-saved">{savedMessage}</span>
      {/if}
    </div>
  </div>

  {#if notes.length > 0}
    <ul class="hp-quick-note-list">
      {#each notes as note (note.id)}
        <li class="hp-quick-note-item">
          <span class="hp-quick-note-text">{note.text}</span>
          <span class="hp-quick-note-time">{formatTime(note.createdAt)}</span>
          <button class="hp-quick-note-delete" onclick={() => deleteNote(note.id)} title="Delete note">
            &times;
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="hp-quick-note-empty">No notes yet</p>
  {/if}
</div>

<style>
  .hp-quick-note {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.75rem;
  }

  .hp-quick-note-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hp-quick-note-input {
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    min-height: 3rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-family: inherit;
    border: 1px solid var(--hp-border, #dee2e6);
    border-radius: 0.375rem;
    background: var(--hp-bg-input, #ffffff);
    color: var(--hp-text-primary, #1a1a2e);
    outline: none;
    transition: border-color 0.2s ease;
  }

  .hp-quick-note-input:focus {
    border-color: var(--hp-accent, #4f46e5);
    box-shadow: 0 0 0 2px var(--hp-accent-dim, rgba(79, 70, 229, 0.15));
  }

  .hp-quick-note-input::placeholder {
    color: var(--hp-text-muted, #adb5bd);
  }

  .hp-quick-note-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hp-quick-note-save {
    padding: 0.35rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    background: var(--hp-accent, #4f46e5);
    color: #ffffff;
    transition: opacity 0.2s ease;
  }

  .hp-quick-note-save:hover:not(:disabled) {
    opacity: 0.85;
  }

  .hp-quick-note-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hp-quick-note-saved {
    font-size: 0.75rem;
    color: var(--hp-success, #10b981);
    font-weight: 500;
  }

  .hp-quick-note-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .hp-quick-note-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem 0.65rem;
    background: var(--hp-bg-secondary, #f8f9fa);
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .hp-quick-note-text {
    flex: 1;
    color: var(--hp-text-primary, #1a1a2e);
    word-break: break-word;
  }

  .hp-quick-note-time {
    flex-shrink: 0;
    font-size: 0.6875rem;
    color: var(--hp-text-muted, #adb5bd);
    margin-top: 0.1rem;
  }

  .hp-quick-note-delete {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: var(--hp-text-muted, #adb5bd);
    padding: 0 0.15rem;
    transition: color 0.15s ease;
  }

  .hp-quick-note-delete:hover {
    color: var(--hp-danger, #dc3545);
  }

  .hp-quick-note-empty {
    text-align: center;
    font-size: 0.8rem;
    color: var(--hp-text-muted, #adb5bd);
    margin: 0.5rem 0;
  }
</style>
