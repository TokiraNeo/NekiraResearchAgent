/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {promptRegistry} from "@/prompts/registry";

import { planPromptDef } from "@/prompts/templates/planPrompt";
import { personaPartialDef } from "@/prompts/partials/personaPartial";

export function initPrompts(): void {
  // 注册可复用字段
  promptRegistry.registerPartial("persona", personaPartialDef);

  // 注册Prompt
  promptRegistry.registerPrompt(planPromptDef);
}
