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
    const profile = modelProfiles.profiles[level];

    if (!profile) {
      throw new Error(`Model profile ${level} not found.`);
    }

    const options: any = {
      apiKey: modelKey.apiKey,
      configuration: {
        baseURL: modelKey.baseUrl,
      },
      maxRetries: 3,
      maxConcurrency: 5,
      model: profile.model,
      temperature: profile.temperature,
      timeout: profile.timeout,
    };

    // 只有在明确配置了 maxTokens 限制时，才进行传递（未设置时不传递，由 API 自动采用最大额度，防止截断）
    if (profile.maxTokens !== undefined) {
      options.maxTokens = profile.maxTokens;
    }

    return new ChatOpenAI(options);
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

export const modelFactory = {
  getClient: ModelFactory.getClient.bind(ModelFactory),
  reset: ModelFactory.reset.bind(ModelFactory),
};

export default modelFactory;
