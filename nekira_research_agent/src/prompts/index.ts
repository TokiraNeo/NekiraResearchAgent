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
import { reflectPromptDef } from "@/prompts/templates/reflectPrompt";
import { reportPromptDef } from "@/prompts/templates/reportPrompt";
import { searchPromptDef } from "@/prompts/templates/searchPrompt";
import { readPromptDef } from "@/prompts/templates/readPrompt";

const promptMap = {
  plan: planPromptDef,
  search: searchPromptDef,
  read: readPromptDef,
  reflect: reflectPromptDef,
  report: reportPromptDef,
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
