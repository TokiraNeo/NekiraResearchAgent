/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

function formatConfidenceLabel(confidence: "high" | "medium" | "low"): string {
  switch (confidence) {
    case "high":
      return "高";
    case "medium":
      return "中";
    case "low":
    default:
      return "低";
  }
}

function buildReportMarkdown(report: {
  title: string;
  executiveSummary: string;
  coreFindings: Array<{
    title: string;
    analysis: string;
    sourceUrls: string[];
    confidence: "high" | "medium" | "low";
  }>;
  evidenceHighlights: Array<{
    sourceTitle: string;
    url: string;
    contribution: string;
  }>;
  unresolvedQuestions: string[];
  conclusion: string;
}, sourceNotes: Array<{ url: string; title: string }>): string {
  const sourceTitleByUrl = new Map(sourceNotes.map((item) => [item.url, item.title] as const));

  const formatSourceLabel = (url: string): string => {
    return sourceTitleByUrl.get(url) ?? url;
  };

  const lines: string[] = [];

  lines.push(`# ${report.title}`, "");
  lines.push("## 摘要", "");
  lines.push(report.executiveSummary.trim(), "");

  lines.push("## 核心发现", "");
  report.coreFindings.forEach((finding, index) => {
    lines.push(`### ${index + 1}. ${finding.title}`, "");
    lines.push(finding.analysis.trim(), "");
    lines.push(`- 置信度：${formatConfidenceLabel(finding.confidence)}`);
    lines.push(`- 依据来源：`);
    finding.sourceUrls.forEach((url) => {
      lines.push(`  - ${formatSourceLabel(url)}`);
    });
    lines.push("");
  });

  lines.push("## 证据与来源", "");
  report.evidenceHighlights.forEach((item) => {
    lines.push(`- **${item.sourceTitle}**（${item.url}）`);
    lines.push(`  ${item.contribution.trim()}`);
  });
  lines.push("");

  lines.push("## 未解决问题", "");
  if (report.unresolvedQuestions.length === 0) {
    lines.push("- 暂无明确未解决问题。", "");
  } else {
    report.unresolvedQuestions.forEach((question) => {
      lines.push(`- ${question}`);
    });
    lines.push("");
  }

  lines.push("## 结论", "");
  lines.push(report.conclusion.trim());

  return lines.join("\n").trim();
}

export async function reportNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const response = await executePrompt(
    "report",
    {
      topic: state.topic,
      findings: state.findings,
      sourceNotes: state.sourceNotes
    }
  );

  return {
    finalReport: buildReportMarkdown(response, state.sourceNotes),
  };
}
