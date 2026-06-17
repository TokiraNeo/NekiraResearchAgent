/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { humanReviewNode } from "@/graph/nodes/humanReviewNode";
import { planNode } from "@/graph/nodes/planNode";
import { readNode } from "@/graph/nodes/readNode";
import { reflectNode } from "@/graph/nodes/reflectNode";
import { reportNode } from "@/graph/nodes/reportNode";
import { searchNode } from "@/graph/nodes/searchNode";

export { humanReviewNode, planNode, reportNode, reflectNode, searchNode, readNode };

export const nodeIds = {
  plan: "plan",
  search: "search",
  read: "read",
  reflect: "reflect",
  humanReview: "humanReview",
  report: "report",
} as const;

export const nodeIdSet = new Set<string>(Object.values(nodeIds));