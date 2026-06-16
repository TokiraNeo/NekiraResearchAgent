/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchGraphState, ResearchState } from "@/graph/state";
import {
  humanReviewNode,
  nodeIds,
  planNode,
  readNode,
  reflectNode,
  reportNode,
  searchNode,
} from "@/graph/nodes";

type ReflectRoute =
  | typeof nodeIds.plan
  | typeof nodeIds.report
  | typeof nodeIds.humanReview;

function routeAfterReflect(state: ResearchGraphState): ReflectRoute {
  switch (state.reflectAction) {
    case "replan":
      return nodeIds.plan;
    case "humanReview":
      return nodeIds.humanReview;
    case "report":
    default:
      return nodeIds.report;
  }
}

const graph = new StateGraph(ResearchState)
  .addNode(nodeIds.plan, planNode)
  .addNode(nodeIds.search, searchNode)
  .addNode(nodeIds.read, readNode)
  .addNode(nodeIds.reflect, reflectNode)
  .addNode(nodeIds.humanReview, humanReviewNode)
  .addNode(nodeIds.report, reportNode)
  .addEdge(START, nodeIds.plan)
  .addEdge(nodeIds.plan, nodeIds.search)
  .addEdge(nodeIds.search, nodeIds.read)
  .addEdge(nodeIds.read, nodeIds.reflect)
  .addConditionalEdges(nodeIds.reflect, routeAfterReflect, {
    [nodeIds.plan]: nodeIds.plan,
    [nodeIds.report]: nodeIds.report,
    [nodeIds.humanReview]: nodeIds.humanReview,
  })
  .addEdge(nodeIds.humanReview, END)
  .addEdge(nodeIds.report, END)
  .compile();

export async function invokeFlow(topic: string) {
  return graph.invoke({ topic });
}
