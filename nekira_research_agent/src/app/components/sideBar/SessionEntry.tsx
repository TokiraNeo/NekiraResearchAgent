/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchSession } from "@/app/schemas/session";
import { useState, useRef, useEffect } from "react";
import styles from "./SessionEntry.module.css";

interface SessionEntryProps {
  session: ResearchSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export function SessionEntry({ session, isActive, onSelect, onRename, onDelete }: SessionEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(session.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步session.name变化
  useEffect(() => {
    setEditVal(session.name);
  }, [session.name]);

  // 进入编辑模式时自动聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveRename = () => {
    setIsEditing(false);
    const trimmed = editVal.trim();
    if (trimmed && trimmed != session.name) {
      onRename(session.id, trimmed);
    }
    else {
      setEditVal(session.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveRename();
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditVal(session.name);
    }
  };

  // 根据 session 状态决定容器样式 class
  const getCardClassName = () => {
    if (session.status === "Interrupted") {
      return `${styles.cardWrapper} ${styles.cardInterrupted}`;
    }
    if (isActive) {
      return `${styles.cardWrapper} ${styles.cardActive}`;
    }
    return styles.cardWrapper;
  };

  // 状态徽章映射
  const renderStatusBadge = () => {
    switch (session.status) {
      case "Running":
        return <span className={`${styles.badge} ${styles.badgeRunning}`}>RUNNING</span>;
      case "Interrupted":
        return <span className={`${styles.badge} ${styles.badgeInterrupted}`}>⚡️ REVIEW</span>;
      case "Completed":
        return <span className={`${styles.badge} ${styles.badgeCompleted}`}>DONE</span>;
      case "Failed":
        return <span className={`${styles.badge} ${styles.badgeFailed}`}>FAILED</span>;
      case "Aborted":
        return <span className={`${styles.badge} ${styles.badgeAborted}`}>ABORTED</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={getCardClassName()}
      onClick={() => !isEditing && onSelect(session.id)}
    >
      <div className={styles.cardContent}>
        {/* 会话图标或序号占位 */}
        <div className={styles.avatar}>
          {session.status === "Running" ? (
            <div className={styles.spinner} />
          ) : (
            <span>Q</span>
          )}
        </div>

        {/* 标题区：支持原地编辑 */}
        <div className={styles.titleArea}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editVal}
              className={styles.renameInput}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className={styles.topicText}
              onDoubleClick={() => setIsEditing(true)}
              title="双击进行重命名"
            >
              {session.name}
            </div>
          )}

          <div className={styles.metaRow}>
            {renderStatusBadge()}
            {session.activeNode && (
              <span className={styles.nodeText}>
                node: {session.activeNode}
              </span>
            )}
          </div>
        </div>

        {/* 右侧悬浮操作按钮区 */}
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.actionBtn}
            onClick={() => setIsEditing(true)}
            title="重命名会话"
          >
            ✎
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(session.id)}
            title="删除此会话"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
    );

}
