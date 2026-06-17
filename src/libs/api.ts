/**
 * 思源内核 API 封装
 * 通过 HTTP POST 调用思源后端接口
 */

const API_BASE = "http://127.0.0.1:6806";

function getToken(): string {
  try {
    const siyuan = (window as any).siyuan;
    return siyuan?.token || "";
  } catch {
    return "";
  }
}

async function request<T = any>(
  path: string,
  data: Record<string, any> = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || "API error");
  return json.data as T;
}

// ============ 笔记本 ============

export async function lsNotebooks() {
  return request<{ notebooks: any[] }>("/api/notebook/lsNotebooks");
}

export async function openNotebook(notebookId: string) {
  return request("/api/notebook/openNotebook", { notebook: notebookId });
}

// ============ 文档 ============

export async function createDocWithMd(
  notebookId: string,
  path: string,
  markdown: string
) {
  return request<{ id: string }>("/api/filetree/createDocWithMd", {
    notebook: notebookId,
    path,
    markdown,
  });
}

export async function renameDoc(id: string, name: string) {
  return request("/api/filetree/renameDoc", { id, name });
}

export async function removeDoc(id: string) {
  return request("/api/filetree/removeDocument", { id });
}

export async function moveDoc(fromPath: string, toPath: string) {
  return request("/api/filetree/moveDocs", { fromPaths: [fromPath], toPath });
}

export async function getDocInfo(id: string) {
  return request<any>("/api/filetree/getDoc", { id });
}

export async function getHPathByID(id: string) {
  return request<string>("/api/filetree/getHPathByID", { id });
}

export async function getIDsByHPath(hPath: string) {
  return request<string[]>("/api/filetree/getIDsByHPath", { hPath });
}

// ============ 块操作 ============

export async function insertBlock(
  data: {
    dataType: "markdown" | "dom";
    data: string;
    nextID?: string;
    parentID?: string;
    previousID?: string;
  }
) {
  return request("/api/block/insertBlock", data);
}

export async function updateBlock(data: {
  id: string;
  data: string;
  dataType: "markdown" | "dom";
  path?: string;
}) {
  return request("/api/block/updateBlock", data);
}

export async function deleteBlock(id: string) {
  return request("/api/block/deleteBlock", { id });
}

export async function getBlockKramdown(id: string) {
  return request<{ id: string; kramdown: string }>(
    "/api/block/getBlockKramdown",
    { id }
  );
}

export async function getChildBlocks(
  id: string,
  options?: { excludeTypes?: string[] }
) {
  return request<any[]>("/api/block/getChildBlocks", {
    id,
    ...(options || {}),
  });
}

// ============ 属性 ============

export async function setBlockAttrs(
  id: string,
  attrs: Record<string, string>
) {
  return request("/api/attr/setBlockAttrs", { id, attrs });
}

export async function getBlockAttrs(id: string) {
  return request<Record<string, string>>("/api/attr/getBlockAttrs", { id });
}

// ============ SQL ============

export async function sqlQuery(stmt: string) {
  return request<any[]>("/api/query/sql", { stmt });
}

// ============ 资源文件 ============

export async function uploadAsset(
  assetDir: string,
  file: File | Blob,
  fileName: string
) {
  const formData = new FormData();
  formData.append("assetsDirPath", assetDir);
  formData.append("file[]", file, fileName);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${API_BASE}/api/asset/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  return res.json();
}

// ============ 文件读写 ============

export async function getFile(path: string) {
  return request<string>("/api/file/getFile", { path });
}

export async function putFile(
  path: string,
  content: string,
  isDir = false
) {
  return request("/api/file/putFile", {
    path,
    file: content,
    isDir,
  });
}

// ============ 导出 ============

export async function exportMdContent(docId: string) {
  return request<{ content: string; hPath: string }>(
    "/api/export/exportMdContent",
    { id: docId }
  );
}

// ============ 系统 ============

export async function getSystemVersion() {
  return request<string>("/api/system/version");
}

export async function getSystemTime() {
  return request<{ time: number }>("/api/system/getTime");
}

// ============ 搜索 ============

export async function searchFullText(
  query: string,
  options?: { notebookIDs?: string[]; types?: string[]; limit?: number }
) {
  return request<any[]>("/api/search/searchFullText", {
    query,
    ...(options || {}),
  });
}

// ============ 常用 SQL 查询 ============

/** 获取最近 N 天创建的文档 */
export async function getRecentDocs(days = 7, limit = 20) {
  const stmt = `
    SELECT id, content, hPath, updated, created, type
    FROM blocks
    WHERE type = 'd' AND content != ''
    ORDER BY updated DESC
    LIMIT ${limit}
  `;
  return sqlQuery(stmt);
}

/** 获取文档总数/块总数统计 */
export async function getDocStats() {
  const docCount = await sqlQuery(
    "SELECT COUNT(*) as count FROM blocks WHERE type = 'd'"
  );
  const blockCount = await sqlQuery(
    "SELECT COUNT(*) as count FROM blocks WHERE type != 'd'"
  );
  const tagCount = await sqlQuery(
    "SELECT COUNT(DISTINCT name) as count FROM tags"
  );
  return {
    docs: docCount[0]?.count || 0,
    blocks: blockCount[0]?.count || 0,
    tags: tagCount[0]?.count || 0,
  };
}

/** 获取最近 N 天编辑的文档 */
export async function getRecentEditedDays(days = 30, limit = 10) {
  const stmt = `
    SELECT strftime('%Y-%m-%d', updated/1000, 'unixepoch') as day,
           COUNT(*) as count
    FROM blocks
    WHERE type = 'd'
      AND updated > ${Date.now() - days * 86400000}
    GROUP BY day
    ORDER BY day DESC
    LIMIT ${limit}
  `;
  return sqlQuery(stmt);
}

/** 获取每日日记 */
export async function getDailyNote(date: string) {
  const stmt = `
    SELECT id, content, hPath, created, updated
    FROM blocks
    WHERE type = 'd'
      AND hPath LIKE '%${date}%'
    ORDER BY created DESC
  `;
  return sqlQuery(stmt);
}
