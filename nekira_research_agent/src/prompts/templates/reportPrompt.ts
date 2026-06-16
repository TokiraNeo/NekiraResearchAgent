/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

// report阶段的输入结构定义
const reportInputSchema = z.object({
  topic: z.string().min(1),
  findings: z.array(z.object({
    claim: z.string(),
    sourceUrls: z.array(z.url()),
    confidence: z.enum(["high", "medium", "low"]),
  })),
  sourceNotes: z.array(z.object({
    url: z.url().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).min(1).max(5)
  })),
});

// report阶段的输出结构定义
const reportOutputSchema = z.object({
  finalReport: z.string().min(1),
});

type ReportPromptInput = z.infer<typeof reportInputSchema>;
type ReportPromptOutput = z.infer<typeof reportOutputSchema>;

export const reportPromptDef: PromptDefinition<ReportPromptInput, ReportPromptOutput> = {
  id: "report",
  modelLevel: "standard",
  inputSchema: reportInputSchema,
  outputSchema: reportOutputSchema,
  template: `
    {{> persona}}

    你正在执行“最终报告生成”阶段。
    请根据已有 findings 与 sourceNotes，生成一份结构清晰、可直接阅读的 markdown 调研报告。

    主题：{{topic}}

    核心结论：
    {{#each findings}}
    - {{claim}}（置信度：{{confidence}}）
    {{/each}}

    来源资料：
    {{#each sourceNotes}}
    - {{title}}（{{url}}）
      摘要：{{summary}}
    {{/each}}

    输出要求：
    - 使用 markdown
    - 包含：标题、摘要、核心发现、证据与来源、未解决问题（如有）
    - 不要编造超出 findings/sourceNotes 的内容
    - finalReport 返回完整 markdown 正文
    `.trim()
};
