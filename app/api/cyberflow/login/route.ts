import { NextRequest, NextResponse } from "next/server";

const NEWAPI_BASE = "https://api.getcyberflow.ai";
const ACCESS_CODE = "cyberflow2026";

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

    return NextResponse.json({
      success: true,
      accessCode: ACCESS_CODE,
      user: loginData.data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "服务器错误" },
      { status: 500 },
    );
  }
}
