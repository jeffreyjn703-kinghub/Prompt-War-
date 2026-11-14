export interface User {
  id: number;
  email: string;
  full_name: string;
  is_demo: boolean;
}

export interface UserSkillItem {
  skill_name: string;
  proficiency: number;
  verified_level?: number | null;
  confidence: string; // "self-rated" | "verified by assessment"
  last_assessed_at?: string | null;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issue_date: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  skills_used: string;
}

export interface Profile {
  user_id: number;
  email: string;
  full_name: string;
  education: string;
  target_role: string;
  weekly_hours: number;
  readiness_pct: number;
  streak_days: number;
  skills: UserSkillItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  last_active_at?: string;
  is_new_user?: boolean;
}

export interface SkillTaxonomyItem {
  skill_id: string;
  name: string;
  category: string;
  description: string;
  prerequisites: string[];
}

export interface RoleTaxonomyItem {
  role_id: string;
  title: string;
  department: string;
  description: string;
  required_skills: Record<string, number>;
  total_skills_count: number;
}

export interface MatchedSkillItem {
  skill_id: string;
  name: string;
  current_level: number;
  required_level: number;
  status: 'matched' | 'partial' | 'missing';
  gap: number;
}

export interface CareerMatchData {
  role_id: string;
  title: string;
  department: string;
  description: string;
  match_percentage: number;
  matched_skills: MatchedSkillItem[];
  partial_skills: any[];
  missing_skills: any[];
  top_recommended_roles: Array<{
    role_id: string;
    title: string;
    match_pct: number;
  }>;
}

export interface RoadmapItem {
  id: number;
  skill_id: string;
  title: string;
  item_type: 'course' | 'tutorial' | 'doc' | 'video' | 'exercise' | 'project';
  estimated_hours: number;
  rationale: string;
  provider: string;
  url: string;
  is_completed: boolean;
  completed_at?: string;
  sort_order: number;
}

export interface RoadmapPhase {
  id: number;
  phase_number: number;
  title: string;
  description: string;
  estimated_hours: number;
  is_remedial: boolean;
  is_completed: boolean;
  items: RoadmapItem[];
}

export interface RoadmapVersion {
  id: number;
  version_number: number;
  target_role: string;
  trigger_event: string;
  reason_diff: string;
  total_phases: number;
  total_hours: number;
  is_active: boolean;
  created_at: string;
  phases: RoadmapPhase[];
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  question_type: 'mcq' | 'practical';
  options: string[];
  correct_option_index?: number;
  explanation?: string;
  difficulty: string;
}

export interface AssessmentGenerateData {
  skill_id: string;
  skill_name: string;
  questions: AssessmentQuestion[];
  total_questions: number;
}

export interface AssessmentResultData {
  attempt_id: number;
  skill_id: string;
  score_pct: number;
  passed: boolean;
  total_questions: number;
  correct_questions: number;
  new_verified_level: number;
  weak_topics: string[];
  trigger_action: string;
  replan_triggered: boolean;
  replan_summary?: string;
  mentor_feedback: string;
  created_at: string;
}

export interface AgentRunTraceItem {
  id: number;
  event_name: string;
  agent_name: string;
  input_summary: string;
  output_summary: string;
  duration_ms: number;
  used_llm: boolean;
  status: string;
  created_at: string;
}

export interface AgentGraphNode {
  id: string;
  name: string;
  type: string;
  role: string;
}

export interface AgentGraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface AgentTraceData {
  traces: AgentRunTraceItem[];
  nodes: AgentGraphNode[];
  edges: AgentGraphEdge[];
  stats: {
    total_runs: number;
    llm_runs: number;
    fallback_runs: number;
    avg_latency_ms: number;
  };
}

export interface CohortLearner {
  user_id: number;
  name: string;
  email: string;
  target_role: string;
  readiness_pct: number;
  streak_days: number;
  top_gaps: string[];
  last_active: string;
}

export interface SkillHeatmapCell {
  skill_id: string;
  skill_name: string;
  category: string;
  avg_level: number;
  target_level: number;
  gap_count: number;
  criticality: 'High' | 'Medium' | 'Low';
}

export interface CohortOverviewData {
  total_learners: number;
  avg_readiness: number;
  top_target_roles: Array<{ role: string; count: number }>;
  cohort: CohortLearner[];
  skill_heatmap: SkillHeatmapCell[];
}
