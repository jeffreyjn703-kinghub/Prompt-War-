import { LocalLearnerContext } from './types';
import questionSeed from '../data/seed/questions.json';

export interface AssessmentSubmission {
  skill_id: string;
  answers: Record<number | string, number>;
  practical_text?: string;
  questions?: Array<{
    id: number | string;
    question_text: string;
    question_type: string;
    options?: string[];
    correct_answer?: number;
    practical_rubric?: string;
  }>;
}

export class AssessmentEvaluatorLocal {
  name = 'Assessment Evaluator';

  evaluate(context: LocalLearnerContext, submission: AssessmentSubmission) {
    const { skill_id, answers, practical_text = '', questions: customQuestions } = submission;
    
    // Resolve questions from custom passed or seed
    let questions = customQuestions;
    if (!questions || questions.length === 0) {
      const bank = (questionSeed as Record<string, any>)[skill_id];
      if (bank) {
        const mcqs = (bank.mcqs || []).map((m: any, idx: number) => ({
          id: idx + 1,
          question_text: m.question_text,
          question_type: 'mcq',
          options: m.options,
          correct_answer: m.correct_answer,
          explanation: m.explanation || ''
        }));
        const practical = bank.practical ? [{
          id: 99,
          question_text: bank.practical.question_text,
          question_type: 'practical',
          practical_rubric: bank.practical.rubric || '',
          explanation: 'Practical implementation rubric'
        }] : [];
        questions = [...mcqs, ...practical];
      } else {
        questions = [];
      }
    }

    const mcqQuestions = questions.filter(q => q.question_type === 'mcq');
    const practicalQuestions = questions.filter(q => q.question_type === 'practical');

    const totalMcq = mcqQuestions.length;
    let correctMcq = 0;
    const weakTopics: string[] = [];

    for (const q of mcqQuestions) {
      const userAns = answers[q.id];
      if (userAns !== undefined && userAns === q.correct_answer) {
        correctMcq += 1;
      } else {
        const topic = q.question_text.slice(0, 50) + '...';
        weakTopics.push(topic);
      }
    }

    let practicalScore = 0;
    if (practicalQuestions.length > 0 && practical_text.trim()) {
      const pq = practicalQuestions[0];
      const rubricWords = (pq.practical_rubric || '')
        .split(',')
        .map(w => w.trim().toLowerCase())
        .filter(Boolean);
      const userLower = practical_text.toLowerCase();
      const matchedWords = rubricWords.filter(w => userLower.includes(w));
      if (rubricWords.length > 0) {
        practicalScore = Math.min(20, Math.floor((matchedWords.length / rubricWords.length) * 20));
      } else {
        practicalScore = 15;
      }
    } else if (practicalQuestions.length > 0) {
      weakTopics.push('Practical coding implementation');
    }

    const mcqWeight = 80.0;
    const mcqEarned = (correctMcq / Math.max(totalMcq, 1)) * mcqWeight;
    const totalScorePct = Math.round((mcqEarned + practicalScore) * 10) / 10;

    let verifiedLevel = 1;
    let triggerAction: 'ASSESSMENT_STRONG' | 'ASSESSMENT_POOR' | 'NONE' = 'NONE';
    let passed = false;

    if (totalScorePct >= 85.0) {
      verifiedLevel = 4;
      triggerAction = 'ASSESSMENT_STRONG';
      passed = true;
    } else if (totalScorePct >= 65.0) {
      verifiedLevel = 3;
      triggerAction = 'NONE';
      passed = true;
    } else if (totalScorePct >= 50.0) {
      verifiedLevel = 2;
      triggerAction = 'NONE';
      passed = false;
    } else {
      verifiedLevel = 1;
      triggerAction = 'ASSESSMENT_POOR';
      passed = false;
    }

    if (totalScorePct < 60.0) {
      triggerAction = 'ASSESSMENT_POOR';
    }

    // Update context verified skills
    context.verified_skills[skill_id] = verifiedLevel;
    const result = {
      attempt_id: Date.now(),
      skill_id,
      score_pct: totalScorePct,
      passed,
      total_questions: questions.length,
      correct_questions: correctMcq + (practicalScore >= 10 ? 1 : 0),
      new_verified_level: verifiedLevel,
      weak_topics: weakTopics.slice(0, 3),
      trigger_action: triggerAction
    };

    context.assessment_result = result;
    return result;
  }
}
