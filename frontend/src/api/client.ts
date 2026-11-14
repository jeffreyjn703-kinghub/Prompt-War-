import {
  Profile,
  SkillTaxonomyItem,
  RoleTaxonomyItem,
  CareerMatchData,
  RoadmapVersion,
  AssessmentGenerateData,
  AssessmentResultData,
  AgentTraceData,
  CohortOverviewData,
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

// -------------------------------------------------------------
// In-Memory / Local Storage Mock State for 100% Offline/Static Resilience
// -------------------------------------------------------------
const MOCK_PROFILE: Profile = {
  user_id: 1,
  email: 'arjun.kumar@skillpath.ai',
  full_name: 'Arjun Kumar',
  education: 'B.E. Computer Science Engineering (Final Year)',
  target_role: 'Full Stack Developer',
  weekly_hours: 10,
  streak_days: 6,
  readiness_pct: 32.0,
  skills: [
    {
      skill_name: 'Python',
      proficiency: 4,
      verified_level: 4,
      confidence: 'verified by assessment',
      last_assessed_at: '2026-10-28T10:00:00Z',
    },
    {
      skill_name: 'SQL',
      proficiency: 3,
      verified_level: 3,
      confidence: 'verified by assessment',
      last_assessed_at: '2026-11-02T14:30:00Z',
    },
    {
      skill_name: 'HTML & CSS',
      proficiency: 2,
      verified_level: null,
      confidence: 'self-rated',
    },
    {
      skill_name: 'JavaScript',
      proficiency: 1,
      verified_level: null,
      confidence: 'self-rated',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issue_date: '2026-05',
    },
    {
      name: 'Python for Everybody Specialization',
      issuer: 'Coursera / Univ of Michigan',
      issue_date: '2025-11',
    },
  ],
  projects: [
    {
      title: 'Inventory Management REST API',
      description: 'Production REST API built with FastAPI, SQLite, and automated PyTest suites.',
      skills_used: 'Python, SQL, FastAPI',
    },
    {
      title: 'Personal Portfolio Website',
      description: 'Responsive web portfolio showcasing engineering projects with modern CSS Grid.',
      skills_used: 'HTML & CSS, JavaScript',
    },
  ],
};

const MOCK_ROLES: RoleTaxonomyItem[] = [
  {
    role_id: 'full-stack-dev',
    title: 'Full Stack Developer',
    department: 'Engineering',
    description: 'Design and implement complete end-to-end web architectures, client frontends, backend APIs, and database migrations.',
    required_skills: {
      python: 4,
      sql: 3,
      javascript: 4,
      react: 4,
      'node-js': 3,
      'html-css': 4,
      git: 3,
      docker: 2,
      testing: 3,
    },
    total_skills_count: 9,
  },
  {
    role_id: 'frontend-engineer',
    title: 'Frontend Engineer',
    department: 'Engineering',
    description: 'Build performant, accessible, and delightful interactive user interfaces with modern reactive component systems.',
    required_skills: {
      javascript: 5,
      react: 5,
      'html-css': 5,
      typescript: 4,
      git: 3,
      testing: 3,
    },
    total_skills_count: 6,
  },
  {
    role_id: 'backend-engineer',
    title: 'Backend Engineer',
    department: 'Engineering',
    description: 'Architect distributed backend services, high-throughput database schemas, async queues, and secure REST/gRPC endpoints.',
    required_skills: {
      python: 5,
      sql: 4,
      'node-js': 4,
      docker: 3,
      git: 4,
      testing: 4,
    },
    total_skills_count: 6,
  },
  {
    role_id: 'data-engineer',
    title: 'Data Engineer',
    department: 'Data & Analytics',
    description: 'Construct resilient ETL data pipelines, lakehouse schemas, and real-time streaming infrastructure for analytics.',
    required_skills: {
      python: 5,
      sql: 5,
      docker: 3,
      git: 3,
    },
    total_skills_count: 4,
  },
  {
    role_id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    department: 'AI & Research',
    description: 'Deploy, fine-tune, and optimize machine learning models and LLM agentic pipelines into production cloud infrastructure.',
    required_skills: {
      python: 5,
      sql: 4,
      docker: 4,
      testing: 3,
    },
    total_skills_count: 4,
  },
  {
    role_id: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    description: 'Automate CI/CD pipelines, container orchestration, telemetry observability, and cloud infrastructure as code.',
    required_skills: {
      python: 4,
      docker: 5,
      git: 4,
      sql: 3,
    },
    total_skills_count: 4,
  },
  {
    role_id: 'cloud-architect',
    title: 'Cloud Architect',
    department: 'Infrastructure',
    description: 'Lead multi-region cloud topology design, cost optimization, disaster recovery, and enterprise security governance.',
    required_skills: {
      python: 4,
      docker: 4,
      sql: 3,
      git: 3,
    },
    total_skills_count: 4,
  },
  {
    role_id: 'mobile-dev',
    title: 'Mobile Developer (React Native)',
    department: 'Engineering',
    description: 'Ship native and cross-platform iOS/Android apps with smooth animations, offline persistence, and native bridges.',
    required_skills: {
      javascript: 4,
      react: 4,
      git: 3,
      testing: 3,
    },
    total_skills_count: 4,
  },
  {
    role_id: 'security-engineer',
    title: 'Security Engineer',
    department: 'Information Security',
    description: 'Safeguard systems against zero-days, perform threat modeling, vulnerability auditing, and secure authentication.',
    required_skills: {
      python: 4,
      sql: 3,
      docker: 3,
      git: 3,
    },
    total_skills_count: 4,
  },
];

const MOCK_SKILLS: SkillTaxonomyItem[] = [
  { skill_id: 'python', name: 'Python', category: 'Programming Languages', description: 'General purpose object-oriented & scripting language', prerequisites: [] },
  { skill_id: 'javascript', name: 'JavaScript', category: 'Programming Languages', description: 'Core web runtime language ES2024 & asynchronous primitives', prerequisites: [] },
  { skill_id: 'sql', name: 'SQL', category: 'Databases & Storage', description: 'Relational querying, indexes, transactions & schema design', prerequisites: [] },
  { skill_id: 'html-css', name: 'HTML & CSS', category: 'Frontend Development', description: 'Semantic markup, modern layout algorithms (Flexbox, Grid), and CSS variables', prerequisites: [] },
  { skill_id: 'react', name: 'React', category: 'Frontend Development', description: 'Component lifecycle, hooks, state machines, and modern client architecture', prerequisites: ['javascript', 'html-css'] },
  { skill_id: 'node-js', name: 'Node.js & APIs', category: 'Backend Development', description: 'Event-driven server runtime, Express/Fastify, RESTful API conventions', prerequisites: ['javascript'] },
  { skill_id: 'docker', name: 'Docker', category: 'Cloud & DevOps', description: 'Containerization, multi-stage builds, compose files', prerequisites: [] },
  { skill_id: 'git', name: 'Git & GitHub', category: 'Engineering Practices', description: 'Version control, branch protection, rebase workflows, and pull requests', prerequisites: [] },
  { skill_id: 'testing', name: 'Unit & Integration Testing', category: 'Engineering Practices', description: 'Test-driven development, Jest, PyTest, mock stubs', prerequisites: [] },
];

let currentMockRoadmap: RoadmapVersion = {
  id: 1,
  version_number: 2,
  trigger_event: 'ASSESSMENT_POOR',
  target_role: 'Full Stack Developer',
  reason_diff: 'Diagnostic assessment for JavaScript recorded 48% (Threshold 60%). Curriculum Planner dynamically injected Remedial Phase 1: Core JavaScript Fundamentals & Execution Engine before React & Node.js.',
  total_phases: 4,
  total_hours: 66,
  is_active: true,
  created_at: new Date().toISOString(),
  phases: [
    {
      id: 1,
      phase_number: 1,
      title: 'Phase 1: Remedial JavaScript & Engine Mechanics',
      description: 'Strengthen asynchronous execution, closure scopes, prototype chains, and DOM manipulation before framework abstractions.',
      estimated_hours: 12,
      is_completed: false,
      is_remedial: true,
      items: [
        {
          id: 101,
          skill_id: 'javascript',
          item_type: 'tutorial',
          title: 'JavaScript Event Loop & Concurrency Model Visualized',
          provider: 'JavaScript.info & Lydia Hallie',
          url: 'https://javascript.info/event-loop',
          estimated_hours: 3.5,
          is_completed: true,
          sort_order: 1,
          rationale: 'Clarifies macrotasks, microtasks, and promise queues flagged weak in diagnostic.',
        },
        {
          id: 102,
          skill_id: 'javascript',
          item_type: 'course',
          title: 'Deep Dive: Scopes, Closures, and Execution Contexts',
          provider: 'Frontend Masters / Kyle Simpson',
          url: 'https://github.com/getify/You-Dont-Know-JS',
          estimated_hours: 4.5,
          is_completed: false,
          sort_order: 2,
          rationale: 'Foundational mental model required for React state hooks.',
        },
        {
          id: 103,
          skill_id: 'javascript',
          item_type: 'exercise',
          title: 'Hands-on Drill: Implement Custom Promise.all and Debounce',
          provider: 'SkillPath Interactive Code Sandbox',
          url: 'https://leetcode.com',
          estimated_hours: 4.0,
          is_completed: false,
          sort_order: 3,
          rationale: 'Practical coding reinforcement for verified competency gate.',
        },
      ],
    },
    {
      id: 2,
      phase_number: 2,
      title: 'Phase 2: Modern React 19 & Component Architecture',
      description: 'Master functional component hooks, TanStack Query cache synchronization, form validations, and Tailwind design systems.',
      estimated_hours: 18,
      is_completed: false,
      is_remedial: false,
      items: [
        {
          id: 201,
          skill_id: 'react',
          item_type: 'course',
          title: 'React 19 Official Documentation & Interactive Walkthroughs',
          provider: 'React.dev',
          url: 'https://react.dev/learn',
          estimated_hours: 6.0,
          is_completed: false,
          sort_order: 1,
          rationale: 'Standard component patterns and best practices.',
        },
        {
          id: 202,
          skill_id: 'react',
          item_type: 'tutorial',
          title: 'Mastering State Management: Zustand & Server State',
          provider: 'TkDodo Blog',
          url: 'https://tkdodo.eu/blog',
          estimated_hours: 4.0,
          is_completed: false,
          sort_order: 2,
          rationale: 'Avoid redundant prop drilling in medium to large scale applications.',
        },
        {
          id: 203,
          skill_id: 'react',
          item_type: 'project',
          title: 'Capstone Mini-Project: Interactive Kanban Board with Drag & Drop',
          provider: 'SkillPath Project Lab',
          url: 'https://github.com',
          estimated_hours: 8.0,
          is_completed: false,
          sort_order: 3,
          rationale: 'Validates component composition, state isolation, and keyboard accessibility.',
        },
      ],
    },
    {
      id: 3,
      phase_number: 3,
      title: 'Phase 3: Backend REST Services with Node.js & SQLite/Postgres',
      description: 'Construct type-safe REST APIs, JWT authentication middlewares, rate-limiting, and ORM database migrations.',
      estimated_hours: 16,
      is_completed: false,
      is_remedial: false,
      items: [
        {
          id: 301,
          skill_id: 'node-js',
          item_type: 'tutorial',
          title: 'Building Production-Ready REST APIs with Express & TypeScript',
          provider: 'LogRocket Guides',
          url: 'https://blog.logrocket.com',
          estimated_hours: 5.0,
          is_completed: false,
          sort_order: 1,
          rationale: 'Bridges frontend fetch calls with backend handlers.',
        },
        {
          id: 302,
          skill_id: 'sql',
          item_type: 'course',
          title: 'Relational Database Schema Design & Prisma/SQLAlchemy ORM',
          provider: 'Prisma Data Guide',
          url: 'https://www.prisma.io/dataguide',
          estimated_hours: 4.0,
          is_completed: false,
          sort_order: 2,
          rationale: 'Capitalizes on existing SQL 3/5 competency to build migrations.',
        },
        {
          id: 303,
          skill_id: 'node-js',
          item_type: 'exercise',
          title: 'Hands-on: Secure User Auth with Refresh Tokens & Role-Based Access',
          provider: 'SkillPath Security Lab',
          url: 'https://owasp.org',
          estimated_hours: 7.0,
          is_completed: false,
          sort_order: 3,
          rationale: 'Essential production standard required by industry role benchmarks.',
        },
      ],
    },
    {
      id: 4,
      phase_number: 4,
      title: 'Phase 4: Full Stack Capstone & Production Deployment',
      description: 'Deploy full stack application with Docker containerization, GitHub Actions CI/CD pipeline, and observability telemetry.',
      estimated_hours: 20,
      is_completed: false,
      is_remedial: false,
      items: [
        {
          id: 401,
          skill_id: 'docker',
          item_type: 'course',
          title: 'Docker for Full Stack Developers from Zero to Production',
          provider: 'Docker Labs',
          url: 'https://docs.docker.com',
          estimated_hours: 6.0,
          is_completed: false,
          sort_order: 1,
          rationale: 'Standardizes local and production execution environments.',
        },
        {
          id: 402,
          skill_id: 'full-stack-dev',
          item_type: 'project',
          title: 'End-to-End Capstone: Multi-Tenant Collaborative Workflow System',
          provider: 'SkillPath Capstone Review Board',
          url: 'https://github.com',
          estimated_hours: 14.0,
          is_completed: false,
          sort_order: 2,
          rationale: 'The crowning portfolio artifact evaluated by hiring partner benchmarks.',
        },
      ],
    },
  ],
};

// -------------------------------------------------------------
// Unified Request Function with Smart Mock Fallback
// -------------------------------------------------------------
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
  } catch (err) {
    // Backend offline or running purely static build on Vercel
  }

  // Gracefully provide rich client-side deterministic fallback
  return getMockData<T>(endpoint, options);
}

function getMockData<T>(endpoint: string, options: RequestInit = {}): T {
  // Auth
  if (endpoint.startsWith('/auth/demo-login') || endpoint === '/auth/login' || endpoint === '/auth/register') {
    return {
      access_token: 'demo-jwt-token-arjun-kumar-2026',
      user_id: 1,
      email: 'arjun.kumar@skillpath.ai',
      full_name: 'Arjun Kumar',
      is_demo: true,
    } as unknown as T;
  }

  // Profile
  if (endpoint === '/profile') {
    if (options.method === 'PUT' && options.body) {
      try {
        const body = JSON.parse(options.body as string);
        Object.assign(MOCK_PROFILE, body);
      } catch (_) {}
    }
    return MOCK_PROFILE as unknown as T;
  }

  // Skills
  if (endpoint.startsWith('/skills')) {
    return MOCK_SKILLS as unknown as T;
  }

  // Roles
  if (endpoint === '/roles') {
    return MOCK_ROLES as unknown as T;
  }

  // Analysis
  if (endpoint === '/analysis') {
    return {
      radar_data: [
        { subject: 'Python', learner_level: 4, target_level: 4, confidence_label: 'Verified' },
        { subject: 'SQL', learner_level: 3, target_level: 3, confidence_label: 'Verified' },
        { subject: 'HTML & CSS', learner_level: 2, target_level: 4, confidence_label: 'Self-rated' },
        { subject: 'JavaScript', learner_level: 1, target_level: 4, confidence_label: 'Self-rated' },
        { subject: 'React', learner_level: 0, target_level: 4, confidence_label: 'Unverified' },
        { subject: 'Node.js', learner_level: 0, target_level: 3, confidence_label: 'Unverified' },
        { subject: 'Git', learner_level: 2, target_level: 3, confidence_label: 'Self-rated' },
        { subject: 'Docker', learner_level: 1, target_level: 2, confidence_label: 'Self-rated' },
        { subject: 'Testing', learner_level: 1, target_level: 3, confidence_label: 'Self-rated' },
      ],
      strengths: [
        { name: 'Python', level: 4, category: 'Backend & Data', confidence: 'Verified by Assessment' },
        { name: 'SQL', level: 3, category: 'Databases', confidence: 'Verified by Assessment' },
      ],
      weaknesses: [
        { name: 'JavaScript', level: 1, target: 4, gap: 3, category: 'Frontend', priority: 'Critical' },
        { name: 'React', level: 0, target: 4, gap: 4, category: 'Frontend', priority: 'High' },
        { name: 'Node.js & APIs', level: 0, target: 3, gap: 3, category: 'Backend', priority: 'High' },
      ],
    } as unknown as T;
  }

  // Match
  if (endpoint.startsWith('/match')) {
    if (endpoint === '/match/select-role' && options.method === 'POST') {
      let roleTitle = 'Backend Engineer';
      try {
        const body = JSON.parse(options.body as string);
        roleTitle = body.role_id || roleTitle;
      } catch (_) {}

      MOCK_PROFILE.target_role = roleTitle;
      currentMockRoadmap = {
        ...currentMockRoadmap,
        id: currentMockRoadmap.id + 1,
        version_number: currentMockRoadmap.version_number + 1,
        target_role: roleTitle,
        trigger_event: 'GOAL_CHANGED',
        reason_diff: `Learner pivoted target role from Full Stack Developer to ${roleTitle}. Preserved 2 completed verified skills (Python 4/5, SQL 3/5). Generated delta phases for role competencies.`,
      };

      return {
        status: 'success',
        old_role: 'Full Stack Developer',
        new_role: roleTitle,
        replan_diff: currentMockRoadmap.reason_diff,
        mentor_message: `Goal successfully pivoted to ${roleTitle}! Prior masteries have been preserved and your new roadmap is ready.`,
        new_roadmap_version: currentMockRoadmap.version_number,
      } as unknown as T;
    }

    return {
      role_id: 'full-stack-dev',
      title: MOCK_PROFILE.target_role,
      department: 'Engineering',
      description: 'Design and implement complete end-to-end web architectures, client frontends, backend APIs, and database migrations.',
      match_percentage: 32.0,
      matched_skills: [
        { skill_id: 'python', name: 'Python', current_level: 4, required_level: 4, status: 'matched', gap: 0 },
        { skill_id: 'sql', name: 'SQL', current_level: 3, required_level: 3, status: 'matched', gap: 0 },
        { skill_id: 'html-css', name: 'HTML & CSS', current_level: 2, required_level: 4, status: 'partial', gap: 2 },
        { skill_id: 'javascript', name: 'JavaScript', current_level: 1, required_level: 4, status: 'partial', gap: 3 },
        { skill_id: 'react', name: 'React', current_level: 0, required_level: 4, status: 'missing', gap: 4 },
        { skill_id: 'node-js', name: 'Node.js & APIs', current_level: 0, required_level: 3, status: 'missing', gap: 3 },
        { skill_id: 'git', name: 'Git & GitHub', current_level: 2, required_level: 3, status: 'partial', gap: 1 },
        { skill_id: 'docker', name: 'Docker', current_level: 1, required_level: 2, status: 'partial', gap: 1 },
        { skill_id: 'testing', name: 'Testing', current_level: 1, required_level: 3, status: 'partial', gap: 2 },
      ],
      partial_skills: [],
      missing_skills: [],
      top_recommended_roles: [
        { role_id: 'data-engineer', title: 'Data Engineer', match_pct: 68.0 },
        { role_id: 'backend-engineer', title: 'Backend Engineer', match_pct: 55.0 },
        { role_id: 'full-stack-dev', title: 'Full Stack Developer', match_pct: 32.0 },
      ],
    } as unknown as T;
  }

  // Roadmap
  if (endpoint === '/roadmap') {
    return currentMockRoadmap as unknown as T;
  }

  if (endpoint.includes('/items/') && endpoint.endsWith('/toggle')) {
    const parts = endpoint.split('/');
    const itemId = parseInt(parts[parts.length - 2], 10);
    for (const phase of currentMockRoadmap.phases) {
      for (const item of phase.items) {
        if (item.id === itemId) {
          item.is_completed = !item.is_completed;
          const allCompleted = phase.items.every((it) => it.is_completed);
          phase.is_completed = allCompleted;
          return {
            item_id: itemId,
            is_completed: item.is_completed,
            phase_id: phase.id,
            phase_is_completed: phase.is_completed,
          } as unknown as T;
        }
      }
    }
    return { item_id: itemId, is_completed: true, phase_id: 1, phase_is_completed: false } as unknown as T;
  }

  if (endpoint === '/roadmap/versions') {
    return [
      {
        id: 2,
        version_number: 2,
        trigger_event: 'ASSESSMENT_POOR',
        reason_diff: currentMockRoadmap.reason_diff,
        created_at: currentMockRoadmap.created_at,
        total_phases: 4,
        total_hours: 66,
      },
      {
        id: 1,
        version_number: 1,
        trigger_event: 'INITIAL_ONBOARDING',
        reason_diff: 'Initial curriculum roadmap generated from diagnostic profile survey.',
        created_at: '2026-10-15T09:00:00Z',
        total_phases: 3,
        total_hours: 54,
      },
    ] as unknown as T;
  }

  if (endpoint === '/roadmap/regenerate') {
    currentMockRoadmap = {
      ...currentMockRoadmap,
      id: currentMockRoadmap.id + 1,
      version_number: currentMockRoadmap.version_number + 1,
      trigger_event: 'MANUAL_REGENERATE',
      reason_diff: 'Roadmap dynamically synchronized with updated skill levels and completion metrics.',
    };
    return currentMockRoadmap as unknown as T;
  }

  // Progress
  if (endpoint === '/progress') {
    return {
      readiness_pct: 32.0,
      streak_days: 6,
      weekly_hours: 10,
      total_completed_hours: 4.5,
      target_role: MOCK_PROFILE.target_role,
      forecast_weeks_remaining: 9,
      score_history: [
        { date: 'Oct 28', score: 82, skill: 'Python' },
        { date: 'Nov 02', score: 76, skill: 'SQL' },
        { date: 'Nov 09', score: 70, skill: 'HTML & CSS' },
        { date: 'Nov 14', score: 48, skill: 'JavaScript' },
      ],
      phases_progress: [
        { phase_id: 1, title: 'Phase 1: Remedial JavaScript', progress_pct: 35 },
        { phase_id: 2, title: 'Phase 2: Modern React 19', progress_pct: 0 },
        { phase_id: 3, title: 'Phase 3: Backend REST Services', progress_pct: 0 },
        { phase_id: 4, title: 'Phase 4: Full Stack Capstone', progress_pct: 0 },
      ],
      badges: [
        { id: 'streak-5', title: '5-Day Streak Master', unlocked: true, icon: 'Flame' },
        { id: 'quiz-ace', title: 'Python Verified 80%+', unlocked: true, icon: 'ShieldCheck' },
        { id: 'capstone', title: 'Full Stack Capstone Ready', unlocked: false, icon: 'Award' },
      ],
    } as unknown as T;
  }

  // Resources
  if (endpoint.startsWith('/resources')) {
    return [
      {
        id: 1,
        skill_id: 'javascript',
        title: 'Modern JavaScript from the Beginning (ES6+)',
        type: 'course',
        provider: 'Frontend Masters',
        url: 'https://javascript.info',
        estimated_hours: 6.0,
        difficulty: 'intermediate',
        description: 'Comprehensive overview of prototypes, async await, event loops, and memory models.',
      },
      {
        id: 2,
        skill_id: 'javascript',
        title: 'Interactive Closures & Scope Debugger Exercises',
        type: 'exercise',
        provider: 'LeetCode & JavaScript.info',
        url: 'https://leetcode.com',
        estimated_hours: 3.5,
        difficulty: 'beginner',
        description: 'Solve real-world closure bugs and implement higher-order functions.',
      },
      {
        id: 3,
        skill_id: 'javascript',
        title: 'MDN Web Docs: Concurrency Model and the Event Loop',
        type: 'doc',
        provider: 'Mozilla Developer Network',
        url: 'https://developer.mozilla.org',
        estimated_hours: 2.0,
        difficulty: 'intermediate',
        description: 'Official browser specification semantics for execution context queues.',
      },
    ] as unknown as T;
  }

  // Assessments
  if (endpoint.startsWith('/assessments/generate/')) {
    const parts = endpoint.split('/');
    const skill = parts[parts.length - 1] || 'javascript';
    return {
      skill_id: skill,
      skill_name: skill.charAt(0).toUpperCase() + skill.slice(1),
      total_questions: 8,
      questions: [
        {
          id: 1,
          question_text: 'What is the exact output of `console.log(typeof null)` in standard JavaScript?',
          question_type: 'mcq',
          options: ['"null"', '"undefined"', '"object"', '"number"'],
          correct_option_index: 2,
          explanation: 'In JavaScript, typeof null returns "object", which is a legacy implementation artifact since the first release.',
          difficulty: 'beginner',
        },
        {
          id: 2,
          question_text: 'In the JavaScript event loop, which queue has priority when the call stack clears?',
          question_type: 'mcq',
          options: ['Macrotask queue (setTimeout)', 'Microtask queue (Promise.then)', 'RequestAnimationFrame queue', 'I/O callback queue'],
          correct_option_index: 1,
          explanation: 'All microtasks in the microtask queue are executed before the next macrotask is processed.',
          difficulty: 'intermediate',
        },
        {
          id: 3,
          question_text: 'What does a closure retain access to?',
          question_type: 'mcq',
          options: [
            'Only variables passed as arguments',
            'Variables in its outer lexical scope even after that outer function returns',
            'Only globally declared variables',
            'The global window object exclusively',
          ],
          correct_option_index: 1,
          explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment).',
          difficulty: 'intermediate',
        },
        {
          id: 4,
          question_text: 'What will `[1, 2, 3].map(parseInt)` produce in JavaScript?',
          question_type: 'mcq',
          options: ['[1, 2, 3]', '[1, NaN, NaN]', '[NaN, NaN, NaN]', '[1, 0, 0]'],
          correct_option_index: 1,
          explanation: 'map passes (element, index, array). parseInt receives (1, 0) -> 1, (2, 1) -> NaN (radix 1 invalid), (3, 2) -> NaN (radix 2 invalid).',
          difficulty: 'intermediate',
        },
        {
          id: 5,
          question_text: 'Which method creates a shallow copy of an object in ES6?',
          question_type: 'mcq',
          options: ['Object.assign({}, obj)', 'Object.freeze(obj)', 'Object.seal(obj)', 'Object.preventExtensions(obj)'],
          correct_option_index: 0,
          explanation: 'Object.assign({}, obj) copies own enumerable properties into a new empty object shallowly.',
          difficulty: 'beginner',
        },
        {
          id: 6,
          question_text: 'What is the advantage of `Promise.allSettled()` over `Promise.all()`?',
          question_type: 'mcq',
          options: [
            'It rejects immediately on first error',
            'It waits for all promises to resolve or reject without early termination',
            'It runs promises sequentially instead of concurrently',
            'It prevents unhandled rejections completely',
          ],
          correct_option_index: 1,
          explanation: 'Promise.allSettled() returns a promise that resolves after all given promises have either fulfilled or rejected.',
          difficulty: 'intermediate',
        },
        {
          id: 7,
          question_text: 'Which HTTP header prevents cross-site scripting (XSS) execution in modern browsers?',
          question_type: 'mcq',
          options: ['Content-Security-Policy', 'Access-Control-Allow-Origin', 'Cache-Control', 'X-Frame-Options'],
          correct_option_index: 0,
          explanation: 'Content-Security-Policy (CSP) restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load.',
          difficulty: 'advanced',
        },
        {
          id: 8,
          question_text: 'Write or review the logic for a custom debounce function in JavaScript:',
          question_type: 'practical',
          options: [
            'Return a function that resets a setTimeout handle on each invocation',
            'Invoke immediately with no timer',
            'Queue calls synchronously in a while loop',
            'Use setInterval indefinitely',
          ],
          correct_option_index: 0,
          explanation: 'Debounce maintains a timer reference via closure and clears the timeout on every subsequent invocation.',
          difficulty: 'intermediate',
        },
      ],
    } as unknown as T;
  }

  if (endpoint === '/assessments/submit' && options.method === 'POST') {
    return {
      attempt_id: 104,
      skill_id: 'javascript',
      score_pct: 48.0,
      passed: false,
      total_questions: 8,
      correct_questions: 4,
      new_verified_level: 2,
      weak_topics: ['Event Loop & Microtasks', 'Closures & Scope Chain', 'Promise Concurrency'],
      trigger_action: 'REMEDIAL_INSERTION',
      replan_triggered: true,
      replan_summary: 'Remedial Phase 1 inserted: Core JavaScript Fundamentals before React.',
      mentor_feedback: 'Diagnostic score (48%) is below the 60% threshold. The multi-agent pipeline has adapted your roadmap with targeted remedial exercises for Event Loop and Closures.',
      created_at: new Date().toISOString(),
    } as unknown as T;
  }

  // AI Mentor Guidance
  if (endpoint === '/mentor/guidance') {
    return {
      message: "Hi Arjun! Your Python and SQL foundation is strong (Verified). To reach your 80% Full Stack readiness milestone, let's close the JavaScript closures and event loop gaps in your active remedial phase.",
      action_suggestion: 'Complete the "JavaScript Event Loop Visualized" tutorial (3.5h) this week.',
      nudges: [
        'Streak is at 6 days — keep the momentum going!',
        'Remedial Phase 1 active: 1 of 3 items completed.',
        'Target role readiness calibrated at 32%.',
      ],
      target_role: MOCK_PROFILE.target_role,
    } as unknown as T;
  }

  // Agent Trace Runs
  if (endpoint === '/agents/runs') {
    return {
      traces: [
        {
          id: 1,
          event_name: 'ASSESSMENT_POOR',
          agent_name: 'Orchestrator',
          input_summary: 'JavaScript quiz submitted: score 48%',
          output_summary: 'Triggered sequential re-plan pipeline: Progress Evaluator -> Skill Gap -> Curriculum Planner',
          duration_ms: 120,
          used_llm: false,
          status: 'success',
          created_at: '2026-11-14T10:00:00Z',
        },
        {
          id: 2,
          event_name: 'ASSESSMENT_POOR',
          agent_name: 'Progress Evaluator',
          input_summary: 'Score 48% < 60% threshold for JavaScript',
          output_summary: 'Flagged 3 weak topics: Event Loop, Closures, Concurrency. Declared remedial flag.',
          duration_ms: 95,
          used_llm: true,
          status: 'success',
          created_at: '2026-11-14T10:00:01Z',
        },
        {
          id: 3,
          event_name: 'ASSESSMENT_POOR',
          agent_name: 'Skill Gap Agent',
          input_summary: 'Re-prioritize gaps with remedial constraint',
          output_summary: 'Ranked JavaScript as priority #1 Critical. Prerequisite chain enforced before React.',
          duration_ms: 88,
          used_llm: false,
          status: 'success',
          created_at: '2026-11-14T10:00:02Z',
        },
        {
          id: 4,
          event_name: 'ASSESSMENT_POOR',
          agent_name: 'Curriculum Planner',
          input_summary: '10h weekly budget, 3 remedial topics',
          output_summary: 'Inserted Remedial Phase 1 (12 hours). Emitted Roadmap Version 2 with reason diff.',
          duration_ms: 145,
          used_llm: true,
          status: 'success',
          created_at: '2026-11-14T10:00:03Z',
        },
        {
          id: 5,
          event_name: 'ASSESSMENT_POOR',
          agent_name: 'Resource Recommender',
          input_summary: 'Select 3 targeted resources for remedial topics',
          output_summary: 'Recommended Lydia Hallie Event Loop visualizer and LeetCode closure drill.',
          duration_ms: 110,
          used_llm: false,
          status: 'success',
          created_at: '2026-11-14T10:00:04Z',
        },
        {
          id: 6,
          event_name: 'ASSESSMENT_POOR',
          agent_name: 'Mentor Agent',
          input_summary: 'Synthesize empathetic diagnostic feedback',
          output_summary: 'Generated tailored diagnostic coaching message and dashboard prompt chips.',
          duration_ms: 105,
          used_llm: true,
          status: 'success',
          created_at: '2026-11-14T10:00:05Z',
        },
      ],
      nodes: [
        { id: 'orch', name: 'Orchestrator', type: 'coordinator', role: 'Event Pipeline Manager' },
        { id: 'prof', name: 'Profile Analyst', type: 'agent', role: 'Skill Normalization' },
        { id: 'match', name: 'Career Matcher', type: 'agent', role: 'Role Benchmark Scoring' },
        { id: 'gap', name: 'Skill Gap Agent', type: 'agent', role: 'Prerequisite DAG Ranking' },
        { id: 'plan', name: 'Curriculum Planner', type: 'agent', role: 'Timeline & Phase Builder' },
        { id: 'res', name: 'Resource Recommender', type: 'agent', role: 'Catalog Curator' },
        { id: 'eval', name: 'Progress Evaluator', type: 'agent', role: 'Adaptive Triggers' },
        { id: 'mentor', name: 'Mentor Agent', type: 'agent', role: 'Conversational Guidance' },
      ],
      edges: [
        { from: 'orch', to: 'eval', label: 'Score Trigger' },
        { from: 'eval', to: 'gap', label: 'Weak Topics' },
        { from: 'gap', to: 'plan', label: 'Prioritized Gaps' },
        { from: 'plan', to: 'res', label: 'Phase Milestones' },
        { from: 'res', to: 'mentor', label: 'Curated Path' },
      ],
      stats: {
        total_runs: 8,
        llm_runs: 5,
        fallback_runs: 3,
        avg_latency_ms: 112,
      },
    } as unknown as T;
  }

  // Org Cohort
  if (endpoint === '/org/cohort') {
    return {
      total_learners: 42,
      avg_readiness: 41.5,
      top_target_roles: [
        { role: 'Full Stack Developer', count: 18 },
        { role: 'Backend Engineer', count: 12 },
        { role: 'Data Engineer', count: 8 },
        { role: 'DevOps Engineer', count: 4 },
      ],
      cohort: [
        {
          user_id: 1,
          name: 'Arjun Kumar',
          email: 'arjun.kumar@skillpath.ai',
          target_role: 'Full Stack Developer',
          readiness_pct: 32.0,
          streak_days: 6,
          top_gaps: ['JavaScript', 'React', 'Node.js'],
          last_active: 'Just now',
        },
        {
          user_id: 2,
          name: 'Sneha Patel',
          email: 'sneha.patel@example.com',
          target_role: 'Backend Engineer',
          readiness_pct: 78.0,
          streak_days: 14,
          top_gaps: ['Docker', 'Distributed Queues'],
          last_active: '2h ago',
        },
        {
          user_id: 3,
          name: 'Rohan Verma',
          email: 'rohan.verma@example.com',
          target_role: 'Data Engineer',
          readiness_pct: 65.0,
          streak_days: 9,
          top_gaps: ['PySpark', 'Airflow'],
          last_active: '5h ago',
        },
      ],
      skill_heatmap: [
        { skill_id: 'javascript', skill_name: 'JavaScript', category: 'Languages', avg_level: 2.1, target_level: 4.0, gap_count: 29, criticality: 'High' },
        { skill_id: 'docker', skill_name: 'Docker', category: 'DevOps', avg_level: 1.8, target_level: 3.0, gap_count: 24, criticality: 'High' },
        { skill_id: 'react', skill_name: 'React', category: 'Frontend', avg_level: 1.5, target_level: 4.0, gap_count: 21, criticality: 'High' },
        { skill_id: 'sql', skill_name: 'SQL', category: 'Databases', avg_level: 3.4, target_level: 3.5, gap_count: 6, criticality: 'Low' },
        { skill_id: 'python', skill_name: 'Python', category: 'Languages', avg_level: 3.8, target_level: 4.0, gap_count: 4, criticality: 'Low' },
      ],
    } as unknown as T;
  }

  return {} as T;
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
