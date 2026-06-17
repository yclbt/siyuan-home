/**
 * 通用工具函数
 */

/** 生成唯一 ID */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 获取当前日期 YYYY-MM-DD */
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 获取当前时间 HH:MM */
export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 格式化时间戳 */
export function formatTime(ts: number, fmt = "YYYY-MM-DD HH:mm"): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return fmt
    .replace("YYYY", String(d.getFullYear()))
    .replace("MM", pad(d.getMonth() + 1))
    .replace("DD", pad(d.getDate()))
    .replace("HH", pad(d.getHours()))
    .replace("mm", pad(d.getMinutes()))
    .replace("ss", pad(d.getSeconds()));
}

/** 相对时间 */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return formatTime(ts, "MM-DD");
}

/** 判断是否移动端 */
export function isMobile(): boolean {
  return (
    window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod|webOS|HarmonyOS/i.test(navigator.userAgent)
  );
}

/** 判断是否暗色模式 */
export function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark") ||
    (window.matchMedia?.("(prefers-color-scheme: dark)").matches);
}

/** 防抖 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** 节流 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}

/** 计算文档创建热力图数据（最近365天） */
export async function calcHeatmapData(
  sqlQuery: (stmt: string) => Promise<any[]>
) {
  const yearAgo = Date.now() - 365 * 86400000;
  const stmt = `
    SELECT strftime('%Y-%m-%d', created/1000, 'unixepoch') as day,
           COUNT(*) as count
    FROM blocks
    WHERE type = 'd' AND created > ${yearAgo}
    GROUP BY day
  `;
  const rows = await sqlQuery(stmt);
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.day, r.count);
  }

  const data: { date: string; count: number }[] = [];
  const start = new Date(yearAgo);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    data.push({ date: key, count: map.get(key) || 0 });
  }
  return data;
}

/** 截断文本 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}
