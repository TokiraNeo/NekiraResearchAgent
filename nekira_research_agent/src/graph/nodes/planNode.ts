/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { promptRegistry } from "@/prompts/registry";
import { ResearchState } from "@/graph/state";

async function planNode(state: typeof ResearchState.State) {
  const isFirstRound = state.iteration == 0;

  // 校验变量
  const missing = promptRegistry.validate("plan", {
    isFirstRound: isFirstRound,
    topic: state.topic,
    count: isFirstRound ? 3 : 2,
    existingFindings: state.findings,
    gapAnalysis: state.gapAnalysis
  });
  if (missing.length > 0) console.warn("Prompt variables missing:", missing);

  const prompt = promptRegistry.renderPrompt("plan", {
    isFirstRound: isFirstRound,
    topic: state.topic,
    count: isFirstRound ? 3 : 2,
    existingFindings: state.findings,
    gapAnalysis: state.gapAnalysis
  });

  // @TODO: 调用LLM

}
