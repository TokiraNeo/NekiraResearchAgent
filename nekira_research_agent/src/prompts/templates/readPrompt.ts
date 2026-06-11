/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

const readInputSchema = z.object({

});

const readOutputSchema = z.object({

});

type ReadPromptInput = z.infer<typeof readInputSchema>;
type ReadPromptOutput = z.infer<typeof readOutputSchema>;

export const readPromptDef: PromptDefinition<ReadPromptInput, ReadPromptOutput> = {
  id: "read",
  modelLevel: "standard",
  inputSchema: readInputSchema,
  outputSchema: readOutputSchema,
  template: `
    {{> persona}}

    你正在执行“阅读分析”阶段。
  `.trim()
};
