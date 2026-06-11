/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

const searchInputSchema = z.object({

});

const searchOutputSchema = z.object({
});

type SearchPromptInput = z.infer<typeof searchInputSchema>;
type SearchPromptOutput = z.infer<typeof searchOutputSchema>;

export const searchPromptDef: PromptDefinition<SearchPromptInput, SearchPromptOutput> = {
  id: "search",
  modelLevel: "standard",
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  template: `
    {{> persona}}

    你正在执行“搜索查询”阶段。
  `.trim()
};
