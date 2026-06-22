/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useState, useEffect, useRef } from "react";
import { ResearchSession } from "@/app/schemas/session";
import { useSessionService } from "@/app/hooks/sessionService";
import { Gap } from "@/graph/state";
import { GapList } from "../gap/GapList";
import { MarkdownViewer } from "../markdown/MarkdownViewer";
import styles from "./SessionWorkspace.module.css";

interface SessionWorkspaceProps {
  currentSession: ResearchSession | null;
  service: ReturnType<typeof useSessionService>;
}

export function SessionWorkspace({ currentSession, service }: SessionWorkspaceProps) {
  const { resumeSession, deleteSession } = service;

  // HITL人机审核的局部状态暂存
  const [localGaps, setLocalGaps] = useState<Gap[]>([]);
  const [extraRounds, setExtraRounds] = useState<number>(1);
  const [isResuming, setIsResuming] = useState(false);

  // 终端日志自动滚底的 Ref
  const logEndRef = useRef<HTMLDivElement>(null);

  // 每次触发 Interrupted 审核时，同步最新的 gaps
  useEffect(() => {
    if (currentSession?.reveiwRequest?.gaps) {
      setLocalGaps([...currentSession.reveiwRequest.gaps]);
    }
  }, [currentSession?.reveiwRequest]);

  // 日志自动滚动探针
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession?.logs]);

  // 1. 无会话激活时的 Welcome Splash
  if (!currentSession) {
    return (
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeSplash}>
          <div className={styles.auroraIcon}>✦</div>
          <h1>Nekira Research Agent</h1>
          <p>请在左侧侧边栏中选择一个已有课题，或发起一个新的深度智能调研。</p>
          <div className={styles.pipelinePreview}>
            <span>Plan 计划</span> ➔ <span>Search 检索</span> ➔ <span>Read 阅读</span> ➔ <span>Reflect 反思</span> ➔ <span>Report 产出</span>
          </div>
        </div>
      </div>
    );
  }

  // 恢复流运行的核心处理
  const handleResume = async (action: "replan" | "report") => {
    if (isResuming) return;
    try {
      setIsResuming(true);
      await resumeSession(currentSession.id, {
        action,
        editedGaps: localGaps,
        extraRounds: action === "replan" ? extraRounds : undefined,
      });
    }
    catch (err) {
      console.error("[Workspace] 恢复会话执行失败:", err);
    }
    finally {
      setIsResuming(false);
    }
  };

  // 2. 顶层进度条：可视化的 Step 状态栏
  const steps = ["plan", "search", "read", "reflect", "report"] as const;
  const renderStepTracker = () => {
    return (
      <div className={styles.stepTracker}>
        {steps.map((step, idx) => {
          const isNodeActive = currentSession.activeNode?.toLowerCase().includes(step);
          const isPast = currentSession.status === "Completed";

          return (
            <React.Fragment key={step}>
              <div className={`${styles.stepNode} ${isNodeActive ? styles.stepActive : ""} ${isPast ? styles.stepPast : ""}`}>
                <div className={styles.stepCircle}>{idx + 1}</div>
                <span className={styles.stepLabel}>{step.toUpperCase()}</span>
                {isNodeActive && <div className={styles.activeDot} />}
              </div>
              {idx < steps.length - 1 && (
                <div className={`${styles.stepConnector} ${isPast ? styles.connectorPast : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.workspace}>
      {/* 顶部标题 & 核心控制器 */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <h1>{currentSession.name}</h1>
            <span className={`${styles.statusLabel} ${styles[`status_${currentSession.status}`]}`}>
              {currentSession.status.toUpperCase()}
            </span>
          </div>
          <p className={styles.topicSub}>原始调研课题: {currentSession.topic}</p>
        </div>

        {/* 只有在运行中才展示“中止运行”熔断控制按钮 */}
        {currentSession.status === "Running" && (
          <button
            className={styles.abortBtn}
            onClick={() => deleteSession(currentSession.id)}
            title="中止当前的 LangGraph 执行流"
          >
            ✕ 中止调研
          </button>
        )}
      </header>

      {/* 顶部步骤条 */}
      <section className={styles.trackerWrapper}>
        {renderStepTracker()}
      </section>

      {/* 主视图区域：自适应渲染 */}
      <div className={styles.mainContent}>
        {currentSession.status === "Running" && (
          <div className={styles.runningPanel}>
            <div className={styles.runningLoader}>
              <div className={styles.loaderPulse} />
              <h3>智能体正在执行深度检索与分析...</h3>
              <p>当前活跃执行节点: <span className={styles.nodeHighlight}>{currentSession.activeNode || "待命"}</span></p>
            </div>
          </div>
        )}

        {currentSession.status === "Interrupted" && (
          <div className={styles.hitlPanel}>
            <div className={styles.hitlAlert}>
              <span className={styles.alertIcon}>⚡️</span>
              <div className={styles.alertText}>
                <h3>LangGraph 进入反思节点：等待人工评审</h3>
                <p>
                  智能体目前已完成了第 <strong>{currentSession.reveiwRequest?.round || 1}</strong> 轮调研。
                  在反思阶段，AI 提取出了以下 <strong>知识缺口（Gaps）</strong>。您可以通过双击修改，并指导下一步去向。
                </p>
              </div>
            </div>

            {/* Gaps 缺口列表交互 */}
            <div className={styles.gapsSection}>
              <h4 className={styles.sectionTitle}>审阅并修改知识缺口 (Review Research Gaps)</h4>
              <GapList gaps={localGaps} onChange={setLocalGaps} />
            </div>

            {/* 控制表单行动 */}
            <div className={styles.actionForm}>
              <div className={styles.roundsController}>
                <label>授权追加最大轮次：</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={extraRounds}
                  className={styles.roundsInput}
                  onChange={(e) => setExtraRounds(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span className={styles.roundsHint}>当前轮数预算不足时，批准 Replan 将自动追加此额外轮次上限。</span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={`${styles.formBtn} ${styles.btnReplan}`}
                  disabled={isResuming}
                  onClick={() => handleResume("replan")}
                >
                  {isResuming ? "正在推进..." : "✓ 批准并继续深入调研 (Approve & Replan)"}
                </button>
                <button
                  className={`${styles.formBtn} ${styles.btnReport}`}
                  disabled={isResuming}
                  onClick={() => handleResume("report")}
                >
                  {isResuming ? "正在生成..." : "✉ 终止并直接产出报告 (Generate Report)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentSession.status === "Completed" && (
          <article className={styles.reportPanel}>
            <div className={styles.reportHeader}>
              <span className={styles.reportIcon}>✦</span>
              <h3>调研产出：最终研究报告</h3>
              <button
                className={styles.copyBtn}
                onClick={() => {
                  navigator.clipboard.writeText(currentSession.finalReport);
                  alert("最终 Markdown 报告已成功复制到剪贴板！");
                }}
              >
                📋 复制 Markdown
              </button>
            </div>
            <div className={styles.reportContent}>
              <MarkdownViewer content={currentSession.finalReport} />
            </div>
          </article>
        )}

        {(currentSession.status === "Idle" || currentSession.status === "Failed" || currentSession.status === "Aborted") && (
          <div className={styles.fallbackPanel}>
            {currentSession.status === "Idle" && (
              <div className={styles.idleSplash}>
                <div className={styles.idleIcon}>☄</div>
                <h3>会话处于初始就绪状态</h3>
                <p>点击左侧列表的“输入并回车”开始启动 LangGraph 执行流。</p>
              </div>
            )}
            {currentSession.status === "Failed" && (
              <div className={`${styles.idleSplash} ${styles.failedSplash}`}>
                <div className={styles.failedIcon}>⚠</div>
                <h3>很抱歉，智能体执行流异常中断</h3>
                <p>底层图节点在调用 LLM 或运行代码时发生未知错误。详情请查看下方运行日志。</p>
              </div>
            )}
            {currentSession.status === "Aborted" && (
              <div className={`${styles.idleSplash} ${styles.abortedSplash}`}>
                <div className={styles.abortedIcon}>✕</div>
                <h3>调研流程已被用户中止</h3>
                <p>该流程已安全挂起并掐断了底层网络和 Token 消耗。您可以随时重新开始。</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部折叠/平铺运行终端日志 */}
      <footer className={styles.logsFooter}>
        <div className={styles.logsHeader}>
          <div className={styles.logsIndicator}>
            <span className={styles.greenTerminalDot} />
            <span>实时运行控制台日志 (Live Execution Logs)</span>
          </div>
          <span className={styles.logCount}>{currentSession.logs.length} Lines</span>
        </div>
        <div className={styles.logsConsole}>
          {currentSession.logs.length === 0 ? (
            <div className={styles.noLogs}>控制台暂无输出。图启动运行后，流式日志将在这里实时打印。</div>
          ) : (
            currentSession.logs.map((log, i) => (
              <div key={i} className={styles.logLine}>
                <span className={styles.lineNumber}>{(i + 1).toString().padStart(3, "0")}</span>
                <span className={styles.logText}>{log}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </footer>
    </div>
  );
}
