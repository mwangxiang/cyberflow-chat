export interface NewApiUser {
  id: number;
  username: string;
  display_name: string;
  role: number;
  status: number;
}

export async function newApiLogin(
  username: string,
  password: string,
): Promise<{
  success: boolean;
  accessCode?: string;
  user?: NewApiUser;
  error?: string;
}> {
  try {
    const res = await fetch("/api/cyberflow/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.accessCode) {
      return { success: true, accessCode: data.accessCode, user: data.user };
    }
    return { success: false, error: data.error || "登录失败" };
  } catch {
    return { success: false, error: "网络错误，请稍后重试" };
  }
}
