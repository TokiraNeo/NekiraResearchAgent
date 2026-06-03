/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PromptRegistry } from "@/prompts/registry";
import { runStructuredPrompt, runToolEnablePrompt } from "@/prompts/executor";
import { AnyPromptMap, PromptInput, PromptOutput } from "@/prompts/promptDef";
import { personaPartialDef } from "@/prompts/partials/personaPartial";
import { planPromptDef } from "@/prompts/templates/planPrompt";


const promptMap: AnyPromptMap = {
  "plan": planPromptDef,
};

const promptRegistry = new PromptRegistry(promptMap);

export function initPrompts(): void {
  // 注册可复用字段
  promptRegistry.registerPartial("persona", personaPartialDef);

}

export async function executePrompt<
  T extends AnyPromptMap,
  K extends keyof AnyPromptMap
  >(id: K, input: PromptInput<T[K]>): Promise<PromptOutput<T[K]>> {
  const def = promptRegistry.getPrompt(id);
  const prompt = promptRegistry.renderPrompt(id, input);
  const executionMode = def.executionMode ?? "structured";

  // 根据 executionMode 选择执行方式

  if (executionMode === "structured") {
    return await runStructuredPrompt(def, prompt);
  }

  return await runToolEnablePrompt(def, prompt);
}
