import { LocalLearnerContext, LocalAgentTrace } from './types';
import { ProfileAnalystLocal } from './profileAnalyst';
import { CareerMatcherLocal } from './careerMatcher';
import { SkillGapLocal } from './skillGap';
import { CurriculumPlannerLocal } from './curriculumPlanner';
import { ResourceRecommenderLocal } from './resourceRecommender';
import { ProgressEvaluatorLocal } from './progressEvaluator';
import { MentorLocal } from './mentorLocal';

export class OrchestratorLocal {
  profileAnalyst = new ProfileAnalystLocal();
  careerMatcher = new CareerMatcherLocal();
  skillGap = new SkillGapLocal();
  curriculumPlanner = new CurriculumPlannerLocal();
  resourceRecommender = new ResourceRecommenderLocal();
  progressEvaluator = new ProgressEvaluatorLocal();
  mentor = new MentorLocal();

  getExecutionPlan(event: string) {
    if (event === 'GOAL_CHANGED') {
      return [
        this.careerMatcher,
        this.skillGap,
        this.curriculumPlanner,
        this.resourceRecommender,
        this.progressEvaluator,
        this.mentor
      ];
    } else if (event === 'ASSESSMENT_POOR' || event === 'ASSESSMENT_STRONG') {
      return [
        this.progressEvaluator,
        this.skillGap,
        this.curriculumPlanner,
        this.resourceRecommender,
        this.mentor
      ];
    } else if (event === 'PROGRESS_STALLED') {
      return [
        this.progressEvaluator,
        this.curriculumPlanner,
        this.mentor
      ];
    } else {
      // INITIAL or full regeneration
      return [
        this.profileAnalyst,
        this.careerMatcher,
        this.skillGap,
        this.curriculumPlanner,
        this.resourceRecommender,
        this.progressEvaluator,
        this.mentor
      ];
    }
  }

  generateVersionDiff(
    oldVersion: number,
    newVersion: number,
    triggerEvent: string,
    targetRole: string,
    roadmapData: any,
    preservedCount: number
  ): string {
    const phases = roadmapData?.phases || [];
    const remedial = phases.filter((p: any) => p.is_remedial);

    const lines = [
      `### Roadmap Evolution: Version ${oldVersion} -> Version ${newVersion}`,
      `- **Trigger Event:** \`${triggerEvent}\``,
      `- **Target Benchmark:** \`${targetRole}\``,
      `- **Total Phases:** ${phases.length} phases (${roadmapData?.total_estimated_hours || 0} total hours)`
    ];

    if (triggerEvent === 'ASSESSMENT_POOR') {
      lines.push(
        `- **Adaptive Action [ASSESSMENT_POOR]:** Injected dedicated **${remedial[0]?.title || 'Remedial Phase'}** with foundational interactive drills before resuming progression.`
      );
    } else if (triggerEvent === 'GOAL_CHANGED') {
      lines.push(
        `- **Adaptive Action [GOAL_CHANGED]:** Re-anchored milestones to ${targetRole}. Preserved ${preservedCount} previously completed items.`
      );
    } else if (triggerEvent === 'ASSESSMENT_STRONG') {
      lines.push(
        '- **Adaptive Action [ASSESSMENT_STRONG]:** Validated advanced mastery. Compressed introductory modules and advanced timeline.'
      );
    } else if (triggerEvent === 'PROGRESS_STALLED') {
      lines.push(
        '- **Adaptive Action [PROGRESS_STALLED]:** Modulated weekly hour commitments into bite-sized momentum milestones.'
      );
    } else {
      lines.push(
        '- **Initial Architecture:** Synthesized personalized roadmap through multi-agent collaboration.'
      );
    }

    return lines.join('\n');
  }

  async run(
    context: LocalLearnerContext,
    currentVersionNumber: number = 1,
    existingCompletedTitles: Set<string> = new Set()
  ): Promise<{
    context: LocalLearnerContext;
    traces: LocalAgentTrace[];
    versionDiff: string;
    newVersionNumber: number;
  }> {
    context.runtime_mode = 'Offline · Local';
    const pipeline = this.getExecutionPlan(context.trigger_event);
    const agentNames = pipeline.map(a => a.name);

    const traces: LocalAgentTrace[] = [];

    // Orchestrator start trace
    traces.push({
      event_name: context.trigger_event,
      agent_name: 'Orchestrator',
      input_summary: `Event: ${context.trigger_event}, Target Role: ${context.target_role}`,
      output_summary: `Execution Plan: ${agentNames.join(' -> ')}`,
      duration_ms: 1,
      used_llm: false,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      runtime_mode: 'Offline · Local'
    });

    // Execute pipeline
    for (const agent of pipeline) {
      const res = await (agent as any).execute(context);
      if (res && res.context) {
        context = res.context;
        if (res.trace) traces.push(res.trace);
      } else if (res) {
        context = res;
        traces.push({
          event_name: context.trigger_event,
          agent_name: (agent as any).name || 'Agent',
          input_summary: `Processed for ${context.target_role}`,
          output_summary: 'Completed execution step',
          duration_ms: 2,
          used_llm: false,
          status: 'SUCCESS',
          created_at: new Date().toISOString(),
          runtime_mode: 'Offline · Local'
        });
      }
    }

    const newVersionNumber = currentVersionNumber + 1;
    const diff = this.generateVersionDiff(
      currentVersionNumber,
      newVersionNumber,
      context.trigger_event,
      context.target_role,
      context.roadmap,
      existingCompletedTitles.size
    );

    context.metadata = context.metadata || {};
    context.metadata['active_roadmap_version'] = newVersionNumber;
    context.metadata['roadmap_diff'] = diff;

    // Preserve completed items in the new roadmap
    if (context.roadmap?.phases) {
      for (const phase of context.roadmap.phases) {
        if (phase.items) {
          for (const item of phase.items) {
            if (existingCompletedTitles.has(item.title.toLowerCase())) {
              item.is_completed = true;
              item.completed_at = new Date().toISOString();
            }
          }
        }
      }
    }

    return {
      context,
      traces,
      versionDiff: diff,
      newVersionNumber
    };
  }
}
