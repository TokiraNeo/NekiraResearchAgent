/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchSession } from "@/app/schemas/session"
import { useState } from "react"
import { invokeFlow, resumeFlow } from "@/graph/flow";
import { HumanReviewFeedback } from "@/graph/state";

export function useSessionService() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 更新当前会话
  const updateSession = (id: string, update: Partial<ResearchSession>) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === id ? { ...session, ...update } : session
      )
    );
  };

  // 启动一个新会话
  const invokeNewSession = async (topic: string) => {
    const id = globalThis.crypto.randomUUID();

    const newSession: ResearchSession = {
      id,
      topic,
      round: 1,
      maxRounds: 3,
      status: "Idle",
      activeNode: null,
      reveiwRequest: null,
      finalReport: "",
      logs: []
    };

    setSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSessionId(id);

    // 启动会话
    try {
      const result = await invokeFlow(id, topic);

      if (result.status === "interrupted") {
        updateSession(id, { status: "Interrupted", reveiwRequest: result.request} );
      }
      else if (result.status === "completed") {
        updateSession(id, { status: "Completed", finalReport: result.finalReport });
      }
    }
    catch (error) {
      updateSession(id, { status: "Failed", logs: [`会话异常：${String(error)}`] });
    }
  };

  // 恢复一个中断的会话
  const resumeSession = async (id: string, feedback: HumanReviewFeedback) => {
    // 恢复会话
    try {
      const result = await resumeFlow(id, feedback);

      if (result.status === "interrupted") {
        updateSession(id, { status: "Interrupted", reveiwRequest: result.request} );
      }
      else if (result.status === "completed") {
        updateSession(id, { status: "Completed", finalReport: result.finalReport });
      }
    }
    catch (error) {
      updateSession(id, { status: "Failed", logs: [`恢复会话异常：${String(error)}`] });
    }
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    invokeNewSession,
    resumeSession
  }
}
