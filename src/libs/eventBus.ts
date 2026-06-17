/**
 * 轻量级事件总线
 */

type Listener = (...args: any[]) => void;

class EventBus {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx >= 0) arr.splice(idx, 1);
  }

  emit(event: string, ...args: any[]): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    for (const fn of arr) {
      try {
        fn(...args);
      } catch (e) {
        console.error(`[Homepage] EventBus error: ${event}`, e);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
