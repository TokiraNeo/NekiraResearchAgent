/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PromptDefinition } from "@/prompts/promptDef";

export const planPromptDef: PromptDefinition = {
  id: "plan",
  version: "1.0.0",
  variables: ["topic", "iteration", "existingFindings", "gapAnalysis", "count"],
  outputSchema: {
    type: "array",
    items: { type: "string" },
  },
  template: `
  {{> persona}}
  ## 任务：规划搜索查询
  调研主题：{{topic}}
  {{#if isFirstRound}}
  这是第一轮搜索，请从最核心的角度开始。
  {{else}}
  ## 已有发现
  {{existingFindings}}
  ## 信息缺口
  {{gapAnalysis}}
  请针对缺口调整搜索方向，避免重复已有信息。
  {{/if}}
  ## 要求
  - 生成 {{count}} 个搜索查询
  - 查询应多样化，覆盖不同角度
  - 优先使用精确的技术关键词
  ## 输出
  只返回 JSON 数组：["query1", "query2", "query3"]
  `.trim(),
}
