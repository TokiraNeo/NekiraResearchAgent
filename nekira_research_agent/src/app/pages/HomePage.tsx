/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSessionService } from "@/app/hooks/sessionService";
import { SessionSideBar } from "@/app/components/sideBar/SessionSideBar";
import { SessionWorkspace } from "@/app/components/workspace/SessionWorkspace";

export function HomePage() {
  const service = useSessionService();
  
  // 查找当前处于活跃状态的 Session 实例
  const currentSession = service.sessions.find(s => s.id === service.currentSessionId) || null;

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "var(--color-page-bg, #F4F3EF)"
    }}>
      {/* 1. 左侧会话/话题管理侧边栏 */}
      <SessionSideBar service={service} />

      {/* 2. 右侧主工作区控制台（自适应状态渲染） */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
      }}>
        <SessionWorkspace currentSession={currentSession} service={service} />
      </main>
    </div>
  );
}
