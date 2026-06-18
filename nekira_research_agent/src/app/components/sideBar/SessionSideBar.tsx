/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useState } from "react";
import { useSessionService } from "@/app/hooks/sessionService";
import { SessionEntry } from "./SessionEntry";
import styles from "./SessionSideBar.module.css";

interface SessionSideBarProps {
  service: ReturnType<typeof useSessionService>;
}

export function SessionSideBar({ service }: SessionSideBarProps) {
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    invokeNewSession,
    deleteSession,
    renameSession,
  } = service;

  const [newTopic, setNewTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = newTopic.trim();
    if (!topic || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setNewTopic("");
      await invokeNewSession(topic);
    } catch (error) {
      console.error("[SessionSideBar] 启动新话题失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* 1. 顶层标题栏 */}
      <div className={styles.header}>
        <h2 className={styles.brandTitle}>Research Sessions</h2>
        <span className={styles.countBadge}>{sessions.length}</span>
      </div>

      {/* 2. 新话题极光自发光输入容器 */}
      <form className={styles.inputWrapper} onSubmit={handleStartResearch}>
        <input
          type="text"
          value={newTopic}
          placeholder="输入调研话题并回车..."
          className={styles.topicInput}
          disabled={isSubmitting}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!newTopic.trim() || isSubmitting}
          title="发起深度智能调研"
        >
          ↗
        </button>
      </form>

      {/* 3. 话题列表滚动区域 */}
      <div className={styles.listArea}>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✦</div>
            <p>暂无调研话题</p>
            <span>在上方输入一个新的课题，启动多节点 LangGraph 自动化调研。</span>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionEntry
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onSelect={setCurrentSessionId}
              onRename={renameSession}
              onDelete={deleteSession}
            />
          ))
        )}
      </div>
    </aside>
  );
}
