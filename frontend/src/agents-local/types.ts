export interface LocalLearnerContext {
  user_id: number;
  full_name: string;
  education?: string;
  target_role: string;
  weekly_hours: number;
  current_skills: Record<string, number>; // skill_id -> level 1-5
  verified_skills: Record<string, number>; // skill_id -> level 1-5
  certifications?: Array<{ name: string; issuer?: string; issue_date?: string }>;
  projects?: Array<{ title: string; description?: string; skills_used?: string }>;
  completed_item_ids: string[];

  // State accumulated across agent hand-offs
  match_report?: any;
  gap_report?: any;
  roadmap?: any;
  recommendations?: any;
  assessment_result?: any;
  evaluator_insight?: any;
  mentor_message?: string;

  trigger_event: 'INITIAL' | 'GOAL_CHANGED' | 'ASSESSMENT_POOR' | 'ASSESSMENT_STRONG' | 'PROGRESS_STALLED';
  metadata: Record<string, any>;
  runtime_mode?: 'Online · LLM' | 'Online · Fallback' | 'Offline · Local';
}

export interface LocalAgentTrace {
  id?: number;
  event_name: string;
  agent_name: string;
  input_summary: string;
  output_summary: string;
  duration_ms: number;
  used_llm: boolean;
  status: string;
  created_at: string;
  runtime_mode: 'Online · LLM' | 'Online · Fallback' | 'Offline · Local';
}
