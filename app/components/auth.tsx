import styles from "./auth.module.scss";
import { IconButton } from "./button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import BotIcon from "../icons/bot.svg";
import clsx from "clsx";

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();

  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const key = apiKey.trim();
    if (!key) {
      setError("请输入 API 密钥");
      return;
    }
    if (!key.startsWith("sk-")) {
      setError("API 密钥格式不正确，应以 sk- 开头");
      return;
    }
    accessStore.update((access) => {
      access.openaiApiKey = key;
    });
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
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <div className={clsx("no-dark", styles["auth-logo"])}>
          <BotIcon />
        </div>

        <div className={styles["auth-title"]}>CyberFlow 算力中心</div>
        <div
          className={styles["auth-tips"]}
          style={{ textAlign: "center", lineHeight: 1.6 }}
        >
          请输入您的 API 密钥开始使用
        </div>

        <div
          style={{
            width: "100%",
            marginTop: "2vh",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "var(--second)",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: "4px" }}>获取密钥：</div>
          <div>
            1. 前往{" "}
            <a
              href="https://api.getcyberflow.ai/register"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--primary)" }}
            >
              注册账号
            </a>
            {" "}或{" "}
            <a
              href="https://api.getcyberflow.ai/login"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--primary)" }}
            >
              登录
            </a>
          </div>
          <div>2. 进入「令牌」页面，创建新令牌</div>
          <div>3. 复制生成的密钥（sk-...），粘贴到下方</div>
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
          type="password"
          placeholder="sk-xxxxxxxxxxxxxxxx"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.currentTarget.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

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
            text="开始使用"
            type="primary"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
