/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ResearchGraphState, ResearchGraphUpdate } from "@/graph/state";
import { executePrompt } from "@/prompts";

function buildFallbackSourceNote(url: string) {
  return {
    url,
    title: url,
    summary: "正文抽取信息不足，无法可靠生成摘要。",
    keyPoints: ["正文抽取信息不足，无法提炼更多要点。"],
  };
}

export async function readNode(state: ResearchGraphState): Promise<ResearchGraphUpdate> {
  const responses = await Promise.all(
    state.candidateUrls.map(async (url) => {
      try {
        return await executePrompt("read", {
          topic: state.topic,
          url,
        });
      } catch (error) {
        console.warn(`[ReadNode] Failed to read url "${url}", using fallback sourceNote.`, error);
        return { sourceNote: buildFallbackSourceNote(url) };
      }
    })
  );

  const sourceNotes = responses.map((response) => response.sourceNote);

  return { sourceNotes };
}
