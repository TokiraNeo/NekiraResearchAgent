/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { tool } from "@langchain/core/tools";
import * as z from "zod";

export const add = tool(
  ({ a, b }) => a + b,
  {
    name: "add",
    description: "Add two numbers together.",
    schema: z.object({
      a: z.number().describe("First Number"),
      b: z.number().describe("Second Number"),
    }),
  }
);

export const multiply = tool(
  ({ a, b }) => a * b,
  {
    name: "multiply",
    description: "Multiply two numbers together.",
    schema: z.object({
      a: z.number().describe("First Number"),
      b: z.number().describe("Second Number"),
    }),
  }
);
