/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModelProfileLevel, modelKey, modelProfiles } from "@/agent/model/model";
import { ChatOpenAI } from "@langchain/openai";

class ModelFactory {
  private static clients: Record<ModelProfileLevel, Array<ChatOpenAI>> = {};

}
