/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { AnyPromptDefinition, AnyPromptMap, PromptOutput } from "@/prompts/promptDef";
import { createModel } from "@/agent/model";
import { resolveTools } from "@/agent/tools";

export async function runStructuredPrompt<
  T extends AnyPromptMap,
  K extends keyof AnyPromptMap,
  D extends AnyPromptDefinition
  >(def: D, prompt: string): Promise<PromptOutput<T[K]>> {
  const modelLevel = def.modelLevel ?? "standard";

  const model = createModel(modelLevel);
  const structuredModel = model.withStructuredOutput(def.outputSchema);

  const response = await structuredModel.invoke(prompt);

  return def.outputSchema.parse(response) as PromptOutput<T[K]>;
}

export async function runToolEnablePrompt<
  T extends AnyPromptMap,
  K extends keyof AnyPromptMap,
  D extends AnyPromptDefinition
  >(def: D, prompt: string): Promise<PromptOutput<T[K]>> {
  const modelLevel = def.modelLevel ?? "standard";

  const model = createModel(modelLevel);

  const toolSetId = def.toolSetId ?? "default";
  const toolChoice = def.toolChoice ?? "auto";

  const tools = resolveTools(toolSetId);

  const toolEnableModel = model.bindTools(tools);

}

type ToolCallTrace = {
  tool: string;
  args: any;
  result: any;
}

type ToolLoopResult = {
  finalText: string;
  trace: ToolCallTrace[];
}

// 执行工具调用循环
async function runToolLoop(modelWithTools: any, prompt: string) {

}
