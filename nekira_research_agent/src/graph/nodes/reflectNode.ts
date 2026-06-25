/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ReflectAction, ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

function resolveReflectAction(
  requestedAction: ReflectAction,
  round: number,
  maxRounds: number,
): ReflectAction {
  const nextRound = round + 1;

  // 如果智能体想自主 Replan 深入检索，但发现轮数预算已到上限：
  // 应当主动升级为 humanReview，展现这些 Gap 并询问人类是否授权追加轮数！
  if (requestedAction === "replan" && nextRound > maxRounds) {
    return "humanReview";
  }

  return requestedAction;
}

export async function reflectNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const response = await executePrompt(
    "reflect",
    {
      topic: state.topic,
      round: state.round,
      maxRounds: state.maxRounds,
      sourceNotes: state.sourceNotes,
      findings: state.findings,
    }
  );

  const reflectAction = resolveReflectAction(
    response.reflectAction,
    state.round,
    state.maxRounds,
  );

  return {
    findings: response.findings,
    gaps: response.gaps,
    reflectAction,
    round: reflectAction === "replan" ? state.round + 1 : state.round,
  };
}
