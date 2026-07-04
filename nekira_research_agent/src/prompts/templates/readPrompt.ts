/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

const readInputSchema = z.object({
  topic: z.string().min(1),
  url: z.url(),
});

const readOutputSchema = z.object({
  sourceNote: z.object({
    url: z.url().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).min(1),
  }),
});

type ReadPromptInput = z.infer<typeof readInputSchema>;
type ReadPromptOutput = z.infer<typeof readOutputSchema>;

export const readPromptDef: PromptDefinition<
  ReadPromptInput,
  ReadPromptOutput
> = {
  id: "read",
  modelLevel: "standard",
  inputSchema: readInputSchema,
  outputSchema: readOutputSchema,
  executionMode: "tool-enabled",
  toolSetId: "read",
  template: `
    {{> persona}}

    你正在执行“阅读分析”阶段。你的唯一目标是基于指定 URL 的正文内容，生成一条可追溯、可审计的 sourceNote。

    主题：{{topic}}

    候选来源：
    - URL: {{url}}

    执行步骤：
    1. 必须先调用 tavilyExtract 抓取 {{url}} 的正文内容。
    2. 只允许依据抓取到的正文内容进行总结，不要使用常识补全、不要猜测页面内容。
    3. 只输出与主题相关、能被正文直接支撑的信息。

    要求：
    - sourceNote.url 必须原样返回 {{url}}
    - sourceNote.title 优先使用正文中的页面标题、文章标题或主标题
    - 如果正文中没有明确标题，再使用最接近正文主旨的标题性表述，但不得凭空虚构
    - sourceNote.summary 必须是对正文内容的精炼概括，建议 2-4 句，明确说明它与主题的关系
    - sourceNote.keyPoints 提供 1-5 个关键词，每条都必须能在正文中找到直接依据
    - 如果正文信息很少，就返回更保守的 summary 和更少的 keyPoints，不要为了凑字段而编造
    - 如果正文几乎无法提取到有效信息，也不要返回空字段；请使用可审计的保底值
    - title 的保底值可以是 URL 本身、域名或页面路径的概括性标题
    - summary 的保底值可以直接说明“正文抽取信息不足，无法可靠生成摘要”
    - keyPoints 至少保留 1 条保底说明，例如“正文抽取信息不足，无法提炼更多要点”
    - 不要输出正文中没有依据的结论、数字、时间、作者、机构或立场
    - 不要返回 URL 之外的其他来源信息
  `.trim(),
};
