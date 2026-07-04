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
  queries: z.array(z.string().min(1)).min(1),
});

const searchOutputSchema = z.object({
  candidateUrls: z.array(z.url()).min(1),
});

type SearchPromptInput = z.infer<typeof searchInputSchema>;
type SearchPromptOutput = z.infer<typeof searchOutputSchema>;

export const searchPromptDef: PromptDefinition<
  SearchPromptInput,
  SearchPromptOutput
> = {
  id: "search",
  modelLevel: "standard",
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  executionMode: "tool-enabled",
  toolSetId: "search",
  template: `
    {{> persona}}

    你正在执行“搜索候选来源”阶段。你的目标是围绕当前主题，找到一组适合后续阅读分析的高相关、低重复候选 URL。

    主题：{{topic}}
    当前轮次：{{round}}

    查询词：
    {{#each queries}}
    - {{this}}
    {{/each}}

    执行步骤：
    1. 必须针对查询词调用 tavilySearch 进行搜索。
    2. 汇总所有搜索结果，只保留与主题直接相关、可进一步阅读的页面。
    3. 对重复、近似重复、明显无关、过于泛化的结果进行剔除。
    4. 只返回最终可进入 read 阶段的 URL 列表。

    要求：
    - candidateUrls 中的每一项都必须是搜索结果里真实出现过的 URL，不要编造
    - 优先选择原始来源、官方文档、论文、新闻原文、产品公告、机构官网等一手页面
    - 尽量避免首页、标签页、聚合页、搜索结果页、导航页和登录页
    - 如果某个 URL 只是“看起来相关”，但无法明显支持后续阅读分析，就不要返回
    - candidateUrls 必须去重，保留最有信息量、最可读的页面
    - 返回的 URL 应尽量覆盖不同子问题或不同证据来源，而不是同一站点的重复页面
    - URL 必须是合法格式
    - 不要输出解释性文本，只输出结构化结果
  `.trim(),
};
