/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Handlebars from "handlebars";
import { AnyPromptMap, PromptInput } from "@/prompts/promptDef";

export class PromptRegistry<T extends AnyPromptMap> {
  private prompts: T;
  private compiled = new Map<keyof T, HandlebarsTemplateDelegate>();
  private partials: Map<string, string> = new Map();

  constructor(prompts: T) {
    this.prompts = prompts;
    for (const [id, def] of Object.entries(prompts) as [keyof T, T[keyof T]][]) {
      this.compiled.set(id, Handlebars.compile(def.template));
    }
  }

  // 注册可复用字段
  registerPartial(name: string, template: string): void {
    this.partials.set(name, template);
    Handlebars.registerPartial(name, template);
  }

  getPrompt<K extends keyof T>(id: K): T[K] {
    const prompt = this.prompts[id];
    if (!prompt) {
      throw new Error(`Prompt with id "${String(id)}" not found in registry.`);
    }
    return prompt;
  }

  renderPrompt<K extends keyof T>(id: K, input: PromptInput<T[K]>) {
    const prompt = this.getPrompt(id);
    const parsed = prompt.inputSchema.parse(input);

    const delegate = this.compiled.get(id);
    if (!delegate) {
      throw new Error(`Compiled template for prompt "${String(id)}" not found.`);
    }

    return delegate(parsed).trim();
  }

  validateInput<K extends keyof T>(id: K, input: PromptInput<T[K]>) {
    const def = this.getPrompt(id);
    return def.inputSchema.safeParse(input);
  }
}
