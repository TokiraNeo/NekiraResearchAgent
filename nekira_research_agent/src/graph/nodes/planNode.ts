/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

export async function planNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const response = await executePrompt(
    "plan",
    {
      topic: state.topic,
      round: state.round,
      maxRounds: state.maxRounds,
      findings: state.findings,
      gaps: state.gaps
    }
  );

  return {
    queries: response.queries,
    candidateUrls: []
  };
}
