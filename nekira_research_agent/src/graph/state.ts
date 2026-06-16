/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Annotation } from "@langchain/langgraph";

const overwrite = <T>(initial: T) =>
  Annotation<T>({
    reducer: (_left, right) => right,
    default: () => initial,
  });

const appendArray = <T>() =>
  Annotation<T[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  });

export type SourceNote = {
  url: string;
  title: string;
  summary: string;
  keyPoints: string[];
};

export type Finding = {
  claim: string;
  sourceUrls: string[];
  confidence: "high" | "medium" | "low";
};

export type Gap = {
  question: string;
  priority: "high" | "medium" | "low";
};

export const reflectActions = ["replan", "report", "humanReview"] as const;
export type ReflectAction = (typeof reflectActions)[number];

export const humanReviewActions = ["replan", "report"] as const;
export type HumanReviewAction = (typeof humanReviewActions)[number];

// 发起人工审核时，当前节点向外部系统（如 UI）暴露的状态/数据结构
export interface HumanReviewRequest {
  round: number;
  maxRounds: number;
  gaps: Gap[];
};

// 用户决策后提交的反馈
export interface HumanReviewFeedback {
  action: HumanReviewAction;   // 用户决定：是批准继续 replan 深入调研，还是直接出报告？
  editedGaps?: Gap[];          // 用户是否对 gaps 进行了编辑/删减/新增？
  extraRounds?: number;        // 用户在此次人工审核中授权追加的额外轮次（默认 +1）
}

// 用于存储整个调研过程中的状态信息，供各个 Agent 节点访问和更新
export const ResearchState = Annotation.Root({
  // ---- 基础信息
  topic: overwrite(""),
  round: overwrite(1),
  maxRounds: overwrite(3),

  // ---- 搜索计划
  queries: overwrite<string[]>([]),         // 计划的搜索查询列表
  candidateUrls: overwrite<string[]>([]),   // 搜索工具输出的候选 URL 列表

  // ---- 信息收集
  sourceNotes: appendArray<SourceNote>(),

  // ---- 分析与总结
  findings: overwrite<Finding[]>([]),

  // ---- 反思与人工介入
  gaps: overwrite<Gap[]>([]),
  reflectAction: overwrite<ReflectAction>("replan"),
  humanReviewAction: overwrite<HumanReviewAction>("replan"),

  // ---- 输出
  finalReport: overwrite(""),
});

export type ResearchGraphState = typeof ResearchState.State;
export type ResearchGraphUpdate = typeof ResearchState.Update;
