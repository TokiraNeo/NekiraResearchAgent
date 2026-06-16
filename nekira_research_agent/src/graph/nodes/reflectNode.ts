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

  // 如果请求的行动是 "replan"，但执行它会导致超过最大轮数限制，则改为 "report"。
  // humanReview会自动追加最大轮数，因此这里不需要额外考虑humanReview的情况。
  if (requestedAction === "replan" && nextRound > maxRounds) {
    return "report";
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
