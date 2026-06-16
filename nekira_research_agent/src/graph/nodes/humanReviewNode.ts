/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphUpdate, ResearchGraphState, HumanReviewRequest, HumanReviewFeedback } from "@/graph/state";
import { interrupt } from "@langchain/langgraph";

// 当前节点只负责把流程显式暂停在“等待人工介入”的状态。
// 后续可由 UI/外部编排在用户提交决策后，从该状态继续恢复执行。
export async function humanReviewNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const feedback = interrupt<HumanReviewRequest, HumanReviewFeedback>(
    {
      round: state.round,
      maxRounds: state.maxRounds,
      gaps: state.gaps
    }
  );

  if (feedback.action === "report") {
    return {
      humanReviewAction: "report",
      gaps: feedback.editedGaps ?? state.gaps
    }
  }

  return {
    humanReviewAction: "replan",
    gaps: feedback.editedGaps ?? state.gaps,
    round: state.round + 1,
    maxRounds: state.maxRounds + (feedback.extraRounds ?? 1)
  }
}
