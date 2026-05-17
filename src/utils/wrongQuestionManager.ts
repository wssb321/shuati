export interface WrongQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: { key: string; value: string }[];
  correctAnswer: string[];
  userAnswer: string[];
  explanation: string;
  knowledgePoints: string[];
  wrongCount: number;
  lastWrongTime: number;
  consecutiveCorrect: number;
  sourceQuiz: string;
}

const STORAGE_KEY = 'quiz_wrong_questions';

export function saveWrongQuestion(question: any, userAnswer: string[], sourceQuiz: string) {
  const wrongQuestions = getWrongQuestions();
  const id = `${sourceQuiz}_${question.id}`;
  
  const existingQuestion = wrongQuestions.find(q => q.id === id);
  
  if (existingQuestion) {
    existingQuestion.wrongCount += 1;
    existingQuestion.lastWrongTime = Date.now();
    existingQuestion.userAnswer = userAnswer;
    existingQuestion.consecutiveCorrect = 0;
  } else {
    wrongQuestions.push({
      id,
      question: question.question,
      type: question.type,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer,
      explanation: question.explanation,
      knowledgePoints: question.knowledgePoints,
      wrongCount: 1,
      lastWrongTime: Date.now(),
      consecutiveCorrect: 0,
      sourceQuiz
    });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wrongQuestions));
}

export function recordCorrectAnswer(questionId: number, sourceQuiz: string): boolean {
  const wrongQuestions = getWrongQuestions();
  const id = `${sourceQuiz}_${questionId}`;
  
  const existingQuestion = wrongQuestions.find(q => q.id === id);
  
  if (!existingQuestion) {
    return false;
  }
  
  existingQuestion.consecutiveCorrect += 1;
  
  // 如果连续答对3次，从错题库中移除
  if (existingQuestion.consecutiveCorrect >= 3) {
    const filtered = wrongQuestions.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wrongQuestions));
  return false;
}

export function getWrongQuestions(): WrongQuestion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function removeWrongQuestion(id: string) {
  const wrongQuestions = getWrongQuestions();
  const filtered = wrongQuestions.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearWrongQuestions() {
  localStorage.removeItem(STORAGE_KEY);
}

export function convertToQuestion(wrongQuestion: WrongQuestion): any {
  return {
    id: parseInt(wrongQuestion.id.split('_').pop() || '0'),
    type: wrongQuestion.type,
    question: wrongQuestion.question,
    options: wrongQuestion.options,
    correctAnswer: wrongQuestion.correctAnswer,
    score: 0,
    explanation: wrongQuestion.explanation,
    knowledgePoints: wrongQuestion.knowledgePoints,
    wrongInfo: {
      wrongCount: wrongQuestion.wrongCount,
      lastWrongTime: wrongQuestion.lastWrongTime,
      previousUserAnswer: wrongQuestion.userAnswer
    }
  };
}
