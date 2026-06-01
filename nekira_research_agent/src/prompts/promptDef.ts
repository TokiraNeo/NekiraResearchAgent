/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type PromptId = "plan" | "search" | "read" | "reflect" | "synthesize" | "generateReport";

export interface PromptDefinition {
  id: PromptId;
  variables: string[];        // 模板需要的变量列表
  outputSchema: object;       // 期望的输出 JSON Schema
  template: string;           // Handlebars 模板
}
