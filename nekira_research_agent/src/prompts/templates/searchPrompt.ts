/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

const searchInputSchema = z.object({
  topic: z.string().min(1),
  round: z.number().int().positive(),
  queries: z.array(z.string().min(1)).min(1)
});

const searchOutputSchema = z.object({
  candidateUrls: z.array(z.url()).min(1)
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

    你正在执行“搜索候选来源”阶段。
    当前是开发期的最小 mock 实现，不需要真正联网搜索。

    主题：{{topic}}
    当前轮次：{{round}}

    查询词：
    {{#each queries}}
    - {{this}}
    {{/each}}

    请根据这些查询词，生成一组“合理的候选来源 URL”作为占位结果。

    要求：
    - 返回 candidateUrls
    - URL 必须是合法格式
    - 尽量模拟常见来源，例如 official docs、news、blog、wiki
    - 避免重复
    - 不需要真实存在，但格式要像真的来源链接
  `.trim()
};
