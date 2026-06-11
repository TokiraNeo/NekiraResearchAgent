/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import type { ModelProfileLevel } from "@/agent/model/model";
import type { ToolSetId } from "@/agent/tools";

export type PromptId = "plan" | "search" | "read" | "reflect" | "synthesize" | "report";

export type PromptExecutionMode =
  | "structured"     // 无 tool，直接要求结构化输出
  | "tool-enabled";  // 需要绑定 tools

export interface PromptDefinition<Input, Output> {
  id: PromptId;
  modelLevel?: ModelProfileLevel;     // 可选：指定使用的模型级别
  inputSchema: z.ZodType<Input>;      // 输入数据的 Zod 验证器
  outputSchema: z.ZodType<Output>;    // 输出数据的 Zod 验证器
  template: string;                   // Handlebars 模板

  executionMode?: PromptExecutionMode; // 执行模式，默认为 "structured"
  toolSetId?: ToolSetId;               // 可选：如果 executionMode 是 "tool-enabled"，指定使用的工具集合
  toolChoice?: "auto" | "required";    // 可选：如果 executionMode 是 "tool-enabled"，指定工具选择方式，默认为 "auto"
}

// ---- 泛型Any封装

export type AnyPromptDefinition = PromptDefinition<any, any>;

export type AnyPromptMap = Partial<Record<PromptId, AnyPromptDefinition>>;

export type PromptInput<T extends AnyPromptDefinition> = z.infer<T["inputSchema"]>;
export type PromptOutput<T extends AnyPromptDefinition> = z.infer<T["outputSchema"]>;
