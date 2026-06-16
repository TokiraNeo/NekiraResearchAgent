/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { nodeIds } from "@/graph/nodes";
import { HumanReviewRequest } from "@/graph/state";

export interface ResearchSession {
  id: string;
  topic: string;
  round: number;
  maxRounds: number;
  status: "Idle" | "Running" | "Interrupted" | "Completed" | "Failed";
  activeNode: keyof typeof nodeIds | null;
  reveiwRequest: HumanReviewRequest | null;
  finalReport: string;
  logs: string[];
}
