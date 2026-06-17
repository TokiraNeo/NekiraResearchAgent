/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useState } from "react";
import { Gap } from "@/graph/state";
import styles from "./GapCard.module.css";

interface GapCardProps {
  index: number;
  gap: Gap;
  onUpdate: (index: number, updated: Gap) => void;
  onDelete: (index: number) => void;
}

export function GapCard({ index, gap, onUpdate, onDelete }: GapCardProps) {
  // 局部焦点控制，触发外围 1px 极窄极光边与 Soft Glow 软发光
  const [isFocused, setIsFocused] = useState(false);

  // 优先级切换循环 low -> medium -> high -> low ...
  const togglePriority = () => {
    const nextPriorityMap: Record<Gap["priority"], Gap["priority"]> = {
      low: "medium",
      medium: "high",
      high: "low"
    };

    onUpdate(index, {
      ...gap,
      priority: nextPriorityMap[gap.priority]
    });
  };

  // 绑定特定优先级徽章的 CSS 模块样式
  const badgeClassMap: Record<Gap["priority"], string> = {
    high: `${styles.badge} ${styles.badge_high}`,
    medium: `${styles.badge} ${styles.badge_medium}`,
    low: `${styles.badge} ${styles.badge_low}`,
  };

  return (
    <div className={isFocused ? styles.cardWrapperActive : styles.cardWrapper}>
      <div className={styles.cardContent}>
        {/* 序号 */}
        <span className={styles.indexCircle}>{index + 1}</span>

        {/* 极简无边框输入框 */}
        <input
          type="text"
          className={styles.inputField}
          value={gap.question}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onUpdate(index, { ...gap, question: e.target.value })}
          placeholder="输入要深入研究的关键缺口问题..."
        />

        {/* 优先级点击切换 Badge */}
        <span className={badgeClassMap[gap.priority]} onClick={togglePriority}>
          {gap.priority.toUpperCase()}
        </span>

        {/* 删除按钮 */}
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(index)}
          title="删除此缺口"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
