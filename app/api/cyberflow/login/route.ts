import { NextRequest, NextResponse } from "next/server";

const NEWAPI_BASE = "https://api.getcyberflow.ai";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "请输入用户名和密码" },
        { status: 400 },
      );
    }

    const loginRes = await fetch(`${NEWAPI_BASE}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      return NextResponse.json(
        { success: false, error: loginData.message || "账号或密码错误" },
        { status: 401 },
      );
    }

    const cookies = loginRes.headers.getSetCookie?.() || [];
    const sessionCookie = cookies.find((c: string) => c.startsWith("session="));
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "登录成功但未获取会话" },
        { status: 500 },
      );
    }
    const cookieValue = sessionCookie.split(";")[0];

    const tokenRes = await fetch(`${NEWAPI_BASE}/api/token/?p=0&page_size=10`, {
      headers: { Cookie: cookieValue },
    });
    const tokenData = await tokenRes.json();
    const items = tokenData.data?.items || tokenData.data || [];
    let tokenKey = "";

    if (Array.isArray(items)) {
      const active = items.find(
        (t: any) =>
          t.status === 1 && (t.unlimited_quota || t.remain_quota > 0),
      );
      if (active) {
        tokenKey = active.key.startsWith("sk-")
          ? active.key
          : "sk-" + active.key;
      }
    }

    if (!tokenKey) {
      await fetch(`${NEWAPI_BASE}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieValue,
        },
        body: JSON.stringify({
          name: "cyberflow-chat-auto",
          remain_quota: 500000,
          unlimited_quota: false,
          expired_time: -1,
        }),
      });

      const listRes = await fetch(
        `${NEWAPI_BASE}/api/token/?p=0&page_size=1`,
        { headers: { Cookie: cookieValue } },
      );
      const listData = await listRes.json();
      const newItems = listData.data?.items || listData.data || [];
      if (Array.isArray(newItems) && newItems.length > 0) {
        const k = newItems[0].key;
        tokenKey = k.startsWith("sk-") ? k : "sk-" + k;
      }
    }

    if (!tokenKey) {
      return NextResponse.json(
        {
          success: false,
          error: "登录成功但无法获取 API 密钥，请联系管理员",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      token: tokenKey,
      user: loginData.data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "服务器错误" },
      { status: 500 },
    );
  }
}
