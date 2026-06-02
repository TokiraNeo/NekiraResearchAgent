/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {PromptRegistry} from "@/prompts/registry";
import { AnyPromptMap, PromptId } from "@/prompts/promptDef";
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

export function getPrompt(id: PromptId) {
  return promptRegistry.getPrompt(id);
}
