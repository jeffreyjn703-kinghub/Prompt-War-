import type { LocalLearnerContext } from './types';
import skillsSeed from '../data/seed/skills.json';

export class SkillGapLocal {
  name = 'Skill Gap Agent';

  execute(context: LocalLearnerContext): LocalLearnerContext {
    const matchReport = context.match_report || {};
    const matchedSkills = matchReport.matched_skills || [];

    const allSkills = skillsSeed as Array<{
      skill_id: string;
      name: string;
      category: string;
      description: string;
      prerequisites: string[];
    }>;
    const taxMap = new Map(allSkills.map(s => [s.skill_id, s]));

    const gapItems: any[] = [];
    for (const ms of matchedSkills) {
      const gap = ms.level_gap || 0;
      if (gap > 0) {
        const skillId = ms.skill_id;
        const taxEntry = taxMap.get(skillId);
        const prereqs = taxEntry?.prerequisites || [];

        const missingPrereqs: string[] = [];
        for (const p of prereqs) {
          const pLvl = context.verified_skills[p] ?? context.current_skills[p] ?? 0;
          if (pLvl < 2) {
            missingPrereqs.push(taxMap.get(p)?.name || p);
          }
        }

        gapItems.push({
          skill_id: skillId,
          name: ms.name || skillId,
          current_level: ms.current_level || 0,
          target_level: ms.required_level || 3,
          gap_score: gap,
          prerequisites_met: missingPrereqs.length === 0,
          missing_prerequisites: missingPrereqs,
          prereq_raw: prereqs,
        });
      }
    }

    const foundations: Record<string, number> = {
      html: 100,
      css: 90,
      javascript: 80,
      git: 75,
      python: 70,
      sql: 65,
    };

    let poorSkillId: string | null = null;
    if (context.trigger_event === 'ASSESSMENT_POOR' && context.assessment_result) {
      poorSkillId = context.assessment_result.skill_id;
    }

    gapItems.sort((a, b) => {
      if (poorSkillId) {
        if (a.skill_id === poorSkillId) return -1;
        if (b.skill_id === poorSkillId) return 1;
      }

      if (a.prerequisites_met && !b.prerequisites_met) return -1;
      if (!a.prerequisites_met && b.prerequisites_met) return 1;

      const scoreA = (foundations[a.skill_id] || 0) + a.gap_score * 5;
      const scoreB = (foundations[b.skill_id] || 0) + b.gap_score * 5;
      return scoreB - scoreA;
    });

    const prioritizedGaps = gapItems.map((item, idx) => ({
      ...item,
      priority: idx + 1,
    }));

    context.gap_report = {
      total_gaps: prioritizedGaps.length,
      prioritized_gaps: prioritizedGaps,
      critical_gaps: prioritizedGaps.filter(g => g.gap_score >= 3).map(g => g.name),
      high_priority_gaps: prioritizedGaps.slice(0, 3).map(g => g.name),
    };

    return context;
  }
}
