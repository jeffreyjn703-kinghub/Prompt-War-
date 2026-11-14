import { db, migrateLegacyDatabase } from './db';
import { syncManager } from './syncManager';
import { agentRuntime } from '../agents-local/runtimeSelector';
import { AssessmentEvaluatorLocal } from '../agents-local/assessmentEvaluator';
import { MentorLocal } from '../agents-local/mentorLocal';
import type { LocalLearnerContext } from '../agents-local/types';

import rolesSeed from './seed/roles.json';
import skillsSeed from './seed/skills.json';
import resourcesSeed from './seed/resources.json';
import questionsSeed from './seed/questions.json';

class Repository {
  private assessmentEvaluator = new AssessmentEvaluatorLocal();
  private mentorLocal = new MentorLocal();

  /**
   * Hydrates Dexie stores from bundled seed JSONs and (if online) server bootstrap.
   */
  async hydrateDatabase(token?: string): Promise<void> {
    // 0. Perform one-time migration from legacy skillpath to vyntrixa
    await migrateLegacyDatabase();

    // 1. Populate seed catalogs if empty
    const skillCount = await db.skills.count();
    if (skillCount === 0) {
      const skillsToInsert = (skillsSeed as any[]).map((s) => ({
        skill_id: s.skill_id,
        name: s.name,
        category: s.category,
        description: s.description,
        prerequisites: s.prerequisites || [],
      }));
      await db.skills.bulkPut(skillsToInsert);
    }

    const roleCount = await db.roles.count();
    if (roleCount === 0) {
      const rolesToInsert = (rolesSeed as any[]).map((r) => ({
        role_id: r.role_id,
        title: r.title,
        department: r.department,
        description: r.description,
        required_skills: r.required_skills || {},
        total_skills_count: Object.keys(r.required_skills || {}).length,
      }));
      await db.roles.bulkPut(rolesToInsert);
    }

    const resCount = await db.resources.count();
    if (resCount === 0) {
      await db.resources.bulkPut(resourcesSeed as any[]);
    }

    const qCount = await db.questionBank.count();
    if (qCount === 0) {
      const questionsToInsert: any[] = [];
      let qId = 1;
      for (const [skillId, bank] of Object.entries(questionsSeed as Record<string, any>)) {
        if (bank.mcqs) {
          for (const m of bank.mcqs) {
            questionsToInsert.push({
              id: qId++,
              skill_id: skillId,
              question_text: m.question_text,
              question_type: 'mcq',
              options: m.options,
              correct_answer: m.correct_answer,
              explanation: m.explanation || '',
              difficulty: m.difficulty || 'intermediate',
            });
          }
        }
        if (bank.practical) {
          questionsToInsert.push({
            id: qId++,
            skill_id: skillId,
            question_text: bank.practical.question_text,
            question_type: 'practical',
            options: [],
            explanation: bank.practical.rubric || '',
            difficulty: bank.practical.difficulty || 'intermediate',
          });
        }
      }
      await db.questionBank.bulkPut(questionsToInsert);
    }

    // 2. Online Server Bootstrap (if token available and online)
    if (token && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch('/api/sync/bootstrap', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            await db.profile.put(data.profile);
          }
          if (data.active_roadmap) {
            await db.roadmaps.put(data.active_roadmap);
          }
          if (data.roadmap_history && data.roadmap_history.length > 0) {
            for (const rh of data.roadmap_history) {
              if (rh.id !== data.active_roadmap?.id) {
                await db.roadmaps.put(rh);
              }
            }
          }
          if (data.scores && data.scores.length > 0) {
            await db.scores.bulkPut(data.scores);
          }
          if (data.agent_runs && data.agent_runs.length > 0) {
            await db.agentRuns.bulkPut(data.agent_runs);
          }
          await db.meta.put({
            key: 'last_bootstrap',
            value: data.server_time,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Bootstrap fetch failed, using cached IndexedDB data:', err);
      }
    }

    // 3. Ensure Demo Learner exists locally if profile table is still empty
    const profileCount = await db.profile.count();
    if (profileCount === 0) {
      await this.seedDemoLearner();
    }
  }

  async seedDemoLearner(): Promise<void> {
    const demoProfile = {
      user_id: 1,
      email: 'demo@vyntrixa.ai',
      full_name: 'Arjun Kumar',
      education: 'B.Tech in Computer Science',
      target_role: 'Full Stack Developer',
      weekly_hours: 15,
      readiness_pct: 42.5,
      streak_days: 4,
      current_skills: {
        html: 3,
        css: 3,
        javascript: 2,
        python: 2,
        sql: 2,
        git: 3,
        react: 1,
        nodejs: 1,
      },
      verified_skills: {
        html: 3,
        css: 3,
      },
      skills: [],
      certifications: [],
      projects: [],
      updatedAt: new Date().toISOString(),
    };
    await db.profile.put(demoProfile);

    // Run initial local orchestrator to generate initial roadmap
    const context: LocalLearnerContext = {
      user_id: 1,
      full_name: demoProfile.full_name,
      education: demoProfile.education,
      target_role: demoProfile.target_role,
      weekly_hours: demoProfile.weekly_hours,
      current_skills: demoProfile.current_skills,
      verified_skills: demoProfile.verified_skills,
      completed_item_ids: [],
      trigger_event: 'INITIAL',
      metadata: { readiness: demoProfile.readiness_pct },
    };

    const runResult = await agentRuntime.runOrchestrator(context, undefined, 0, new Set());
    const initialRoadmap = {
      id: 1,
      version_number: 1,
      user_id: 1,
      target_role: demoProfile.target_role,
      trigger_event: 'INITIAL',
      reason_diff: runResult.versionDiff || 'Initial personalized roadmap created.',
      total_phases: runResult.context.roadmap?.phases?.length || 3,
      total_hours: runResult.context.roadmap?.total_estimated_hours || 40,
      is_active: true,
      phases: runResult.context.roadmap?.phases || [],
      createdAt: new Date().toISOString(),
    };
    await db.roadmaps.put(initialRoadmap);

    if (runResult.traces.length > 0) {
      await db.agentRuns.bulkAdd(runResult.traces);
    }
  }

  // --- Profile Methods ---
  async getProfile(): Promise<any> {
    let profile = await db.profile.toCollection().first();
    if (!profile) {
      await this.seedDemoLearner();
      profile = await db.profile.toCollection().first();
    }
    return profile;
  }

  async updateProfile(updates: Partial<any>): Promise<any> {
    const profile = await this.getProfile();
    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.profile.put(updated);

    // Enqueue mutation
    await syncManager.enqueue('UPDATE_PROFILE', {
      full_name: updated.full_name,
      target_role: updated.target_role,
      weekly_hours: updated.weekly_hours,
      education: updated.education,
      readiness_pct: updated.readiness_pct,
      updatedAt: updated.updatedAt,
    });

    return updated;
  }

  // --- Roadmap Methods ---
  async getRoadmap(): Promise<any> {
    // Try to get active roadmap
    let roadmap = await db.roadmaps.where('is_active').equals(1).first();
    if (!roadmap) {
      roadmap = await db.roadmaps.toCollection().first();
    }
    return roadmap;
  }

  async getRoadmapHistory(): Promise<any[]> {
    return await db.roadmaps.orderBy('version_number').reverse().toArray();
  }

  async toggleRoadmapItem(itemId: number | string, isCompleted: boolean): Promise<any> {
    const roadmap = await this.getRoadmap();
    if (!roadmap || !roadmap.phases) return null;

    let targetItem: any = null;
    const completedAt = isCompleted ? new Date().toISOString() : null;

    for (const phase of roadmap.phases) {
      if (phase.items) {
        for (const it of phase.items) {
          if (String(it.id) === String(itemId) || it.title.toLowerCase() === String(itemId).toLowerCase()) {
            it.is_completed = isCompleted;
            it.completed_at = completedAt;
            it._pending_sync = true;
            targetItem = it;
            break;
          }
        }
      }
    }

    if (targetItem) {
      await db.roadmaps.put(roadmap);

      // Enqueue to sync queue
      await syncManager.enqueue('TOGGLE_ROADMAP_ITEM', {
        id: targetItem.id,
        item_id: targetItem.id,
        title: targetItem.title,
        is_completed: isCompleted,
        completed_at: completedAt,
      });
    }

    return roadmap;
  }

  // --- Career Change & Adaptive Re-Plan ---
  async changeTargetRole(newRole: string, token?: string): Promise<{ roadmap: any; diff: string; traces: any[] }> {
    const profile = await this.getProfile();
    profile.target_role = newRole;
    profile.updatedAt = new Date().toISOString();
    await db.profile.put(profile);

    const activeRoadmap = await this.getRoadmap();
    const currentVersion = activeRoadmap?.version_number || 1;

    // Collect completed item titles to preserve
    const completedTitles = new Set<string>();
    if (activeRoadmap?.phases) {
      for (const p of activeRoadmap.phases) {
        for (const it of p.items || []) {
          if (it.is_completed) {
            completedTitles.add(it.title.toLowerCase());
          }
        }
      }
    }

    // Build LearnerContext
    const context: LocalLearnerContext = {
      user_id: profile.user_id || 1,
      full_name: profile.full_name,
      education: profile.education,
      target_role: newRole,
      weekly_hours: profile.weekly_hours || 15,
      current_skills: profile.current_skills || {},
      verified_skills: profile.verified_skills || {},
      completed_item_ids: Array.from(completedTitles),
      trigger_event: 'GOAL_CHANGED',
      metadata: { readiness: profile.readiness_pct || 0 },
    };

    const runResult = await agentRuntime.runOrchestrator(
      context,
      token,
      currentVersion,
      completedTitles
    );

    // Deactivate previous active roadmap
    if (activeRoadmap) {
      activeRoadmap.is_active = false;
      await db.roadmaps.put(activeRoadmap);
    }

    const newVersionNumber = runResult.newVersionNumber || currentVersion + 1;
    const newRoadmap = {
      id: Date.now(),
      version_number: newVersionNumber,
      user_id: profile.user_id || 1,
      target_role: newRole,
      trigger_event: 'GOAL_CHANGED',
      reason_diff: runResult.versionDiff || `Roadmap re-anchored to ${newRole}.`,
      total_phases: runResult.context.roadmap?.phases?.length || 3,
      total_hours: runResult.context.roadmap?.total_estimated_hours || 40,
      is_active: true,
      phases: runResult.context.roadmap?.phases || [],
      createdAt: new Date().toISOString(),
    };

    await db.roadmaps.put(newRoadmap);

    if (runResult.traces.length > 0) {
      await db.agentRuns.bulkAdd(runResult.traces);
    }

    // Enqueue sync items
    await syncManager.enqueue('UPDATE_PROFILE', {
      target_role: newRole,
      updatedAt: profile.updatedAt,
    });
    await syncManager.enqueue('ROADMAP_VERSION', {
      version_number: newVersionNumber,
      target_role: newRole,
      trigger_event: 'GOAL_CHANGED',
      roadmap_data: runResult.context.roadmap,
    });

    return {
      roadmap: newRoadmap,
      diff: runResult.versionDiff || '',
      traces: runResult.traces,
    };
  }

  // --- Assessments ---
  async getAssessment(skillId: string): Promise<any> {
    const questions = await db.questionBank.where('skill_id').equals(skillId).toArray();
    if (questions.length > 0) {
      return {
        skill_id: skillId,
        skill_name: skillId.toUpperCase(),
        questions: questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          difficulty: q.difficulty,
          explanation: q.explanation,
        })),
        total_questions: questions.length,
      };
    }

    // Fallback to seed bank
    const bank = (questionsSeed as Record<string, any>)[skillId];
    if (bank) {
      const mcqs = (bank.mcqs || []).map((m: any, idx: number) => ({
        id: idx + 1,
        question_text: m.question_text,
        question_type: 'mcq',
        options: m.options,
        difficulty: m.difficulty || 'intermediate',
        explanation: m.explanation || '',
      }));
      const practical = bank.practical
        ? [
            {
              id: 99,
              question_text: bank.practical.question_text,
              question_type: 'practical',
              options: [],
              difficulty: bank.practical.difficulty || 'intermediate',
              explanation: bank.practical.rubric || '',
            },
          ]
        : [];
      const allQ = [...mcqs, ...practical];
      return {
        skill_id: skillId,
        skill_name: skillId.toUpperCase(),
        questions: allQ,
        total_questions: allQ.length,
      };
    }

    return null;
  }

  async submitAssessment(
    skillId: string,
    answers: Record<number | string, number>,
    practicalText: string = '',
    token?: string
  ): Promise<{ result: any; roadmapUpdated: boolean; newRoadmap?: any; diff?: string }> {
    const profile = await this.getProfile();
    const activeRoadmap = await this.getRoadmap();
    const currentVersion = activeRoadmap?.version_number || 1;

    // Build context
    const context: LocalLearnerContext = {
      user_id: profile.user_id || 1,
      full_name: profile.full_name,
      education: profile.education,
      target_role: profile.target_role,
      weekly_hours: profile.weekly_hours || 15,
      current_skills: { ...(profile.current_skills || {}) },
      verified_skills: { ...(profile.verified_skills || {}) },
      completed_item_ids: [],
      trigger_event: 'INITIAL',
      metadata: { readiness: profile.readiness_pct || 0 },
    };

    // Grade assessment
    const result = this.assessmentEvaluator.evaluate(context, {
      skill_id: skillId,
      answers,
      practical_text: practicalText,
    });

    // Save score attempt to Dexie
    await db.scores.add({
      attempt_id: result.attempt_id,
      skill_id: result.skill_id,
      score_pct: result.score_pct,
      passed: result.passed,
      total_questions: result.total_questions,
      correct_questions: result.correct_questions,
      weak_topics: result.weak_topics,
      replan_triggered: result.trigger_action !== 'NONE',
      mentor_feedback: result.passed ? 'Skill verified locally.' : 'Review recommended.',
      createdAt: new Date().toISOString(),
      trigger_action: result.trigger_action,
    });

    // Update profile verified skills
    profile.verified_skills = {
      ...(profile.verified_skills || {}),
      [skillId.toLowerCase()]: result.new_verified_level,
    };
    await db.profile.put(profile);

    // Enqueue assessment submission mutation
    await syncManager.enqueue('SUBMIT_ASSESSMENT', {
      skill_id: result.skill_id,
      score_pct: result.score_pct,
      passed: result.passed,
      total_questions: result.total_questions,
      correct_questions: result.correct_questions,
      new_verified_level: result.new_verified_level,
      weak_topics: result.weak_topics,
      trigger_action: result.trigger_action,
    });

    let roadmapUpdated = false;
    let newRoadmap: any = null;
    let diff: string = '';

    // If trigger action is ASSESSMENT_POOR or ASSESSMENT_STRONG, run adaptive re-plan!
    if (result.trigger_action === 'ASSESSMENT_POOR' || result.trigger_action === 'ASSESSMENT_STRONG') {
      context.trigger_event = result.trigger_action;
      context.assessment_result = result;

      // Preserve completed items
      const completedTitles = new Set<string>();
      if (activeRoadmap?.phases) {
        for (const p of activeRoadmap.phases) {
          for (const it of p.items || []) {
            if (it.is_completed) {
              completedTitles.add(it.title.toLowerCase());
            }
          }
        }
      }

      const runResult = await agentRuntime.runOrchestrator(
        context,
        token,
        currentVersion,
        completedTitles
      );

      // Deactivate old version
      if (activeRoadmap) {
        activeRoadmap.is_active = false;
        await db.roadmaps.put(activeRoadmap);
      }

      const newVersionNum = runResult.newVersionNumber || currentVersion + 1;
      newRoadmap = {
        id: Date.now(),
        version_number: newVersionNum,
        user_id: profile.user_id || 1,
        target_role: profile.target_role,
        trigger_event: result.trigger_action,
        reason_diff: runResult.versionDiff || 'Adaptive re-plan applied.',
        total_phases: runResult.context.roadmap?.phases?.length || 3,
        total_hours: runResult.context.roadmap?.total_estimated_hours || 40,
        is_active: true,
        phases: runResult.context.roadmap?.phases || [],
        createdAt: new Date().toISOString(),
      };

      await db.roadmaps.put(newRoadmap);

      if (runResult.traces.length > 0) {
        await db.agentRuns.bulkAdd(runResult.traces);
      }

      await syncManager.enqueue('ROADMAP_VERSION', {
        version_number: newVersionNum,
        target_role: profile.target_role,
        trigger_event: result.trigger_action,
        roadmap_data: runResult.context.roadmap,
      });

      roadmapUpdated = true;
      diff = runResult.versionDiff || '';
    }

    return {
      result,
      roadmapUpdated,
      newRoadmap,
      diff,
    };
  }

  // --- Mentor Chat ---
  async chatMentor(userMessage: string): Promise<{
    reply: string;
    canAnswerLocally: boolean;
    queuedForSync: boolean;
  }> {
    const profile = await this.getProfile();
    const activeRoadmap = await this.getRoadmap();

    const context: LocalLearnerContext = {
      user_id: profile.user_id || 1,
      full_name: profile.full_name,
      education: profile.education,
      target_role: profile.target_role,
      weekly_hours: profile.weekly_hours || 15,
      current_skills: profile.current_skills || {},
      verified_skills: profile.verified_skills || {},
      completed_item_ids: [],
      roadmap: activeRoadmap,
      trigger_event: activeRoadmap?.trigger_event || 'INITIAL',
      metadata: {
        readiness: profile.readiness_pct || 0,
        roadmap_diff: activeRoadmap?.reason_diff,
      },
    };

    const chatResponse = this.mentorLocal.chat(userMessage, context);

    // Save message locally in IndexedDB
    await db.mentorMessages.add({
      role: 'user',
      text: userMessage,
      createdAt: new Date().toISOString(),
    });
    await db.mentorMessages.add({
      role: 'assistant',
      text: chatResponse.reply,
      createdAt: new Date().toISOString(),
      pending_sync: chatResponse.queuedForSync,
    });

    if (chatResponse.queuedForSync) {
      await syncManager.enqueue('CHAT_MESSAGE', {
        message: userMessage,
        unanswered_locally: true,
        sent_at: new Date().toISOString(),
      });
    }

    return chatResponse;
  }

  // --- Catalogs & Agent Runs ---
  async getRoles(): Promise<any[]> {
    const roles = await db.roles.toArray();
    if (roles.length > 0) return roles;
    return rolesSeed as any[];
  }

  async getSkills(category?: string, search?: string): Promise<any[]> {
    let collection = db.skills.toCollection();
    let skills = await collection.toArray();
    if (skills.length === 0) {
      skills = (skillsSeed as any[]).map((s) => ({
        skill_id: s.skill_id,
        name: s.name,
        category: s.category,
        description: s.description,
        prerequisites: s.prerequisites || [],
      }));
    }
    if (category) {
      skills = skills.filter((s) => s.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      skills = skills.filter(
        (s) => s.name.toLowerCase().includes(q) || s.skill_id.toLowerCase().includes(q)
      );
    }
    return skills;
  }

  async getResources(skillId?: string): Promise<any[]> {
    let res = await db.resources.toArray();
    if (res.length === 0) res = resourcesSeed as any[];
    if (skillId) {
      res = res.filter((r) => r.skill_id === skillId);
    }
    return res;
  }

  async getScores(): Promise<any[]> {
    return await db.scores.reverse().toArray();
  }

  async getAgentRuns(): Promise<any[]> {
    return await db.agentRuns.reverse().toArray();
  }

  // --- Storage & Diagnostics ---
  async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      return await navigator.storage.persist();
    }
    return false;
  }

  async isStoragePersisted(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
      return await navigator.storage.persisted();
    }
    return false;
  }

  async getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number; percent: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      const usageMB = Math.round(((est.usage || 0) / (1024 * 1024)) * 10) / 10;
      const quotaMB = Math.round(((est.quota || 1) / (1024 * 1024)) * 10) / 10;
      const percent = Math.min(100, Math.round((usageMB / Math.max(quotaMB, 1)) * 100));
      return { usageMB, quotaMB, percent };
    }
    return { usageMB: 1.2, quotaMB: 1024, percent: 1 };
  }

  async clearOfflineData(): Promise<void> {
    await db.profile.clear();
    await db.roadmaps.clear();
    await db.scores.clear();
    await db.agentRuns.clear();
    await db.mentorMessages.clear();
    await db.syncQueue.clear();
    await this.hydrateDatabase();
  }
}

export const repo = new Repository();
