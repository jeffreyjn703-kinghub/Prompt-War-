import type { LocalLearnerContext } from './types';

export class CurriculumPlannerLocal {
  name = 'Curriculum Planner';

  execute(context: LocalLearnerContext): LocalLearnerContext {
    const gapReport = context.gap_report || {};
    const prioritizedGaps = gapReport.prioritized_gaps || [];
    const event = context.trigger_event;
    const weeklyHours = Math.max(context.weekly_hours, 5);

    const phases: any[] = [];
    let phaseNum = 1;
    let replanReason = '';

    // Case 1: ASSESSMENT_POOR -> Insert Remedial Phase First
    if (event === 'ASSESSMENT_POOR' && context.assessment_result) {
      const poorSkill = context.assessment_result.skill_id || 'javascript';
      const score = Math.round(context.assessment_result.score_pct || 0);
      const weakTopics = context.assessment_result.weak_topics || [];
      const topicsStr = weakTopics.length > 0 ? weakTopics.join(', ') : 'Core Fundamentals & Mental Models';

      const remedialTitle = `Remedial Phase: ${poorSkill.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} Core Mastery`;
      const remedialDesc = `Targeted reinforcement for topics scored at ${score}%: ${topicsStr}. Solidify fundamentals before resuming progression.`;
      replanReason = `Assessment score (${score}%) triggered adaptive remedial phase for ${poorSkill}.`;

      phases.push({
        phase_number: phaseNum,
        title: remedialTitle,
        description: remedialDesc,
        estimated_hours: 12,
        is_remedial: true,
        items: [],
      });
      phaseNum += 1;
    } else if (event === 'GOAL_CHANGED') {
      replanReason = `Learner pivoted target role to ${context.target_role}. Curriculum synthesized for new role competencies.`;
    } else if (event === 'ASSESSMENT_STRONG') {
      replanReason = `Verified mastery achieved (${Math.round(context.assessment_result?.score_pct || 85)}%). Curriculum accelerated to advanced project milestones.`;
    } else {
      replanReason = `Comprehensive curriculum synthesized for ${context.target_role} across foundational, framework, and capstone competencies.`;
    }

    const foundationalSkills = new Set(['html', 'css', 'javascript', 'git', 'python', 'sql', 'linux']);
    const coreSkills = new Set(['react', 'nodejs', 'express', 'fastapi', 'vue', 'tailwind', 'typescript', 'data-analysis-pandas']);

    const p1Gaps: any[] = [];
    const p2Gaps: any[] = [];
    const p3Gaps: any[] = [];

    for (const g of prioritizedGaps) {
      const sId = g.skill_id;
      if (foundationalSkills.has(sId)) {
        p1Gaps.push(g);
      } else if (coreSkills.has(sId)) {
        p2Gaps.push(g);
      } else {
        p3Gaps.push(g);
      }
    }

    // Build standard phases
    // Phase 1: Foundations
    if (p1Gaps.length > 0 || phases.length === 0) {
      const names = p1Gaps.map(g => g.name).slice(0, 3).join(', ') || 'Core Web Architecture';
      phases.push({
        phase_number: phaseNum++,
        title: `Phase ${phaseNum - 1}: Foundations & Core Primitives`,
        description: `Master fundamental syntax, environment configuration, and execution models: ${names}.`,
        estimated_hours: 14,
        is_remedial: false,
        items: [],
      });
    }

    // Phase 2: Modern Frameworks & Component Architecture
    if (p2Gaps.length > 0 || phases.length < 3) {
      const names = p2Gaps.map(g => g.name).slice(0, 3).join(', ') || 'Modern Component Systems & APIs';
      phases.push({
        phase_number: phaseNum++,
        title: `Phase ${phaseNum - 1}: Frameworks & Reactive State`,
        description: `Build reactive component systems, server communication, and state synchronization: ${names}.`,
        estimated_hours: 18,
        is_remedial: false,
        items: [],
      });
    }

    // Phase 3: Services & Data Persistence
    if (p3Gaps.length > 0 || phases.length < 4) {
      const names = p3Gaps.map(g => g.name).slice(0, 3).join(', ') || 'Backend Services, Containerization & Relational Schemas';
      phases.push({
        phase_number: phaseNum++,
        title: `Phase ${phaseNum - 1}: Services, Persistence & Security`,
        description: `Implement robust REST APIs, secure token authentication, and data integrity: ${names}.`,
        estimated_hours: 16,
        is_remedial: false,
        items: [],
      });
    }

    // Phase 4: Production Capstone & Deployment
    phases.push({
      phase_number: phaseNum++,
      title: `Phase ${phaseNum - 1}: Production Capstone & Cloud Deployment`,
      description: `Integrate end-to-end architecture with containerization, automated CI/CD pipelines, and cloud telemetry for ${context.target_role}.`,
      estimated_hours: 18,
      is_remedial: false,
      items: [],
    });

    const totalHours = phases.reduce((acc, p) => acc + (p.estimated_hours || 15), 0);
    const estimatedWeeks = Math.ceil(totalHours / weeklyHours);

    context.roadmap = {
      target_role: context.target_role,
      total_phases: phases.length,
      total_estimated_hours: totalHours,
      estimated_weeks: estimatedWeeks,
      weekly_hours_budget: weeklyHours,
      phases,
      replan_reason: replanReason,
    };

    return context;
  }
}
