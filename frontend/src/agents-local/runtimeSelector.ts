import { LocalLearnerContext } from './types';
import { OrchestratorLocal } from './orchestratorLocal';

export type RuntimeBadge = 'Online · LLM' | 'Online · Fallback' | 'Offline · Local';

export class AgentRuntimeSelector {
  private localOrchestrator = new OrchestratorLocal();

  async isBackendReachable(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async runOrchestrator(
    context: LocalLearnerContext,
    token?: string,
    currentVersionNumber: number = 1,
    existingCompletedTitles: Set<string> = new Set()
  ): Promise<{
    context: LocalLearnerContext;
    runtimeMode: RuntimeBadge;
    traces: any[];
    versionDiff?: string;
    newVersionNumber?: number;
  }> {
    const reachable = await this.isBackendReachable();

    if (reachable && token) {
      try {
        const response = await fetch('/api/orchestrator/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            trigger_event: context.trigger_event,
            target_role: context.target_role,
            metadata: context.metadata || {}
          })
        });

        if (response.ok) {
          const data = await response.json();
          const mode: RuntimeBadge = data.used_llm ? 'Online · LLM' : 'Online · Fallback';
          return {
            context: {
              ...context,
              roadmap: data.roadmap,
              evaluator_insight: data.evaluator_insight,
              mentor_message: data.mentor_message,
              metadata: {
                ...context.metadata,
                roadmap_diff: data.roadmap_diff,
                active_roadmap_version: data.roadmap_version
              },
              runtime_mode: mode
            },
            runtimeMode: mode,
            traces: data.traces || [],
            versionDiff: data.roadmap_diff,
            newVersionNumber: data.roadmap_version
          };
        }
      } catch (e) {
        console.warn('Backend orchestrator call failed, falling back to local orchestrator:', e);
      }
    }

    // Offline or fallback to local
    context.runtime_mode = 'Offline · Local';
    const localResult = await this.localOrchestrator.run(
      context,
      currentVersionNumber,
      existingCompletedTitles
    );

    return {
      context: localResult.context,
      runtimeMode: 'Offline · Local',
      traces: localResult.traces,
      versionDiff: localResult.versionDiff,
      newVersionNumber: localResult.newVersionNumber
    };
  }
}

export const agentRuntime = new AgentRuntimeSelector();
