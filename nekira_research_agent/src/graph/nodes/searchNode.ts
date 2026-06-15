/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

export async function searchNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const response = await executePrompt(
    "search",
    {
      topic: state.topic,
      round: state.round,
      queries: state.queries
    }
  );

  return { candidateUrls: response.candidateUrls };
}
