/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from "react";
import { Gap } from "@/graph/state";
import { GapCard } from "./GapCard";
import styles from "./GapList.module.css";

interface GapListProps {
  gaps: Gap[];
  onChange: (updatedGaps: Gap[]) => void;
}

export function GapList({ gaps, onChange }: GapListProps) {
  // 修改指定的 Gap
  const handleUpdateGap = (index: number, updated: Gap) => {
    const newGaps = [...gaps];
    newGaps[index] = updated;
    onChange(newGaps);
  };

  // 删除指定的 Gap
  const handleDeleteGap = (index: number) => {
    const newGaps = gaps.filter((_, i) => i !== index);
    onChange(newGaps);
  };

  // 添加新的 Gap
  const handleAddGap = () => {
    const newGaps = [...gaps, { question: "", priority: "medium" as const }];
    onChange(newGaps);
  };

  return (
    <div className={styles.listContainer}>
      {/* 渲染卡片列表 */}
      {gaps.length === 0 ? (
        <div className={styles.emptyState}>
          暂无知识缺口，可以点击下方手动添加。
        </div>
      ) : (
        gaps.map((gap, idx) => (
          <GapCard
            key={idx}
            gap={gap}
            index={idx}
            onUpdate={handleUpdateGap}
            onDelete={handleDeleteGap}
          />
        ))
      )}

      {/* 手动追加自定义调研方向 */}
      <button
        type="button"
        className={styles.addBtn}
        onClick={handleAddGap}
      >
        + 新增自定义缺口问题 (Add Gap)
      </button>
    </div>
  );
}
