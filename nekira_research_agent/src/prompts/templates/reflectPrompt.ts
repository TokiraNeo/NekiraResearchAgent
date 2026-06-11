/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

// reflect阶段的输入结构定义
const reflectInputSchema = z.object({

});

// reflect阶段的输出结构定义
const reflectOutputSchema = z.object({

});

type ReflectPromptInput = z.infer<typeof reflectInputSchema>;
type ReflectPromptOutput = z.infer<typeof reflectOutputSchema>;

export const reflectPromptDef: PromptDefinition<ReflectPromptInput, ReflectPromptOutput> = {
  id: "reflect",
  modelLevel: "advanced",
  inputSchema: reflectInputSchema,
  outputSchema: reflectOutputSchema,
  template: `
    {{> persona}}

    你正在执行“反思总结”阶段。
    `.trim()
};
