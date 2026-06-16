/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from "react";
import { Gap } from "@/graph/state";

interface GapCardProps {
  index: number;
  gap: Gap;
  onUpdate: (index: number, updated: Gap) => void;
  onDelete: (index: number) => void;
}

export function GapCard({ index, gap, onUpdate, onDelete }: GapCardProps) {
  // 优先级切换循环 Low -> Medium -> High -> Low ...
  const togglePriority = () => {
    const nextPriorityMap: Record<Gap["priority"], Gap["priority"]> = {
      low: "medium",
      medium: "high",
      high: "low"
    };

    onUpdate(
      index,
      {
        ...gap,
        priority: nextPriorityMap[gap.priority]
      }
    );
  };

  // 优先级 Badge 的颜色映射 @TODO: 这里后续通过 CSS 变量来实现主题适配
  const badgeStyles: Record<Gap["priority"], React.CSSProperties> = {
    high: { background: "var(--color-background-danger, #FCEBEB)", color: "var(--color-text-danger, #A32D2D)" },
    medium: { background: "var(--color-background-warning, #FAEEDA)", color: "var(--color-text-warning, #BA7517)" },
    low: { background: "var(--color-background-info, #E6F1FB)", color: "var(--color-text-info, #185FA5)" },
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "var(--color-background-primary, #ffffff)",
      padding: "10px 12px",
      borderRadius: "var(--border-radius-md, 8px)",
      border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }}>
      {/* 序号 */}
      <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", width: "16px" }}>{index + 1}</span>

      {/* 问题编辑输入框 */}
      <input
        type="text"
        value={gap.question}
        onChange={(e) => onUpdate(index, { ...gap, question: e.target.value })}
        style={{
          flex: 1,
          border: "none",
          background: "transparent",
          fontSize: "12.5px",
          outline: "none",
          fontFamily: "inherit",
          color: "var(--color-text-primary, #2C2C2A)"
        }}
        placeholder="输入要深入研究的关键缺口问题..."
      />

      {/* 优先级点击切换 Badge */}
      <span
        onClick={togglePriority}
        style={{
          cursor: "pointer",
          fontSize: "10.5px",
          fontWeight: 500,
          padding: "3px 8px",
          borderRadius: "4px",
          userSelect: "none",
          transition: "all 0.1s",
          ...badgeStyles[gap.priority]
        }}
      >
        {gap.priority.toUpperCase()}
      </span>

      {/* 删除按钮 */}
      <button
        onClick={() => onDelete(index)}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-text-danger, #A32D2D)",
          cursor: "pointer",
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center"
        }}
        title="删除此缺口"
      >
        ✕
      </button>
    </div>
  );
}
