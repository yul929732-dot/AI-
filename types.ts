
export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  avatar?: string;
}

// --- Enhanced Video Types ---
export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  duration: number;
}

export interface VideoQuiz {
  id: string;
  timestamp: number; // Trigger time in seconds
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: string; // Display string "10:00"
  durationSec: number; // Total seconds for logic
  category: string;
  uploaderId: string;
  uploadDate: number;
  chapters?: VideoChapter[];
  quizzes?: VideoQuiz[];
}

export interface VideoProgress {
  videoId: string;
  timestamp: number;
  completed: boolean;
  lastUpdated: number;
}

// --- Tutoring Types ---
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  frequency: number;
}

export interface TutoringSession {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  type: 'live' | '1on1';
  status: 'upcoming' | 'completed' | 'live';
  avatar: string;
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
  ONLINE_TUTORING = 'ONLINE_TUTORING', // Replaces AI_ASSISTANT
  AI_QUIZ = 'AI_QUIZ',
  STUDENT_PROFILE = 'STUDENT_PROFILE',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  AI_REPORT = 'AI_REPORT',
  AI_COURSEWARE = 'AI_COURSEWARE',
}

export interface Note {
  id: string;
  text: string;
  timestamp: number;
  videoId?: string;
  videoTimestamp?: number;
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

export interface QuizConfig {
  topic: string;
  fileContent?: string;
  questionType: 'all' | 'multiple_choice' | 'subjective';
  questionCount: number;
  timeLimit: number;
}

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
  day: string;
  timeSlot: string;
  courseName: string;
  location?: string;
}

// --- Analytics Types ---
export interface LearningStats {
  totalStudyHours: number;
  completedCourses: number;
  quizAccuracy: number;
  weakPoints: string[];
  learningTrend: number[];
}

// --- Report Types ---
export interface ReportAnalysis {
  scores: {
    relevance: number;
    logic: number;
    coverage: number;
    style: number;
  };
  overallScore: number;
  suggestions: string[];
  comparison?: string;
}

// --- Courseware Types ---
export interface Slide {
  id: number;
  title: string;
  content: string[];
  imagePrompt?: string;
}
