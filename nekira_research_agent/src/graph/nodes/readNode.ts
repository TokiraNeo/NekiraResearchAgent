/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

export async function readNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const responses = await Promise.all(
    state.candidateUrls.map((url) =>
      executePrompt("read", {
        topic: state.topic,
        url: url,
      })
    )
  );

  const sourceNodes = responses.map((response) => response.sourceNode);

  return { sourceNotes: sourceNodes };
}
