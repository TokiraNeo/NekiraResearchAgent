/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Annotation } from "@langchain/langgraph";

// 用于存储整个调研过程中的状态信息，供各个Agent节点访问和更新
export const ResearchState = Annotation.Root({
  // ---- 输入
  topic: Annotation<string>,           // 调研主题
  maxIterations: Annotation<number>,   // 最大迭代次数

  // ---- 搜索规划
  searchQueries: Annotation<string[]>,   // 本轮的搜索查询列表

  // ---- 搜索结果
  searchResults: Annotation<{
    query: string;
    results: Array<{
      title: string,
      url: string,
      snippet: string,
    }>;
    }[]>,                               // 每个搜索查询对应的结果

  // ---- 阅读内容
  readings: Annotation<{
    url: string;
    title: string;
    content: string;      // 清洗后的正文
    summary: string;      // LLM 对单篇文章的摘要
    }[]>,

  // ---- 关键发现
  findings: Annotation<{
    point: string;        // 发现点
    sourceUrls: string[]; // 来源
    confidence: "high" | "medium" | "low";
    }[]>,

  // ---- Agent控制
  iteration: Annotation<number>,       // 当前迭代轮次
  gapAnalysis: Annotation<string>,     // reflect 节点产出的信息缺口分析
  isSufficient: Annotation<boolean>,   // 信息是否充足

  // ---- 输出
  finalReport: Annotation<string>,     // 最终 Markdown 报告
});
