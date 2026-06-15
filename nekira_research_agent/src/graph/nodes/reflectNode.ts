/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

export async function reflectNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const response = await executePrompt(
    "reflect",
    {
      topic: state.topic,
      round: state.round,
      maxRounds: state.maxRounds,
      sourceNotes: state.sourceNotes,
      findings: state.findings
    }
  );

  const nextRound = state.round + 1;
  const shouldReplan = response.shouldReplan && (nextRound <= state.maxRounds);

  return {
    findings: response.findings,
    gaps: response.gaps,
    shouldReplan: shouldReplan,
    round: shouldReplan ? nextRound : state.round
  };
}
