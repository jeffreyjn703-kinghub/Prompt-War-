import { z } from 'zod';

export const UserSkillSchema = z.object({
  skill_name: z.string(),
  proficiency: z.number().min(1).max(5),
  verified_level: z.number().min(1).max(5).nullable().optional(),
  confidence: z.string().default('self-rated'), // "self-rated" | "verified by assessment"
  last_assessed_at: z.string().nullable().optional(),
});
export type UserSkill = z.infer<typeof UserSkillSchema>;

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().default(''),
  issue_date: z.string().default(''),
});
export type Certification = z.infer<typeof CertificationSchema>;

export const ProjectSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  skills_used: z.string().default(''),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProfileSchema = z.object({
  user_id: z.number(),
  email: z.string().email(),
  full_name: z.string(),
  education: z.string().default(''),
  target_role: z.string().default('Full Stack Developer'),
  weekly_hours: z.number().default(10),
  readiness_pct: z.number().default(0),
  streak_days: z.number().default(1),
  skills: z.array(UserSkillSchema).optional().default([]),
  certifications: z.array(CertificationSchema).optional().default([]),
  projects: z.array(ProjectSchema).optional().default([]),
  current_skills: z.record(z.string(), z.number()).optional(),
  verified_skills: z.record(z.string(), z.number()).optional(),
  last_active_at: z.string().optional(),
  is_new_user: z.boolean().optional(),
  updated_at: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type ProfileData = z.infer<typeof ProfileSchema>;

export const RoadmapItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  skill_id: z.string(),
  title: z.string(),
  item_type: z.string().default('course'), // course, tutorial, doc, exercise, project
  estimated_hours: z.number().default(3),
  rationale: z.string().default(''),
  provider: z.string().default('freeCodeCamp'),
  url: z.string().default(''),
  is_completed: z.boolean().default(false),
  completed_at: z.string().nullable().optional(),
  sort_order: z.number().default(0),
  _pending_sync: z.boolean().optional(),
});
export type RoadmapItemData = z.infer<typeof RoadmapItemSchema>;

export const RoadmapPhaseSchema = z.object({
  id: z.union([z.number(), z.string()]),
  phase_number: z.number(),
  title: z.string(),
  description: z.string().default(''),
  estimated_hours: z.number().default(0),
  is_remedial: z.boolean().default(false),
  is_completed: z.boolean().default(false),
  items: z.array(RoadmapItemSchema).default([]),
});
export type RoadmapPhaseData = z.infer<typeof RoadmapPhaseSchema>;

export const RoadmapVersionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  version_number: z.number(),
  target_role: z.string(),
  trigger_event: z.string().default('INITIAL'),
  reason_diff: z.string().default(''),
  total_phases: z.number().default(1),
  total_hours: z.number().default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  phases: z.array(RoadmapPhaseSchema).default([]),
  user_id: z.number().optional(),
  runtime_mode: z.enum(['Online · LLM', 'Online · Fallback', 'Offline · Local']).optional(),
  client_uuid: z.string().optional(),
});
export type RoadmapVersionData = z.infer<typeof RoadmapVersionSchema>;

export const AssessmentQuestionSchema = z.object({
  id: z.number(),
  question_text: z.string(),
  question_type: z.enum(['mcq', 'practical']).default('mcq'),
  options: z.array(z.string()),
  correct_option_index: z.number().optional(),
  explanation: z.string().optional(),
  difficulty: z.string().default('intermediate'),
});
export type AssessmentQuestionData = z.infer<typeof AssessmentQuestionSchema>;

export const AssessmentResultSchema = z.object({
  id: z.number().optional(),
  attempt_id: z.number(),
  skill_id: z.string(),
  score_pct: z.number(),
  passed: z.boolean(),
  total_questions: z.number(),
  correct_questions: z.number(),
  new_verified_level: z.number().optional(),
  weak_topics: z.array(z.string()).default([]),
  trigger_action: z.string().default(''),
  replan_triggered: z.boolean().optional().default(false),
  replan_summary: z.string().optional(),
  mentor_feedback: z.string().optional().default(''),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  client_uuid: z.string().optional(),
  pending_sync: z.boolean().optional(),
  runtime_mode: z.enum(['Online · LLM', 'Online · Fallback', 'Offline · Local']).optional(),
});
export type AssessmentResultData = z.infer<typeof AssessmentResultSchema>;

export const AgentRunTraceSchema = z.object({
  id: z.number().optional(),
  event_name: z.string(),
  agent_name: z.string(),
  input_summary: z.string(),
  output_summary: z.string(),
  duration_ms: z.number(),
  used_llm: z.boolean(),
  status: z.string().default('success'),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  runtime_mode: z.enum(['Online · LLM', 'Online · Fallback', 'Offline · Local']).default('Offline · Local'),
});
export type AgentRunTraceData = z.infer<typeof AgentRunTraceSchema>;

export const MentorMessageSchema = z.object({
  id: z.number().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  text: z.string(),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  client_uuid: z.string().optional(),
  pending_sync: z.boolean().optional(),
  intent: z.string().optional(),
  offline_handled: z.boolean().optional(),
});
export type MentorMessageData = z.infer<typeof MentorMessageSchema>;

export const SyncQueueItemSchema = z.object({
  id: z.number().optional(),
  type: z.enum([
    'PROFILE_UPDATE',
    'ITEM_TOGGLE',
    'ASSESSMENT_SUBMIT',
    'GOAL_CHANGE',
    'MENTOR_QUERY',
    'UPDATE_PROFILE',
    'TOGGLE_ROADMAP_ITEM',
    'SUBMIT_ASSESSMENT',
    'ROADMAP_VERSION',
    'CHAT_MESSAGE'
  ]),
  client_uuid: z.string(),
  payload: z.record(z.string(), z.any()),
  createdAt: z.string().optional(),
  created_at: z.string().optional(),
  attempts: z.number().default(0),
  last_error: z.string().optional(),
  lastError: z.string().optional(),
  status: z.enum([
    'pending', 'syncing', 'completed', 'failed', 'retrying',
    'PENDING', 'SYNCING', 'COMPLETED', 'FAILED', 'RETRYING'
  ]).default('pending'),
});
export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;
