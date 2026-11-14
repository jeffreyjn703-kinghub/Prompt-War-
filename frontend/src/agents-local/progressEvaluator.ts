import { LocalLearnerContext, LocalAgentTrace } from './types';
import rolesData from '../data/seed/roles.json';

export class ProgressEvaluatorLocal {
  name = 'Progress Evaluator';

  summarizeInput(context: LocalLearnerContext): string {
    return `Event: ${context.trigger_event}. Target: ${context.target_role}. Completed items: ${context.completed_item_ids?.length || 0}`;
  }

  summarizeOutput(context: LocalLearnerContext): string {
    const ins = context.evaluator_insight || {};
    const flag = ins.status_flag || 'ON_TRACK';
    const readiness = ins.readiness_percentage || 0;
    return `Readiness: ${readiness.toFixed(1)}%. Status: ${flag}. Action: ${ins.trigger_action || 'NONE'}`;
  }

  async execute(context: LocalLearnerContext): Promise<{ context: LocalLearnerContext; trace: LocalAgentTrace }> {
    const startTime = Date.now();
    const inputSummary = this.summarizeInput(context);

    // 1. Fetch target role requirements
    const targetClean = context.target_role.toLowerCase().trim().replace(/ /g, '-');
    const role = (rolesData as any[]).find(
      r => r.role_id === targetClean || r.title.toLowerCase() === context.target_role.toLowerCase()
    );

    const reqs: Record<string, number> = role?.required_skills || {};
    const totalReqPoints = Object.values(reqs).reduce((a, b) => a + b, 0) || 1;
    let earnedPoints = 0.0;

    for (const [skillId, targetLvl] of Object.entries(reqs)) {
      const verifiedLvl = context.verified_skills?.[skillId];
      const selfLvl = context.current_skills?.[skillId] || 0;

      if (verifiedLvl !== undefined && verifiedLvl !== null) {
        earnedPoints += Math.min(verifiedLvl, targetLvl);
      } else {
        earnedPoints += Math.min(selfLvl, targetLvl) * 0.85;
      }
    }

    const readinessPct = Math.round((earnedPoints / Math.max(totalReqPoints, 1)) * 1000) / 10;

    // 2. Status flag and trigger action
    let statusFlag: 'ON_TRACK' | 'STRUGGLING' | 'ADVANCING' | 'STALLED' = 'ON_TRACK';
    let triggerAction: 'NONE' | 'ASSESSMENT_POOR' | 'ASSESSMENT_STRONG' | 'PROGRESS_STALLED' = 'NONE';
    let strugglingTopics: string[] = [];
    let recommendation = 'Maintain regular study pace and continue hands-on practice.';

    if (context.trigger_event === 'ASSESSMENT_POOR') {
      statusFlag = 'STRUGGLING';
      triggerAction = 'ASSESSMENT_POOR';
      if (context.assessment_result?.weak_topics) {
        strugglingTopics = context.assessment_result.weak_topics;
      }
      recommendation = 'Insert targeted remedial phase with foundational drills before moving forward.';
    } else if (context.trigger_event === 'ASSESSMENT_STRONG') {
      statusFlag = 'ADVANCING';
      triggerAction = 'ASSESSMENT_STRONG';
      recommendation = 'Compress beginner introductory modules to accelerate roadmap completion.';
    } else if (context.trigger_event === 'PROGRESS_STALLED') {
      statusFlag = 'STALLED';
      triggerAction = 'PROGRESS_STALLED';
      recommendation = 'Modulate weekly commitments into small bite-sized momentum milestones.';
    }

    const insight = {
      status_flag: statusFlag,
      trigger_action: triggerAction,
      readiness_percentage: readinessPct,
      struggling_topics: strugglingTopics,
      recommended_adjustment: recommendation
    };

    context.evaluator_insight = insight;
    context.metadata['readiness'] = readinessPct;

    const outputSummary = this.summarizeOutput(context);
    const trace: LocalAgentTrace = {
      event_name: context.trigger_event,
      agent_name: this.name,
      input_summary: inputSummary,
      output_summary: outputSummary,
      duration_ms: Date.now() - startTime,
      used_llm: false,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      runtime_mode: context.runtime_mode || 'Offline · Local'
    };

    return { context, trace };
  }
}
