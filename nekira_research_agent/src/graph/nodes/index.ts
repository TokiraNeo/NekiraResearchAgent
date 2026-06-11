/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { planNode } from "@/graph/nodes/planNode"
import { reportNode } from "@/graph/nodes/reportNode"
import { reflectNode } from "@/graph/nodes/reflectNode"
import { searchNode } from "@/graph/nodes/searchNode"
import { readNode } from "@/graph/nodes/readNode"

export { planNode, reportNode, reflectNode, searchNode, readNode }

export const nodeIds = {
  plan: "planNode",
  search: "searchNode",
  read: "readNode",
  reflect: "reflectNode",
  report: "reportNode",
} as const;
