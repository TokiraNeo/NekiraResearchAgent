/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import { PromptDefinition } from "@/prompts/promptDef";

// report阶段的输入结构定义
const reportInputSchema = z.object({

});

// report阶段的输出结构定义
const reportOutputSchema = z.object({

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

    你正在执行“撰写报告”阶段。
    `.trim()
};
