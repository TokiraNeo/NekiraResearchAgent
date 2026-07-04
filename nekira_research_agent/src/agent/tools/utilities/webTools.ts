/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { toolConfig } from "@/agent/tools/config";

const DEFAULT_SEARCH_MAX_RESULT = 5;
const MAX_SEARCH_MAX_RESULT = 10;
const DEFAULT_EXTRACT_MAX_CHARACTERS = 16000;

const tavilySearchResultSchema = z.object({
  title: z.string().optional(),
  url: z.url(),
  content: z.string().optional(),
  score: z.number().optional(),
  published_date: z.string().optional(),
});

const tavilySearchResponseSchema = z.object({
  results: z.array(tavilySearchResultSchema).default([]),
});

const tavilyExtractResultSchema = z.object({
  url: z.url().optional(),
  title: z.string().optional(),
  raw_content: z.string().optional(),
});

const tavilyExtractResponseSchema = z.object({
  results: z.array(tavilyExtractResultSchema).default([]),
});

export const tavilySearch = tool(
  async ({ query, maxResult = DEFAULT_SEARCH_MAX_RESULT }) => {
    const normalizedMaxResult = Math.min(
      Math.max(Math.trunc(maxResult), 1),
      MAX_SEARCH_MAX_RESULT,
    );
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
        max_results: normalizedMaxResult,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Tavily search failed: ${response.status} ${detail}`);
    }

    const rawData = await response.json();
    const data = tavilySearchResponseSchema.parse(rawData);

    const results = data.results.map((result) => {
      return {
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        publishedDate: result.published_date,
      };
    });

    return {
      query,
      maxResult: normalizedMaxResult,
      resultCount: results.length,
      results,
    };
  },
  {
    name: "tavilySearch",
    description:
      "Search the web for up-to-date information on a given query topic and return normalized candidate URLs.",
    schema: z.object({
      query: z.string().describe("The search query string"),
      maxResult: z
        .number()
        .int()
        .min(1)
        .max(MAX_SEARCH_MAX_RESULT)
        .optional()
        .describe("Maximum search results to return (default 5)"),
    }),
  },
);

export const tavilyExtract = tool(
  async ({ url, maxCharacters = DEFAULT_EXTRACT_MAX_CHARACTERS }) => {
    const normalizedMaxCharacters = Math.max(Math.trunc(maxCharacters), 1000);
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

    const rawData = await response.json();
    const data = tavilyExtractResponseSchema.parse(rawData);
    const firstResult = data.results[0];
    const content = firstResult?.raw_content || "";
    const truncatedContent = content.slice(0, normalizedMaxCharacters);

    return {
      url,
      title: firstResult?.title ?? null,
      content: truncatedContent,
      contentLength: content.length,
      truncated: content.length > normalizedMaxCharacters,
    };
  },
  {
    name: "tavilyExtract",
    description:
      "Extract webpage content from a given URL and return normalized page text.",
    schema: z.object({
      url: z.url().describe("The URL of the webpage to extract content from"),
      maxCharacters: z
        .number()
        .int()
        .min(1000)
        .optional()
        .describe(
          "Maximum number of characters to return from the extracted body text.",
        ),
    }),
  },
);
