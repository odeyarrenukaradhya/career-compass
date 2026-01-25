/**
 * Mock Data Store
 * In-memory data storage for quizzes, attempts, and statistics
 */

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of correct option
}

export interface Quiz {
  id: string;
  code: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number; // in minutes
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, number>; // questionId -> selectedOption
  score: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  violations: Violation[];
}

export interface Violation {
  type: 'tab-switch' | 'window-blur' | 'right-click' | 'copy-paste' | 'fast-answering';
  timestamp: string;
  details?: string;
}

export interface PlatformStats {
  totalStudents: number;
  totalAdmins: number;
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
}

// In-memory storage
let quizzes: Quiz[] = [
  {
    id: 'quiz-001',
    code: 'TECH101',
    title: 'Technical Aptitude Test',
    description: 'Test your technical knowledge with this comprehensive aptitude test covering programming basics, data structures, and algorithms.',
    questions: [
      {
        id: 'q1',
        text: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        text: 'Which data structure uses LIFO principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        text: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'Sequential Query Language'],
        correctAnswer: 0,
      },
      {
        id: 'q4',
        text: 'Which of these is NOT a JavaScript framework?',
        options: ['React', 'Angular', 'Django', 'Vue'],
        correctAnswer: 2,
      },
      {
        id: 'q5',
        text: 'What is the purpose of an API?',
        options: ['Store data', 'Enable communication between systems', 'Compile code', 'Debug applications'],
        correctAnswer: 1,
      },
    ],
    duration: 15,
    createdBy: 'admin-001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isActive: true,
  },
  {
    id: 'quiz-002',
    code: 'COMM201',
    title: 'Communication Skills Assessment',
    description: 'Evaluate your verbal and written communication abilities essential for professional success.',
    questions: [
      {
        id: 'q1',
        text: 'What is the most important aspect of effective communication?',
        options: ['Speaking loudly', 'Active listening', 'Using complex vocabulary', 'Talking fast'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        text: 'Which of these is a barrier to effective communication?',
        options: ['Eye contact', 'Assumptions', 'Feedback', 'Clarity'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        text: 'In professional emails, which greeting is most appropriate?',
        options: ['Hey!', 'Dear Sir/Madam', 'Yo', 'Sup'],
        correctAnswer: 1,
      },
    ],
    duration: 10,
    createdBy: 'admin-001',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isActive: true,
  },
];

let attempts: QuizAttempt[] = [
  {
    id: 'attempt-001',
    quizId: 'quiz-001',
    studentId: 'student-001',
    studentName: 'John Student',
    answers: { q1: 1, q2: 1, q3: 0, q4: 2, q5: 1 },
    score: 5,
    totalQuestions: 5,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    submittedAt: new Date(Date.now() - 3000000).toISOString(),
    violations: [],
  },
];

// Quiz Functions
export const getQuizzes = (): Quiz[] => quizzes.filter(q => q.isActive);

export const getAllQuizzes = (): Quiz[] => quizzes;

export const getQuizByCode = (code: string): Quiz | undefined => 
  quizzes.find(q => q.code.toLowerCase() === code.toLowerCase() && q.isActive);

export const getQuizById = (id: string): Quiz | undefined => 
  quizzes.find(q => q.id === id);

export const createQuiz = (quiz: Omit<Quiz, 'id' | 'createdAt'>): Quiz => {
  const newQuiz: Quiz = {
    ...quiz,
    id: `quiz-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  quizzes.push(newQuiz);
  return newQuiz;
};

export const updateQuiz = (id: string, updates: Partial<Quiz>): Quiz | undefined => {
  const index = quizzes.findIndex(q => q.id === id);
  if (index === -1) return undefined;
  
  quizzes[index] = { ...quizzes[index], ...updates };
  return quizzes[index];
};

export const deleteQuiz = (id: string): boolean => {
  const index = quizzes.findIndex(q => q.id === id);
  if (index === -1) return false;
  
  quizzes[index].isActive = false;
  return true;
};

// Attempt Functions
export const getAttempts = (): QuizAttempt[] => attempts;

export const getAttemptsByQuiz = (quizId: string): QuizAttempt[] => 
  attempts.filter(a => a.quizId === quizId);

export const getAttemptsByStudent = (studentId: string): QuizAttempt[] => 
  attempts.filter(a => a.studentId === studentId);

export const hasAttempted = (quizId: string, studentId: string): boolean =>
  attempts.some(a => a.quizId === quizId && a.studentId === studentId);

export const createAttempt = (attempt: Omit<QuizAttempt, 'id'>): QuizAttempt => {
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: `attempt-${Date.now()}`,
  };
  attempts.push(newAttempt);
  return newAttempt;
};

export const addViolation = (attemptId: string, violation: Violation): void => {
  const attempt = attempts.find(a => a.id === attemptId);
  if (attempt) {
    attempt.violations.push(violation);
  }
};

// Statistics
export const getPlatformStats = (): PlatformStats => {
  const totalScore = attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0);
  
  return {
    totalStudents: 156, // Mock data
    totalAdmins: 8,
    totalQuizzes: quizzes.filter(q => q.isActive).length,
    totalAttempts: attempts.length,
    averageScore: attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0,
  };
};

// Generate unique quiz code
export const generateQuizCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
