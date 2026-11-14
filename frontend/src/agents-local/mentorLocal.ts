import { LocalLearnerContext, LocalAgentTrace } from './types';
import topicNotesData from '../data/seed/topicNotes.json';

export class MentorLocal {
  name = 'Vyntrixa Mentor';

  summarizeInput(context: LocalLearnerContext): string {
    return `Event: ${context.trigger_event}. Target: ${context.target_role}. Readiness: ${context.metadata?.readiness || 0}%`;
  }

  summarizeOutput(context: LocalLearnerContext): string {
    const msg = context.mentor_message || '';
    const snippet = msg.length > 80 ? msg.slice(0, 80) + '...' : msg;
    return `Guidance message dispatched: '${snippet}'`;
  }

  async execute(context: LocalLearnerContext): Promise<{ context: LocalLearnerContext; trace: LocalAgentTrace }> {
    const startTime = Date.now();
    const inputSummary = this.summarizeInput(context);

    const event = context.trigger_event;
    const role = context.target_role;
    const name = context.full_name || 'Learner';

    let msg = '';
    let action = '';
    let nudges: string[] = [];

    if (event === 'GOAL_CHANGED') {
      msg = `Welcome to your updated career roadmap towards **${role}**! I've re-aligned your learning path. The great news is that your completed foundation skills are fully preserved. We have focused your upcoming phases on closing the specific deltas needed for ${role}.`;
      action = `Review your new Phase 1 milestones tailored for ${role}.`;
      nudges = [
        `Check the Career Match tab to inspect the exact requirements for ${role}.`,
        'Begin with the newly added interactive tutorials in your Roadmap.'
      ];
    } else if (event === 'ASSESSMENT_POOR') {
      const score = context.assessment_result?.score_pct ?? 40;
      const skill = (context.assessment_result?.skill_id || 'JavaScript').toUpperCase();
      const weak = context.assessment_result?.weak_topics || [];
      const weakStr = weak.length > 0 ? ` Particularly around ${weak.slice(0, 2).join(', ')}.` : '';
      msg = `You scored **${Math.round(score)}%** on your ${skill} assessment. Remember: every senior engineer has stumbled on these exact concepts${weakStr}! I have automatically adapted your roadmap by inserting a dedicated **Remedial Phase** with beginner-friendly interactive exercises to lock in your mental models before tackling advanced topics.`;
      action = `Dive into the Remedial Phase resources for ${skill} to master the underlying mechanics.`;
      nudges = [
        'Work through the bite-sized interactive drills before retrying the assessment.',
        'Take 10 minutes to test code in your browser console to verify your understanding.'
      ];
    } else if (event === 'ASSESSMENT_STRONG') {
      const score = context.assessment_result?.score_pct ?? 90;
      const skill = (context.assessment_result?.skill_id || 'Core Skills').toUpperCase();
      msg = `Fantastic performance! You achieved **${Math.round(score)}%** on ${skill}, demonstrating solid verified mastery! I've accelerated your roadmap by marking redundant introductory content as verified and advancing you directly to higher-impact projects.`;
      action = 'Jump straight to real-world integration projects.';
      nudges = [
        'Your verified readiness score just increased!',
        'Try tackling hands-on projects to cement this competency.'
      ];
    } else if (event === 'PROGRESS_STALLED') {
      msg = `Hey ${name}, I noticed you haven't logged study activity recently. Consistency beats intensity every time! I've lightened your weekly load so you can build momentum with small 15-minute daily wins.`;
      action = 'Complete just one 10-minute documentation overview today.';
      nudges = [
        'Pick one short tutorial to keep your learning streak alive.',
        'Feel free to ask me any questions if you feel stuck on a difficult concept!'
      ];
    } else {
      msg = `Hello ${name}! I am your Vyntrixa Mentor. I have synthesized your skill profile against the **${role}** benchmark and generated a custom adaptive roadmap. I'm here 24/7 to clarify complex topics, review code, and adapt your path as you progress.`;
      action = 'Explore your personalized roadmap and start your first recommended resource!';
      nudges = [
        'Take a skill assessment whenever you want to test and verify your proficiency.',
        'You can change your target role anytime — I will automatically adapt your roadmap.'
      ];
    }

    context.mentor_message = msg;
    context.metadata['mentor_nudges'] = nudges;
    context.metadata['mentor_action'] = action;

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

  chat(
    userMessage: string,
    context: LocalLearnerContext
  ): { reply: string; canAnswerLocally: boolean; queuedForSync: boolean } {
    const text = userMessage.toLowerCase().trim();
    const notes = topicNotesData as Record<string, any>;

    // 1. Intent: "What next" / "Next step"
    if (text.includes('next') || text.includes('what should i do') || text.includes('what to do')) {
      const activePhase = context.roadmap?.phases?.[0];
      const pendingItem = activePhase?.items?.find((i: any) => !i.is_completed);
      const title = pendingItem ? `**${pendingItem.title}** (${pendingItem.estimated_hours}h)` : 'your active roadmap phase';
      return {
        reply: `Based on your current roadmap for **${context.target_role}**, your highest-priority next step is: ${title}. Work through this module, take practical notes, and mark it complete when finished!`,
        canAnswerLocally: true,
        queuedForSync: false
      };
    }

    // 2. Intent: "Why did my roadmap change" / Remedial
    if (text.includes('why') && (text.includes('change') || text.includes('roadmap') || text.includes('remedial') || text.includes('adapt'))) {
      const diff = context.metadata?.roadmap_diff || 'Your roadmap adapts automatically whenever you change goals or complete assessments.';
      return {
        reply: `### Why Your Roadmap Adapted:\n${diff}\n\nThe local orchestrator detected an assessment or goal trigger and re-aligned your milestones to optimize your learning velocity!`,
        canAnswerLocally: true,
        queuedForSync: false
      };
    }

    // 3. Intent: "Motivation" / "Stuck"
    if (text.includes('motivation') || text.includes('stuck') || text.includes('hard') || text.includes('discouraged') || text.includes('give up')) {
      return {
        reply: `Every experienced software engineer has felt stuck or overwhelmed by complex topics. Growth happens right at the boundary of comfort! Break down your current challenge into smaller 15-minute sub-problems. You're already making tangible progress toward **${context.target_role}**!`,
        canAnswerLocally: true,
        queuedForSync: false
      };
    }

    // 4. Intent: "Progress summary" / "How am I doing"
    if (text.includes('progress') || text.includes('summary') || text.includes('how am i doing') || text.includes('readiness')) {
      const readiness = context.metadata?.readiness || 0;
      const completed = context.completed_item_ids?.length || 0;
      return {
        reply: `### Current Learning Progress:\n- **Target Career:** ${context.target_role}\n- **Overall Role Readiness:** ${readiness.toFixed(1)}%\n- **Completed Roadmap Milestones:** ${completed} items\n- **Status:** ${context.evaluator_insight?.status_flag || 'ON_TRACK'}\n\nKeep maintaining your weekly cadence!`,
        canAnswerLocally: true,
        queuedForSync: false
      };
    }

    // 5. Intent: Explain topic / skill notes
    for (const [key, note] of Object.entries(notes)) {
      if (text.includes(key)) {
        const concepts = note.key_concepts?.map((c: string) => `- ${c}`).join('\n') || '';
        const reply = `### ${note.title}\n\n${note.summary}\n\n**Core Mental Models:**\n${concepts}\n\n**Common Pitfall:** ${note.common_pitfalls}`;
        return {
          reply,
          canAnswerLocally: true,
          queuedForSync: false
        };
      }
    }

    // 6. Deep question that cannot be answered locally
    return {
      reply: "I'm offline — I can help with your roadmap and next steps now, and answer deeper questions once you're back online.",
      canAnswerLocally: false,
      queuedForSync: true
    };
  }
}
