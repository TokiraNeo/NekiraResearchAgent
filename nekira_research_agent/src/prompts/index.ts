/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PromptRegistry } from "@/prompts/registry";
import { runStructuredPrompt, runToolEnabledPrompt } from "@/prompts/executor";
import { AnyPromptMap, PromptInput, PromptOutput } from "@/prompts/promptDef";
import { personaPartialDef } from "@/prompts/partials/personaPartial";
import { planPromptDef } from "@/prompts/templates/planPrompt";

const promptMap = {
  plan: planPromptDef,
} as const satisfies AnyPromptMap;

export const promptRegistry = new PromptRegistry(promptMap);

export type AppPromptMap = typeof promptMap;

export function initPrompts(): void {
  promptRegistry.registerPartial("persona", personaPartialDef);
}

export async function executePrompt<K extends keyof AppPromptMap>(
  id: K,
  input: PromptInput<AppPromptMap[K]>,
): Promise<PromptOutput<AppPromptMap[K]>> {
  const def = promptRegistry.getPrompt(id);
  const prompt = promptRegistry.renderPrompt(id, input);
  const executionMode = def.executionMode ?? "structured";

  // 根据 executionMode 选择执行方式

  if (executionMode === "structured") {
    return runStructuredPrompt(def, prompt);
  }

  return runToolEnabledPrompt(def, prompt);
}
