/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

// plan阶段的输入结构定义
const planInputSchema = z.object({
  topic: z.string().min(1),
  round: z.number().int().positive(),
  maxRounds: z.number().int().positive(),
  findings: z.array(z.object({
    claim: z.string(),
    sourceUrls: z.array(z.url()),
    confidence: z.enum(["high", "medium", "low"]),
  })),
  gaps: z.array(z.object({
    question: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
});

// plan阶段的输出结构定义
const planOutputSchema = z.object({
  queries: z.array(z.string().min(1)).min(1),
});

type PlanPromptInput = z.infer<typeof planInputSchema>;
type PlanPromptOutput = z.infer<typeof planOutputSchema>;

export const planPromptDef: PromptDefinition<PlanPromptInput, PlanPromptOutput> = {
  id: "plan",
  modelLevel: "standard",
  inputSchema: planInputSchema,
  outputSchema: planOutputSchema,
  template: `
    {{> persona}}

    你正在执行“调研规划”阶段。
    请根据当前状态生成下一轮搜索查询。

    主题：{{topic}}
    当前轮次：{{round}} / {{maxRounds}}

    已有结论：
    {{#if findings.length}}
    {{#each findings}}
    - {{claim}}（置信度：{{confidence}}）
    {{/each}}
    {{else}}
    - 暂无
    {{/if}}

    信息缺口：
    {{#if gaps.length}}
    {{#each gaps}}
    - {{question}}（优先级：{{priority}}）
    {{/each}}
    {{else}}
    - 暂无明确缺口，请先做主题展开
    {{/if}}

    输出要求：
    - 只返回结构化结果
    - queries 应该是可直接用于搜索的短句
    - 避免重复 query
    `.trim(),
}
