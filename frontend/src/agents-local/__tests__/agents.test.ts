import { describe, it, expect } from 'vitest';
import { CareerMatcherLocal } from '../careerMatcher';
import { SkillGapLocal } from '../skillGap';
import { OrchestratorLocal } from '../orchestratorLocal';
import type { LocalLearnerContext } from '../types';

describe('VYNTRIXA Local Agent Suite', () => {
  it('CareerMatcherLocal should compute match percentage and return top recommendations', () => {
    const matcher = new CareerMatcherLocal();
    const context: LocalLearnerContext = {
      user_id: 1,
      full_name: 'Test Learner',
      target_role: 'Full Stack Developer',
      weekly_hours: 15,
      current_skills: {
        javascript: 3,
        react: 3,
        nodejs: 2,
        html5: 4,
        css3: 4
      },
      verified_skills: {
        javascript: 3
      },
      completed_item_ids: [],
      trigger_event: 'INITIAL',
      metadata: {}
    };

    const result = matcher.execute(context);
    expect(result.match_report).toBeDefined();
    expect(result.match_report?.match_percentage).toBeGreaterThan(0);
    expect(result.match_report?.top_recommended_roles?.length).toBeGreaterThanOrEqual(1);
  });

  it('SkillGapLocal should identify missing prerequisites and prioritize skill gaps', () => {
    const matcher = new CareerMatcherLocal();
    const gapAgent = new SkillGapLocal();
    const context: LocalLearnerContext = {
      user_id: 2,
      full_name: 'Beginner Learner',
      target_role: 'Full Stack Developer',
      weekly_hours: 10,
      current_skills: {},
      verified_skills: {},
      completed_item_ids: [],
      trigger_event: 'INITIAL',
      metadata: {}
    };

    const matchedCtx = matcher.execute(context);
    const gapCtx = gapAgent.execute(matchedCtx);

    expect(gapCtx.gap_report).toBeDefined();
    expect(gapCtx.gap_report?.prioritized_gaps.length).toBeGreaterThan(0);
    expect(gapCtx.gap_report?.total_gaps).toBeGreaterThan(0);
  });

  it('OrchestratorLocal should coordinate multiple agents and produce execution traces', async () => {
    const orchestrator = new OrchestratorLocal();
    const context: LocalLearnerContext = {
      user_id: 1,
      full_name: 'Arjun Kumar',
      target_role: 'Full Stack Developer',
      weekly_hours: 15,
      current_skills: { javascript: 3, react: 2 },
      verified_skills: { javascript: 3 },
      completed_item_ids: [],
      trigger_event: 'INITIAL',
      metadata: {}
    };

    const result = await orchestrator.run(context, 1);
    expect(result.context).toBeDefined();
    expect(result.traces.length).toBeGreaterThan(0);
    expect(result.versionDiff).toContain('Roadmap Evolution');
  });
});
