/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { StateGraph, START, END, MemorySaver, Command, LangGraphRunnableConfig } from "@langchain/langgraph";
import { ResearchGraphState, ResearchState, HumanReviewRequest, HumanReviewFeedback, ReflectAction } from "@/graph/state";
import {
  humanReviewNode,
  nodeIds,
  nodeIdSet,
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

type HumanReviewRoute =
  | typeof nodeIds.plan
  | typeof nodeIds.report;

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

function routeAfterHumanReview(state: ResearchGraphState): HumanReviewRoute {
  switch (state.humanReviewAction) {
    case "replan":
      return nodeIds.plan;
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
    [nodeIds.humanReview]: nodeIds.humanReview
  })
  .addConditionalEdges(nodeIds.humanReview, routeAfterHumanReview, {
    [nodeIds.plan]: nodeIds.plan,
    [nodeIds.report]: nodeIds.report
  })
  .addEdge(nodeIds.report, END)
  .compile({ checkpointer: new MemorySaver() });

export type FlowRunResult =
  {
    status: "completed",
    threadId: string,
    finalReport: string
  }
  |
  {
    status: "interrupted",
    threadId: string,
    request: HumanReviewRequest
  };

// 定义节点进入/生命周期事件回调
export type NodeStartCallback = (nodeName: string) => void;

// 新发起一个调研流程，支持传入可选的 onNodeStart 原生生命周期回调
export async function invokeFlow(
  threadId: string,
  topic: string,
  onNodeStart?: NodeStartCallback
): Promise<FlowRunResult> {
  const config: LangGraphRunnableConfig = {
    configurable: { thread_id: threadId },
    callbacks: [
      {
        handleChainStart(_chain, _inputs, _runId, _runType, _tags, _metadata, runName, _parentRunId, _extra) {
          if (onNodeStart && runName && nodeIdSet.has(runName)) {
            onNodeStart(runName);
          }
        },
      }
    ]
  };

  try {
    const stream = await graph.stream({ topic }, config);
    return consumeFlowStream(threadId, stream);
  }
  catch (error) {
    console.error(`[Flow] 图执行失败:`, error);
    throw error;
  }
}

// 人审结束后恢复图的运行，同样支持生命周期回调
export async function resumeFlow(
  threadId: string,
  feedback: HumanReviewFeedback,
  onNodeStart?: NodeStartCallback
): Promise<FlowRunResult> {
  const config: LangGraphRunnableConfig = {
    configurable: { thread_id: threadId },
    callbacks: [
      {
        handleChainStart(_chain, _inputs, _runId, _runType, _tags, _metadata, runName, _parentRunId, _extra) {
          if (onNodeStart && runName && nodeIdSet.has(runName)) {
            onNodeStart(runName);
          }
        },
      }
    ]
  };

  try {
    const stream = await graph.stream(
      new Command({ resume: feedback }),
      config
    );
    return await consumeFlowStream(threadId, stream);
  }
  catch (error) {
    console.error(`[Flow] 图恢复运行失败:`, error);
    throw error;
  }
}

// 内部辅助函数：通用消费流的逻辑，并实时检测流中产生的中断信号
async function consumeFlowStream(threadId: string, stream: AsyncGenerator<Record<string, any>>): Promise<FlowRunResult> {
  let finalReport = "";

  for await (const chunk of stream) {
    // 检测是否有中断信号
    if ("__interrupt__" in chunk) {
      const interruptInfo = chunk.__interrupt__[0];
      const request = interruptInfo?.value as HumanReviewRequest;

      return {
        status: "interrupted",
        threadId,
        request
      }
    }

    // 处理正常的输出数据（如最终报告）
    if (chunk.report && chunk.report.finalReport) {
      finalReport = chunk.report.finalReport;
    }
  }

  // 流正常结束，返回最终报告
  return {
    status: "completed",
    threadId,
    finalReport
  }
}
