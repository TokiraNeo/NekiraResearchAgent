/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

const readInputSchema = z.object({
  topic: z.string().min(1),
  candidateUrls: z.array(z.url()).min(1).max(10)
});

const readOutputSchema = z.object({
  sourceNotes: z.array(z.object({
    url: z.url().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).min(1).max(5)
  })).min(1)
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
    当前是开发期的 mock 实现，不需要真实访问网页内容。

    主题：{{topic}}

    候选来源：
    {{#each candidateUrls}}
    - {{this}}
    {{/each}}

    请为每个候选来源生成结构化 sourceNotes。

    要求：
    - 每条 sourceNote 包含 url、title、summary、keyPoints
    - title 要像真实网页标题
    - summary 要像对该页面内容的简洁摘要
    - keyPoints 提供 1-5 条
    - 不要写最终报告
  `.trim()
};
