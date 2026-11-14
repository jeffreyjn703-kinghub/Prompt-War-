import {
  Profile,
  SkillTaxonomyItem,
  RoleTaxonomyItem,
  CareerMatchData,
  RoadmapVersion,
  AssessmentGenerateData,
  AssessmentResultData,
  AgentTraceData,
  CohortOverviewData
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('skillpath_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('skillpath_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('skillpath_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  demoLogin: (learner: 'demo' | 'alex' = 'demo') =>
    request<{ access_token: string; user_id: number; email: string; full_name: string; is_demo: boolean }>(
      `/auth/demo-login?learner=${learner}`,
      { method: 'POST' }
    ),
  login: (email: string, password: string) =>
    request<{ access_token: string; user_id: number; email: string; full_name: string; is_demo: boolean }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  register: (email: string, password: string, full_name: string) =>
    request<{ access_token: string; user_id: number; email: string; full_name: string; is_demo: boolean }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, full_name }) }
    ),

  // Profile
  getProfile: () => request<Profile>('/profile'),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Skills & Roles Taxonomy
  getSkills: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request<SkillTaxonomyItem[]>(`/skills?${params.toString()}`);
  },
  getRoles: () => request<RoleTaxonomyItem[]>('/roles'),

  // Analysis & Match
  getAnalysis: () => request<any>('/analysis'),
  getMatch: (roleId?: string) =>
    request<CareerMatchData>(`/match${roleId ? `?role_id=${roleId}` : ''}`),
  selectRole: (roleId: string) =>
    request<{
      status: string;
      old_role: string;
      new_role: string;
      replan_diff: string;
      mentor_message: string;
      new_roadmap_version: number;
    }>('/match/select-role', {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId }),
    }),

  // Roadmap
  getRoadmap: () => request<RoadmapVersion>('/roadmap'),
  toggleRoadmapItem: (itemId: number) =>
    request<{ item_id: number; is_completed: boolean; phase_id: number; phase_is_completed: boolean }>(
      `/roadmap/items/${itemId}/toggle`,
      { method: 'POST' }
    ),
  getRoadmapVersions: () => request<any[]>('/roadmap/versions'),
  regenerateRoadmap: () => request<RoadmapVersion>('/roadmap/regenerate', { method: 'POST' }),

  // Progress
  getProgress: () => request<any>('/progress'),

  // Resources
  getResources: (skillId?: string) =>
    request<any[]>(`/resources${skillId ? `?skill_id=${skillId}` : ''}`),

  // Assessments
  generateAssessment: (skillId: string) =>
    request<AssessmentGenerateData>(`/assessments/generate/${skillId}`),
  submitAssessment: (skillId: string, answers: Record<number, number>, practicalResponse: string) =>
    request<AssessmentResultData>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({
        skill_id: skillId,
        answers,
        practical_response: practicalResponse,
      }),
    }),

  // AI Mentor
  getMentorGuidance: () =>
    request<{
      message: string;
      action_suggestion: string;
      nudges: string[];
      target_role: string;
    }>('/mentor/guidance'),

  // Agents
  getAgentTraces: () => request<AgentTraceData>('/agents/runs'),

  // Org Cohort
  getCohort: () => request<CohortOverviewData>('/org/cohort'),
};
