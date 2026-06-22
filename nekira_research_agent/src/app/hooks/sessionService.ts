/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchSession } from "@/app/schemas/session"
import { useState, useRef } from "react"
import { FlowRuntimeConfig, invokeFlow, resumeFlow } from "@/graph/flow";
import { HumanReviewFeedback } from "@/graph/state";

export function useSessionService() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // sessionId -> AbortController 映射表
  const abortControllerMap = useRef<Map<string, AbortController>>(new Map());

  // 新注册Controller
  const registerAbortController = (id: string): AbortSignal => {
    abortControllerMap.current.get(id)?.abort();

    const controller = new AbortController();
    abortControllerMap.current.set(id, controller);
    return controller.signal;
  }

  // 释放Controller
  const releaseAbortController = (id: string) => {
    abortControllerMap.current.get(id)?.abort();
    abortControllerMap.current.delete(id);
  }

  // 更新当前会话的常规属性
  const updateSession = (id: string, update: Partial<ResearchSession>) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === id ? { ...session, ...update } : session
      )
    );
  }

  // 在指定会话中安全地追加一条实时流日志
  const appendSessionLog = (id: string, logMsg: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === id ? { ...session, logs: [...session.logs, logMsg] } : session
      )
    );
  }

  // 启动一个新会话
  const invokeNewSession = async (topic: string) => {
    const id = globalThis.crypto.randomUUID();

    const newSession: ResearchSession = {
      id,
      name: topic,  // 默认用话题作为会话名称
      topic,
      status: "Idle",
      activeNode: null,
      reveiwRequest: null,
      finalReport: "",
      logs: []
    };

    setSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSessionId(id);

    // 注册Abort信号
    const abortSignal = registerAbortController(id);

    const config: FlowRuntimeConfig = {
      onNodeStart: (nodeName) => {
        updateSession(id, { activeNode: nodeName as any });
      },
      abortSignal: abortSignal
    }

    // 启动会话
    try {
      updateSession(id, { status: "Running" });

      const result = await invokeFlow(id, topic, config);

      if (result.status === "interrupted") {
        updateSession(id, { status: "Interrupted", reveiwRequest: result.request });
      }
      else if (result.status === "completed") {
        updateSession(id, { status: "Completed", finalReport: result.finalReport });
      }
      else if (result.status === "aborted") {
        updateSession(id, { status: "Aborted" });
      }
    }
    catch (error) {
      updateSession(id, { status: "Failed" });
    }
    finally {
      // 执行完毕后释放AbortController
      releaseAbortController(id);
    }
  }

  // 恢复一个中断的会话
  const resumeSession = async (id: string, feedback: HumanReviewFeedback) => {
    // 注册新的Abort信号
    const abortSignal = registerAbortController(id);

    const config: FlowRuntimeConfig = {
      onNodeStart: (nodeName) => {
        updateSession(id, { activeNode: nodeName as any });
      },
      abortSignal: abortSignal
    }

    try {
      updateSession(id, { status: "Running", reveiwRequest: null });

      const result = await resumeFlow(id, feedback, config);

      if (result.status === "interrupted") {
        updateSession(id, { status: "Interrupted", reveiwRequest: result.request });
      }
      else if (result.status === "completed") {
        updateSession(id, { status: "Completed", finalReport: result.finalReport });
      }
      else if (result.status === "aborted") {
        updateSession(id, { status: "Aborted" });
      }
    }
    catch (error) {
      updateSession(id, { status: "Failed" });
    }
    finally {
      // 执行完毕后释放AbortController
      releaseAbortController(id);
    }
  }

  // 删除一个会话
  const deleteSession = (id: string) => {
    // 先中止可能正在运行的流程
    releaseAbortController(id);

    // 再从列表中移除会话
    setSessions(prevSessions => prevSessions.filter(session => session.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  }

  // 重命名一个会话
  const renameSession = (id: string, newName: string) => {
    updateSession(id, { name: newName });
  }

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    invokeNewSession,
    resumeSession,
    deleteSession,
    renameSession,
    appendSessionLog
  }
}
