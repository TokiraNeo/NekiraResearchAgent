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
  sourceNode: z.object({
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
  template: `
    {{> persona}}

    你正在执行“阅读分析”阶段。请为候选来源生成结构化 sourceNote。

    主题：{{topic}}

    候选来源：
    - URL: {{url}}

    要求：
    - 你【必须】调用 tavilyExtract 抓取 {{url}} 的正文，基于正文产出 sourceNote
    - sourceNote 包含 url、title、summary、keyPoints
    - summary 必须来自你读到的正文
    - keyPoints 提供 1-5 条，均需有正文支撑，不得编造
  `.trim(),
};
