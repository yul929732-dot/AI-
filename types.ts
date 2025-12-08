
export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role; // Added role
  avatar?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: string;
  category: string;
  uploaderId: string; // Link to teacher
  uploadDate: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  VIDEO_PLAYER = 'VIDEO_PLAYER',
  AI_ASSISTANT = 'AI_ASSISTANT',
  AI_QUIZ = 'AI_QUIZ',
  STUDENT_PROFILE = 'STUDENT_PROFILE', // New
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD', // New
}

export interface Note {
  id: string;
  text: string;
  timestamp: number;
}

// --- Chat Types ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Quiz Types ---
export type QuestionType = 'multiple_choice' | 'subjective';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface MistakeRecord {
  id: string;
  question: QuizQuestion;
  wrongAnswer: string | number;
  timestamp: number;
  topic: string;
}

// --- Schedule Types ---
export interface ScheduleItem {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  timeSlot: string; // "08:00-09:00"
  courseName: string;
  location?: string;
}

// --- Analytics Types ---
export interface LearningStats {
  totalStudyHours: number;
  completedCourses: number;
  quizAccuracy: number;
  weakPoints: string[]; // e.g. ["History", "Math"]
  learningTrend: number[]; // Last 7 days minutes
}
