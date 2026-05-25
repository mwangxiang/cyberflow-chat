import styles from "./auth.module.scss";
import { IconButton } from "./button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import BotIcon from "../icons/bot.svg";
import { PasswordInput } from "./ui-lib";
import { newApiLogin } from "../utils/newapi-auth";
import clsx from "clsx";

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }
    setLoading(true);
    setError("");

    const result = await newApiLogin(username, password);
    if (!result.success) {
      setError(result.error || "登录失败，请检查账号密码");
      setLoading(false);
      return;
    }

    accessStore.update((access) => {
      access.openaiApiKey = result.token!;
    });
    setLoading(false);
    navigate(Path.Chat);
  };

  return (
    <div className={styles["auth-page"]}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "360px",
          margin: "0 auto",
        }}
      >
        <div className={clsx("no-dark", styles["auth-logo"])}>
          <BotIcon />
        </div>

        <div className={styles["auth-title"]}>CyberFlow 算力中心</div>
        <div className={styles["auth-tips"]}>
          登录您的 CyberFlow 账户以使用 AI 算力
        </div>

        <input
          style={{
            marginTop: "2vh",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-in-light)",
            background: "var(--white)",
            color: "var(--black)",
            fontSize: "14px",
            width: "100%",
            boxSizing: "border-box",
          }}
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <div style={{ width: "100%", marginTop: "1.5vh" }}>
          <PasswordInput
            style={{ width: "100%" }}
            aria="显示密码"
            aria-label="密码"
            value={password}
            type="text"
            placeholder="密码"
            onChange={(e) => setPassword(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && (
          <div
            style={{
              color: "#e53e3e",
              fontSize: "13px",
              marginTop: "1vh",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div
          className={styles["auth-actions"]}
          style={{ marginTop: "2vh", width: "100%" }}
        >
          <IconButton
            text={loading ? "登录中..." : "登录"}
            type="primary"
            onClick={handleLogin}
            disabled={loading}
          />
          <IconButton
            text="注册账户"
            onClick={() => {
              window.open("https://api.getcyberflow.ai/register", "_blank");
            }}
          />
        </div>
      </div>
    </div>
  );
}
