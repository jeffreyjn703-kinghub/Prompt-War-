import type { LocalLearnerContext } from './types';
import resourcesSeed from '../data/seed/resources.json';

export class ResourceRecommenderLocal {
  name = 'Resource Recommender';

  execute(context: LocalLearnerContext): LocalLearnerContext {
    const roadmap = context.roadmap || {};
    const phases = roadmap.phases || [];
    const gapReport = context.gap_report || {};
    const prioritizedGaps = gapReport.prioritized_gaps || [];

    const allResources = resourcesSeed as Array<{
      title: string;
      type: string;
      skill_id: string;
      difficulty: string;
      estimated_hours: number;
      provider: string;
      url: string;
      description: string;
    }>;

    const resBySkill: Record<string, typeof allResources> = {};
    for (const r of allResources) {
      if (!resBySkill[r.skill_id]) resBySkill[r.skill_id] = [];
      resBySkill[r.skill_id].push(r);
    }

    let globalItemId = 100;

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const items: any[] = [];

      if (phase.is_remedial) {
        let poorSkill = 'javascript';
        if (context.assessment_result && context.assessment_result.skill_id) {
          poorSkill = context.assessment_result.skill_id;
        }

        const avail = resBySkill[poorSkill] || [];
        const beginnerRes = avail.filter(r => r.difficulty === 'beginner' || r.title.toLowerCase().includes('remedial'));
        const picked = beginnerRes.length > 0 ? beginnerRes.slice(0, 3) : avail.slice(0, 3);

        let sortOrder = 1;
        for (const r of picked) {
          items.push({
            id: ++globalItemId,
            skill_id: r.skill_id,
            title: r.title,
            item_type: r.type,
            estimated_hours: r.estimated_hours,
            rationale: `Adaptive remedial reinforcement: focuses on core mental models and hands-on drills for ${poorSkill}.`,
            provider: r.provider,
            url: r.url,
            is_completed: false,
            sort_order: sortOrder++,
          });
        }
      } else {
        let targetSkills: string[] = [];
        if (i === (phases.some((p: any) => p.is_remedial) ? 1 : 0)) {
          targetSkills = ['html', 'css', 'javascript', 'git', 'python'];
        } else if (i === (phases.some((p: any) => p.is_remedial) ? 2 : 1)) {
          targetSkills = ['react', 'nodejs', 'express', 'sql', 'fastapi'];
        } else {
          targetSkills = ['rest-api', 'docker', 'auth-jwt', 'postgresql', 'testing'];
        }

        let activeGaps = prioritizedGaps
          .map((g: any) => g.skill_id)
          .filter((sId: string) => targetSkills.includes(sId));

        if (activeGaps.length === 0 && prioritizedGaps.length > 0) {
          activeGaps = prioritizedGaps.slice(0, 3).map((g: any) => g.skill_id);
        }
        if (activeGaps.length === 0) {
          activeGaps = targetSkills.slice(0, 3);
        }

        let sortOrder = 1;
        for (const sId of activeGaps.slice(0, 3)) {
          const avail = resBySkill[sId] || [];
          const picked: typeof avail = [];

          let hasProj = false;
          for (const res of avail) {
            if ((res.type === 'project' || res.type === 'exercise') && !hasProj) {
              picked.push(res);
              hasProj = true;
            } else if (res.type === 'course' || res.type === 'doc' || res.type === 'tutorial') {
              if (picked.length < 2) picked.push(res);
            }
            if (picked.length >= 2) break;
          }

          if (picked.length === 0 && avail.length > 0) {
            picked.push(avail[0]);
          }

          for (const r of picked) {
            items.push({
              id: ++globalItemId,
              skill_id: r.skill_id,
              title: r.title,
              item_type: r.type,
              estimated_hours: r.estimated_hours,
              rationale: `Curated learning milestone targeting verified benchmark for ${r.skill_id}.`,
              provider: r.provider,
              url: r.url,
              is_completed: false,
              sort_order: sortOrder++,
            });
          }
        }
      }

      phase.items = items;
      phase.id = i + 1;
    }

    context.roadmap.phases = phases;
    return context;
  }
}
