/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModelProfileLevel, modelKey, modelProfiles } from "@/agent/model/model";
import { ChatOpenAI } from "@langchain/openai";

class ModelFactory {
  private static clients: Partial<Record<ModelProfileLevel, ChatOpenAI>> = {};

  private static CreateClient(level: ModelProfileLevel): ChatOpenAI {
    const profile = modelProfiles[level];

    if (!profile) {
      throw new Error(`Model profile ${level} not found.`);
    }

    return new ChatOpenAI({
      apiKey: modelKey.apiKey,
      configuration: {
        baseURL: modelKey.baseUrl,
      },
      maxRetries: 3,
      maxConcurrency: 5,
      model: profile.model,
      temperature: profile.temperature,
      maxTokens: profile.maxTokens,
      timeout: profile.timeout,
    });
  }

  static init() {
    (Object.keys(modelProfiles) as ModelProfileLevel[]).forEach((level) => {
      if (!this.clients[level]) {
        this.clients[level] = this.CreateClient(level);
      }
    });
  }

  static getClient(level: ModelProfileLevel): ChatOpenAI {
    if (!this.clients[level]) {
      this.clients[level] = this.CreateClient(level);
    }

    return this.clients[level];
  }

  static reset() {
    this.clients = {};
  }
}

ModelFactory.init();

export const modelFactory = {
  getClient: ModelFactory.getClient.bind(ModelFactory),
  reset: ModelFactory.reset.bind(ModelFactory),
};

export default modelFactory;