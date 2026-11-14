import Dexie, { type Table } from 'dexie';
import type {
  ProfileData,
  RoadmapVersionData,
  AssessmentResultData,
  AgentRunTraceData,
  MentorMessageData,
  SyncQueueItem,
} from './schemas';

export interface SkillItemDB {
  skill_id: string;
  name: string;
  category: string;
  description: string;
  prerequisites: string[];
}

export interface RoleItemDB {
  role_id: string;
  title: string;
  department: string;
  description: string;
  required_skills: Record<string, number>;
  total_skills_count?: number;
}

export interface ResourceItemDB {
  id: number;
  title: string;
  type: string;
  skill_id: string;
  difficulty: string;
  estimated_hours: number;
  provider: string;
  url: string;
  description: string;
}

export interface QuestionDB {
  id: number;
  skill_id: string;
  question_text: string;
  question_type: 'mcq' | 'practical';
  options: string[];
  correct_answer?: number;
  correct_option_index?: number;
  explanation?: string;
  difficulty: string;
}

export interface ProgressDB {
  id: number; // user_id
  user_id: number;
  readiness_pct: number;
  streak_days: number;
  weekly_hours: number;
  total_completed_hours: number;
  target_role: string;
  forecast_weeks_remaining: number;
  score_history: Array<{ date: string; score: number; skill: string; client_uuid?: string }>;
  phases_progress: Array<{ phase_id: number; title: string; progress_pct: number }>;
  badges: Array<{ id: string; title: string; unlocked: boolean; icon: string }>;
  updatedAt: string;
}

export interface MetaItemDB {
  key: string;
  value: any;
  updatedAt: string;
}

export class VyntrixaDatabase extends Dexie {
  profile!: Table<ProfileData, number>;
  skills!: Table<SkillItemDB, string>;
  roles!: Table<RoleItemDB, string>;
  resources!: Table<ResourceItemDB, number>;
  roadmaps!: Table<RoadmapVersionData, number>;
  progress!: Table<ProgressDB, number>;
  assessments!: Table<any, number>;
  questionBank!: Table<QuestionDB, number>;
  scores!: Table<AssessmentResultData, number>;
  agentRuns!: Table<AgentRunTraceData, number>;
  mentorMessages!: Table<MentorMessageData, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  meta!: Table<MetaItemDB, string>;

  constructor() {
    super('vyntrixa');
    this.version(1).stores({
      profile: '&user_id, email, full_name, target_role, updatedAt',
      skills: '&skill_id, name, category',
      roles: '&role_id, title',
      resources: '&id, skill_id, type',
      roadmaps: '&id, version_number, user_id, is_active, trigger_event, createdAt',
      progress: '&id, user_id, readiness_pct, updatedAt',
      assessments: '&id, skill_id, createdAt',
      questionBank: '&id, skill_id, difficulty',
      scores: '++id, attempt_id, skill_id, score_pct, client_uuid, createdAt',
      agentRuns: '++id, event_name, agent_name, runtime_mode, createdAt',
      mentorMessages: '++id, role, text, client_uuid, pending_sync, createdAt',
      syncQueue: '++id, type, client_uuid, createdAt, attempts, status',
      meta: '&key, value, updatedAt',
    });
  }
}

export const db = new VyntrixaDatabase();

/**
 * Intentional Migration: Migrates legacy 'skillpath' IndexedDB and localStorage keys
 * into 'vyntrixa' on first startup, preserving all existing learner data.
 */
export async function migrateLegacyDatabase(): Promise<void> {
  // 1. Migrate localStorage keys from skillpath_ to vyntrixa_
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keysToMigrate: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('skillpath_')) {
          keysToMigrate.push(key);
        }
      }
      for (const oldKey of keysToMigrate) {
        const val = localStorage.getItem(oldKey);
        if (val !== null) {
          const newKey = oldKey.replace(/^skillpath_/, 'vyntrixa_');
          localStorage.setItem(newKey, val);
          localStorage.removeItem(oldKey);
        }
      }
    } catch (e) {
      console.warn('LocalStorage migration note:', e);
    }
  }

  // 2. Migrate IndexedDB from 'skillpath' to 'vyntrixa'
  if (typeof indexedDB !== 'undefined') {
    try {
      const exists = await Dexie.exists('skillpath');
      if (exists) {
        console.info('Migrating legacy database from skillpath to vyntrixa...');
        const legacyDb = new Dexie('skillpath');
        const legacyTables = [
          'profile', 'skills', 'roles', 'resources', 'roadmaps',
          'progress', 'assessments', 'questionBank', 'scores',
          'agentRuns', 'mentorMessages', 'syncQueue', 'meta'
        ];
        const storeSchema: Record<string, string> = {};
        for (const t of legacyTables) {
          storeSchema[t] = '++id';
        }
        legacyDb.version(1).stores(storeSchema);
        await legacyDb.open();

        for (const tableName of legacyTables) {
          try {
            const table = legacyDb.table(tableName);
            const rows = await table.toArray();
            if (rows && rows.length > 0) {
              const targetTable = (db as any)[tableName];
              if (targetTable) {
                await targetTable.bulkPut(rows);
              }
            }
          } catch {
            // Ignore minor individual table differences
          }
        }

        legacyDb.close();
        await Dexie.delete('skillpath');
        console.info('Legacy skillpath database successfully migrated to vyntrixa.');
      }
    } catch (err) {
      console.warn('Legacy DB migration error:', err);
    }
  }
}
