import type { LocalLearnerContext } from './types';
import rolesSeed from '../data/seed/roles.json';
import skillsSeed from '../data/seed/skills.json';

export class CareerMatcherLocal {
  name = 'Career Matcher';

  execute(context: LocalLearnerContext): LocalLearnerContext {
    const roles = (rolesSeed as unknown) as Array<{
      role_id: string;
      title: string;
      department: string;
      description: string;
      required_skills: Record<string, number>;
    }>;
    const skillsMap = new Map((skillsSeed as Array<{ skill_id: string; name: string }>).map(s => [s.skill_id, s.name]));

    const targetRoleClean = context.target_role.toLowerCase().trim().replace(/\s+/g, '-');
    let matchedRole = roles.find(
      r => r.role_id === targetRoleClean || r.title.toLowerCase() === context.target_role.toLowerCase()
    );

    if (!matchedRole && roles.length > 0) {
      matchedRole = roles[0]; // Default to Full Stack Developer
    }

    // Compute match scores for all roles to find top 3
    const roleScores: Array<{ role_id: string; title: string; match_pct: number }> = [];

    for (const r of roles) {
      const reqs = r.required_skills;
      const totalReq = Object.keys(reqs).length;
      if (totalReq === 0) continue;

      let scoreSum = 0.0;
      for (const [skillId, reqLvl] of Object.entries(reqs)) {
        const curLvl = context.verified_skills[skillId] ?? context.current_skills[skillId] ?? 0;
        if (curLvl >= reqLvl) {
          scoreSum += 1.0;
        } else if (curLvl > 0) {
          scoreSum += curLvl / reqLvl;
        }
      }

      const pct = Math.round((scoreSum / totalReq) * 1000) / 10;
      roleScores.push({
        role_id: r.role_id,
        title: r.title,
        match_pct: pct,
      });
    }

    roleScores.sort((a, b) => b.match_pct - a.match_pct);
    const topRoles = roleScores.slice(0, 3);

    // Detailed breakdown for target role
    const targetReqs = matchedRole ? matchedRole.required_skills : {};
    const matchedSkillsList: any[] = [];
    const missingSkillsList: string[] = [];
    const partialSkillsList: string[] = [];

    const totalReq = Object.keys(targetReqs).length;
    let totalScore = 0.0;

    for (const [skillId, reqLvl] of Object.entries(targetReqs)) {
      const curLvl = context.verified_skills[skillId] ?? context.current_skills[skillId] ?? 0;
      const name = skillsMap.get(skillId) || skillId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const gap = Math.max(0, reqLvl - curLvl);

      let status: 'matched' | 'partial' | 'missing' = 'missing';
      if (curLvl >= reqLvl) {
        status = 'matched';
        totalScore += 1.0;
      } else if (curLvl > 0) {
        status = 'partial';
        totalScore += curLvl / reqLvl;
        partialSkillsList.push(name);
      } else {
        status = 'missing';
        missingSkillsList.push(name);
      }

      matchedSkillsList.push({
        skill_id: skillId,
        name,
        current_level: curLvl,
        required_level: reqLvl,
        status,
        level_gap: gap,
      });
    }

    const targetPct = Math.round((totalScore / Math.max(totalReq, 1)) * 1000) / 10;

    context.match_report = {
      role_id: matchedRole?.role_id || 'custom-role',
      role_title: matchedRole?.title || context.target_role,
      match_percentage: targetPct,
      matched_skills: matchedSkillsList,
      missing_skills: missingSkillsList,
      partial_skills: partialSkillsList,
      top_recommended_roles: topRoles,
    };

    return context;
  }
}
