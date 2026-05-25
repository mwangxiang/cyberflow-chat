const NEWAPI_BASE = "https://api.getcyberflow.ai";

export interface NewApiUser {
  id: number;
  username: string;
  display_name: string;
  role: number;
  status: number;
  group: string;
  quota: number;
}

export interface NewApiToken {
  id: number;
  name: string;
  key: string;
  remain_quota: number;
  used_quota: number;
  unlimited_quota: boolean;
  status: number;
}

export async function newApiLogin(
  username: string,
  password: string,
): Promise<{ success: boolean; user?: NewApiUser; error?: string }> {
  const res = await fetch(`${NEWAPI_BASE}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success) {
    return { success: true, user: data.data };
  }
  return { success: false, error: data.message || "登录失败" };
}

export async function newApiGetSelf(): Promise<NewApiUser | null> {
  try {
    const res = await fetch(`${NEWAPI_BASE}/api/user/self`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.success && data.data) return data.data;
    return null;
  } catch {
    return null;
  }
}

export async function newApiGetOrCreateToken(): Promise<string | null> {
  try {
    const res = await fetch(`${NEWAPI_BASE}/api/token/?p=0&page_size=5`, {
      credentials: "include",
    });
    const data = await res.json();
    const items = data.data?.items || data.data || [];
    if (Array.isArray(items)) {
      const active = items.find(
        (t: NewApiToken) => t.status === 1 && (t.unlimited_quota || t.remain_quota > 0),
      );
      if (active) return "sk-" + active.key;
    }
    const createRes = await fetch(`${NEWAPI_BASE}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: "cyberflow-chat-auto",
        remain_quota: 500000,
        unlimited_quota: false,
        expired_time: -1,
      }),
    });
    const createData = await createRes.json();
    if (createData.success) {
      const listRes = await fetch(`${NEWAPI_BASE}/api/token/?p=0&page_size=1`, {
        credentials: "include",
      });
      const listData = await listRes.json();
      const newItems = listData.data?.items || listData.data || [];
      if (Array.isArray(newItems) && newItems.length > 0) {
        return "sk-" + newItems[0].key;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function newApiGetBalance(): Promise<{
  used: number;
  remaining: number;
  total: number;
} | null> {
  try {
    const user = await newApiGetSelf();
    if (!user) return null;
    return {
      used: user.quota > 0 ? 0 : 0,
      remaining: user.quota / 500000,
      total: user.quota / 500000,
    };
  } catch {
    return null;
  }
}

export function newApiLogout() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.getcyberflow.ai`;
  });
}
