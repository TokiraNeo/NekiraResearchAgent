/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { openUrl } from "@tauri-apps/plugin-opener";
import styles from "./MarkdownViewer.module.css";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const handleCopyBlock = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockId(id);
    setTimeout(() => setCopiedBlockId(null), 1500);
  };

  // 自定义 HTML 标签组件重定义
  const customComponents = {
    // 1. 链接安全拦截：Tauri 原生调用外部系统默认浏览器
    a: ({ href, children }: any) => {
      const handleLinkClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (href) {
          try {
            await openUrl(href);
          } catch (err) {
            console.error("[MarkdownViewer] 无法打开外部系统浏览器链接:", err);
          }
        }
      };
      return (
        <a href={href} onClick={handleLinkClick} className={styles.mdLink} title={`在浏览器中打开: ${href}`}>
          {children} <span className={styles.linkArrow}>↗</span>
        </a>
      );
    },

    // 2. 标题排版
    h1: ({ children }: any) => <h1 className={styles.mdH1}>{children}</h1>,
    h2: ({ children }: any) => <h2 className={styles.mdH2}>{children}</h2>,
    h3: ({ children }: any) => <h3 className={styles.mdH3}>{children}</h3>,
    h4: ({ children }: any) => <h4 className={styles.mdH4}>{children}</h4>,

    // 3. 段落与分隔线
    p: ({ children }: any) => <p className={styles.mdP}>{children}</p>,
    hr: () => <hr className={styles.mdHr} />,

    // 4. 列表与引用
    ul: ({ children }: any) => <ul className={styles.mdUl}>{children}</ul>,
    ol: ({ children }: any) => <ol className={styles.mdOl}>{children}</ol>,
    li: ({ children }: any) => <li className={styles.mdLi}>{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className={styles.mdBlockquote}>{children}</blockquote>
    ),

    // 5. 表格支持（remark-gfm）
    table: ({ children }: any) => (
      <div className={styles.tableWrapper}>
        <table className={styles.mdTable}>{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className={styles.mdThead}>{children}</thead>,
    tbody: ({ children }: any) => <tbody className={styles.mdTbody}>{children}</tbody>,
    tr: ({ children }: any) => <tr className={styles.mdTr}>{children}</tr>,
    th: ({ children }: any) => <th className={styles.mdTh}>{children}</th>,
    td: ({ children }: any) => <td className={styles.mdTd}>{children}</td>,

    // 6. 代码块与内联代码
    code: ({ inline, children, ...props }: any) => {
      // 单行内联代码
      if (inline) {
        return (
          <code className={styles.inlineCode} {...props}>
            {children}
          </code>
        );
      }

      // 多行代码块只保留 <code> 本体，由 pre 组件负责外层结构，避免非法嵌套
      return (
        <code className={styles.blockCode} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => {
      const child = Array.isArray(children) ? children[0] : children;
      const codeString = String(child?.props?.children ?? "").replace(/\n$/, "");
      const language = String(child?.props?.className ?? "").replace("language-", "");
      const blockId = React.useId();

      return (
        <div className={styles.codeBlockWrapper}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLang}>{language ? language.toUpperCase() : "CODE"}</span>
            <button
              className={styles.copyCodeBtn}
              onClick={() => handleCopyBlock(codeString, blockId)}
            >
              {copiedBlockId === blockId ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
          <pre className={styles.mdPre}>
            {children}
          </pre>
        </div>
      );
    },
  };

  return (
    <div className={`${styles.markdownBody} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
