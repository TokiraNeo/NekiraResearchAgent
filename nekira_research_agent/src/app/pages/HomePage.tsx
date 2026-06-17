/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function HomePage() {
  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "12px",
      background: "var(--color-page-bg, #F4F3EF)"
    }}>
      <h1 style={{
        fontSize: "18px",
        fontWeight: 500,
        margin: 0,
        color: "var(--color-text-primary, #2C2C2A)",
        letterSpacing: "-0.01em"
      }}>
        Nekira Research Agent
      </h1>
      <p style={{
        fontSize: "12px",
        color: "var(--color-text-tertiary, #888780)",
        margin: 0
      }}>
        准备就绪 — 纯净极光白态工作空间已成功挂载
      </p>
    </div>
  );
}
