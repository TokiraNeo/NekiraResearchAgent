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

type SourceNote = {
  url: string;
  title: string;
  summary: string;
  keyPoints: string[];
};

type Finding = {
  claim: string;
  sourceUrls: string[];
  confidence: "high" | "medium" | "low";
};

type Gap = {
  question: string;
  priority: "high" | "medium" | "low";
};

// 用于存储整个调研过程中的状态信息，供各个Agent节点访问和更新
export const ResearchState = Annotation.Root({
  // ---- 基础信息
  topic: overwrite(""),
  round: overwrite(1),
  maxRounds: overwrite(3),

  // ---- 搜索计划
  queries: overwrite<string[]>([]),           // 计划的搜索查询列表
  candidateUrls: overwrite<string[]>([]),     // 搜索工具输出的候选URL列表

  // ---- 信息收集
  sourceNotes: appendArray<SourceNote>(),

  // ---- 分析与总结
  findings: overwrite<Finding[]>([]),

  // ---- 反思
  gaps: overwrite<Gap[]>([]),

  // ---- 输出
  shouldReplan: overwrite(true),    // 是否继续下一轮调研，false则结束进入报告生成阶段
  finalReport: overwrite(""),
});

export type ResearchGraphState = typeof ResearchState.State;
export type ResearchGraphUpdate = typeof ResearchState.Update;
