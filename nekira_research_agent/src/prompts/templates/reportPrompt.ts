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
    keyPoints: z.array(z.string().min(1)).min(1)
  })),
});

// report阶段的输出结构定义
const reportOutputSchema = z.object({
  title: z.string().min(1),
  executiveSummary: z.string().min(1),
  coreFindings: z.array(z.object({
    title: z.string().min(1),
    analysis: z.string().min(1),
    sourceUrls: z.array(z.url()).min(1),
    confidence: z.enum(["high", "medium", "low"]),
  })).min(1),
  evidenceHighlights: z.array(z.object({
    sourceTitle: z.string().min(1),
    url: z.url().min(1),
    contribution: z.string().min(1),
  })).min(1),
  unresolvedQuestions: z.array(z.string().min(1)),
  conclusion: z.string().min(1),
});

type ReportPromptInput = z.infer<typeof reportInputSchema>;
type ReportPromptOutput = z.infer<typeof reportOutputSchema>;

export const reportPromptDef: PromptDefinition<ReportPromptInput, ReportPromptOutput> = {
  id: "report",
  modelLevel: "advanced",
  inputSchema: reportInputSchema,
  outputSchema: reportOutputSchema,
  template: `
    {{> persona}}

    你正在执行“最终报告生成”阶段。
    请根据已有 findings 与 sourceNotes，先做分析与综合，再输出结构化报告内容。

    主题：{{topic}}

    已有结论（不要逐条照抄，要进行综合、重组和提炼）：
    {{#each findings}}
    - {{claim}}（置信度：{{confidence}}）
    {{/each}}

    已有来源资料（用于证据支撑，不要原样搬运为正文）：
    {{#each sourceNotes}}
    - {{title}}（{{url}}）
      摘要：{{summary}}
      要点：
      {{#each keyPoints}}
      - {{this}}
      {{/each}}
    {{/each}}

    生成要求：
    - 先做归纳，再写正文，不要把 sourceNotes 逐条复制到报告里
    - title 要像一篇正式调研报告标题，简洁明确
    - executiveSummary 需要概括“这次调研到底回答了什么”
    - coreFindings 必须是综合后的发现，每条都要说明意义、边界或推断依据
    - evidenceHighlights 要把“哪个来源支持了什么”说清楚，但每条只写一句，不要长篇复制摘要
    - unresolvedQuestions 只写仍然未被证据充分回答的问题，没有就返回空数组
    - conclusion 要给出基于现有证据的最终判断或建议
    - 不要编造超出 findings/sourceNotes 的内容
    - 不要输出 markdown，输出结构化结果即可
  `.trim()
};
