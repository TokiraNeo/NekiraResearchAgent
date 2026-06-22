/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphUpdate, ResearchGraphState } from "@/graph/state";

export async function humanReviewNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  // 由于Tauri打包的前端Webview环境里缺少原生Node.js,
  // 而interrupt() 是通过 Node.js 原生的 AsyncLocalStorage 机制，
  // 来在全局执行链中悄悄跟踪、存储和恢复当前 Thread（线程）的执行上下文。
  // 这会拿不到任何 AsyncLocalStorage 状态上下文，以为这是一个图外部（Outside Graph）的非法空调用
  // const feedback = interrupt<HumanReviewRequest, HumanReviewFeedback>(
  //   {
  //     round: state.round,
  //     maxRounds: state.maxRounds,
  //     gaps: state.gaps
  //   }
  // );

  const feedback = state.lastHumanReviewFeedback;

  if (!feedback || feedback.action === "report") {
    return {
      humanReviewAction: "report",
      gaps: feedback?.editedGaps ?? state.gaps,
      lastHumanReviewFeedback: null
    }
  }

  return {
    humanReviewAction: "replan",
    gaps: feedback.editedGaps ?? state.gaps,
    round: state.round + 1,
    maxRounds: state.maxRounds + (feedback.extraRounds ?? 1),
    lastHumanReviewFeedback: null
  }
}
