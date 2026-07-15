/* ==============================
   Curriculum Type Definitions
   ============================== */

export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  lessonIds: string[];
}

export type LessonType = 'learn' | 'build' | 'capstone';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type QuizQuestion =
  | { type: 'multiple-choice'; question: string; options: string[]; correctIndex: number; explanation?: string }
  | { type: 'fill-blank'; question: string; answer: string; explanation?: string }
  | { type: 'true-false'; question: string; correctAnswer: boolean; explanation?: string };

export type LessonSection =
  | { type: 'text'; body: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'command'; prompt: string; cmd: string; output?: string }
  | { type: 'yaml'; filename: string; code: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'diagram'; lines: string[] }
  | { type: 'uml'; preset: string; title?: string }
  | { type: 'note'; body: string }
  | { type: 'warning'; body: string }
  | { type: 'quiz'; title?: string; questions: QuizQuestion[] };

export interface Lesson {
  id: string;
  phaseId: string;
  number: number;
  title: string;
  type: LessonType;
  difficulty: Difficulty;
  duration: string;
  sections: LessonSection[];
  commands?: string[];
}
