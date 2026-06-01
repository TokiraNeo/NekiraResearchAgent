/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Handlebars from "handlebars";
import { PromptDefinition, PromptId } from "@/prompts/promptDef";

class PromptRegistry {
  private prompts: Map<PromptId, PromptDefinition> = new Map();
  private compiled: Map<PromptId, HandlebarsTemplateDelegate> = new Map();
  private partials: Map<string, string> = new Map();

  // 注册Prompt
  registerPrompt(def: PromptDefinition): void {
    this.prompts.set(def.id, def);
    this.compiled.set(def.id, Handlebars.compile(def.template));
  }

  // 注册可复用字段
  registerPartial(name: string, template: string): void {
    this.partials.set(name, template);
    Handlebars.registerPartial(name, template);
  }

  // 获取Prompt定义
  getPrompt(id: PromptId): PromptDefinition | undefined {
    return this.prompts.get(id);
  }

  // 获取全部Prompt定义
  getAllPrompts(): PromptDefinition[] {
    return Array.from(this.prompts.values());
  }

  // 渲染Prompt
  renderPrompt(id: PromptId, data: Record<string, any>): string {
    const delegate = this.compiled.get(id);
    if (!delegate) throw new Error(`Prompt "${id}" not registered`);

    // 注入公共变量
    const enrichData = {
      agentName: "NekiraResearchAgent",
      language: "zh-CN",
      tone: "专业、简洁、客观",
      ...data,
    }

    return delegate(enrichData).trim();
  }

  // 验证变量完整性
  validate(id: PromptId, data: Record<string, any>): string[] {
    const def = this.prompts.get(id);
    if (!def) return [`Prompt "${id}" not found`];

    return def.variables.filter(v => !(v in data)).map(v => `缺少变量: ${v}`);
  }
}

export const promptRegistry = new PromptRegistry();
