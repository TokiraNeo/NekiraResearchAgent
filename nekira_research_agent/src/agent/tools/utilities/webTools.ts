/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { toolConfig } from "@/agent/tools/config";

export const tavilySearch = tool(
  async ({ query, maxResult = 5 }) => {
    const apiKey = toolConfig.config.tavilyAPI;
    if (!apiKey) {
      throw new Error(
        "Tavily API key is not configured. Please set VITE_TOOL_CONFIG in `.env`.",
      );
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResult,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Tavily search failed: ${response.status} ${detail}`);
    }

    const data = await response.json();
    return data.results.map((result: any) => {
      return {
        title: result.title,
        url: result.url,
        content: result.content,
      };
    });
  },
  {
    name: "tavilySearch",
    description:
      "Search the web for up-to-date information on a given query topic.",
    schema: z.object({
      query: z.string().describe("The search query string"),
      maxResult: z
        .number()
        .optional()
        .describe("Maximum search results to return (default 5)"),
    }),
  },
);

export const tavilyExtract = tool(
  async ({ url }) => {
    const apiKey = toolConfig.config.tavilyAPI;
    if (!apiKey) {
      throw new Error(
        "Tavily API key is not configured. Please set VITE_TOOL_CONFIG in `.env`.",
      );
    }

    const response = await fetch("https://api.tavily.com/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        format: "markdown",
        urls: [url],
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Tavily extract failed: ${response.status} ${detail}`);
    }

    const data = await response.json();
    return data.results[0]?.raw_content || "";
  },
  {
    name: "tavilyExtract",
    description: "Extract webpage content from a given URL.",
    schema: z.object({
      url: z.url().describe("The URL of the webpage to extract content from"),
    }),
  },
);
