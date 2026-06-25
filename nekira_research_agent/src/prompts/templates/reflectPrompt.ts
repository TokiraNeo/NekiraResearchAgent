/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";
import { reflectActions } from "@/graph/state";

// reflect 阶段的输入结构定义
const reflectInputSchema = z.object({
  topic: z.string().min(1),
  round: z.number().int().positive(),
  maxRounds: z.number().int().positive(),
  sourceNotes: z.array(z.object({
    url: z.url().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).min(1)
  })),
  findings: z.array(z.object({
    claim: z.string(),
    sourceUrls: z.array(z.url()),
    confidence: z.enum(["high", "medium", "low"]),
  }))
});

// reflect 阶段的输出结构定义
const reflectOutputSchema = z.object({
  findings: z.array(z.object({
    claim: z.string(),
    sourceUrls: z.array(z.url()),
    confidence: z.enum(["high", "medium", "low"]),
  })),
  gaps: z.array(z.object({
    question: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  reflectAction: z.enum(reflectActions)
});

type ReflectPromptInput = z.infer<typeof reflectInputSchema>;
type ReflectPromptOutput = z.infer<typeof reflectOutputSchema>;

export const reflectPromptDef: PromptDefinition<ReflectPromptInput, ReflectPromptOutput> = {
  id: "reflect",
  modelLevel: "standard",
  inputSchema: reflectInputSchema,
  outputSchema: reflectOutputSchema,
  template: `
    {{> persona}}

    你正在执行“调研反思”阶段。
    请基于当前收集到的资料，评估目前结论是否足够支撑最终报告，或者是否需要人工介入。

    主题：{{topic}}
    当前轮次：{{round}} / {{maxRounds}}

    已有资料摘要：
    {{#if sourceNotes.length}}
    {{#each sourceNotes}}
    - 标题：{{title}}
      链接：{{url}}
      摘要：{{summary}}
      要点：
      {{#each keyPoints}}
      - {{this}}
      {{/each}}
    {{/each}}
    {{else}}
    - 暂无资料
    {{/if}}

    已有结论：
    {{#if findings.length}}
    {{#each findings}}
    - {{claim}}（置信度：{{confidence}}）
    {{/each}}
    {{else}}
    - 暂无结论
    {{/if}}

    请输出：
    1. 更新后的 findings
    2. 仍然存在的 gaps
    3. reflectAction：
      - "replan" (自治检索优先)：如果发现任何知识缺口 (Gaps) 且当前轮次 {{round}} 仍小于 {{maxRounds}}。
        只要可以通过进一步的自动检索、阅读来填补这些 Gap，必须优先选择 "replan" 进行自主迭代！这是智能体的默认自治行为。
      - "report" (直接生成报告)：如果没有发现明显的、影响报告完整性的 Gap，或者已有的信息已经极为充分。
      - "humanReview" (人工介入/升级路径)：只有在以下极少数情况下才选择：
           1. 检索到的资料存在严重的、合乎逻辑但在事实层面相互排斥的重大分歧，且模型经过多次交叉检索仍无法解决，需要人脑进行逻辑方向裁决。
           2. 遇到了非搜索引擎能解决的主观倾向或商业偏好抉择（例如：“我搜到了 A 公司和 B 公司，两家方案互有利弊，需要您挑选采用哪家”）。

    要求：
    - 不要编造不存在的资料
    - 如果资料不足，明确保留 gaps
    - findings 必须能由已有 sourceNotes 支撑
    - 只有在确实适合继续自动推进时才返回 "replan"
    - 如果存在明显分歧、方向选择或需要用户拍板的问题，优先返回 "humanReview"
    `.trim()
};
