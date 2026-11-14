import type { LocalLearnerContext } from './types';
import skillsSeed from '../data/seed/skills.json';

export class ProfileAnalystLocal {
  name = 'Profile Analyst';

  execute(context: LocalLearnerContext): LocalLearnerContext {
    const allSkills = skillsSeed as Array<{ skill_id: string; name: string; category: string; description: string; prerequisites: string[] }>;
    const taxMap = new Map(allSkills.map(s => [s.skill_id, s]));
    const nameMap = new Map(allSkills.map(s => [s.name.toLowerCase(), s.skill_id]));

    const normalizedSkills: Record<string, number> = {};
    const skillCategories: Record<string, string> = {};
    const confidenceRatings: Record<string, string> = {};

    for (const [rawName, lvl] of Object.entries(context.current_skills)) {
      const cleanName = rawName.toLowerCase().trim();
      const skillId = taxMap.has(cleanName)
        ? cleanName
        : nameMap.get(cleanName) || cleanName.replace(/[^a-z0-9]/g, '-');

      normalizedSkills[skillId] = lvl;
      const taxEntry = taxMap.get(skillId);
      skillCategories[skillId] = taxEntry?.category || 'General';

      if (context.verified_skills[skillId]) {
        confidenceRatings[skillId] = 'Verified by Assessment';
      } else {
        confidenceRatings[skillId] = 'Self-rated';
      }
    }

    const strengths: string[] = [];
    const growthAreas: string[] = [];

    for (const [sId, lvl] of Object.entries(normalizedSkills)) {
      const name = taxMap.get(sId)?.name || sId;
      if (lvl >= 3) {
        strengths.push(name);
      } else {
        growthAreas.push(name);
      }
    }

    const avgLevel = Object.values(normalizedSkills).length > 0
      ? Object.values(normalizedSkills).reduce((a, b) => a + b, 0) / Object.values(normalizedSkills).length
      : 1;

    const experienceLevel = avgLevel >= 3.5 ? 'Senior' : avgLevel >= 2.0 ? 'Mid-level' : 'Junior / Entry';

    context.metadata['normalized_profile'] = {
      normalized_skills: normalizedSkills,
      skill_categories: skillCategories,
      confidence_ratings: confidenceRatings,
      inferred_experience_level: experienceLevel,
      strengths,
      growth_areas: growthAreas,
    };

    return context;
  }
}
