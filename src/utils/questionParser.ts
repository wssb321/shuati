export interface Question {
  id: number;
  type: 'single' | 'multiple';
  question: string;
  text?: string;
  options: { key: string; value: string }[];
  correctAnswer: string[];
  userAnswer?: string[];
  score: number;
  explanation: string;
  knowledgePoints: string[];
  chapter?: string;
  wrongInfo?: {
    wrongCount: number;
    lastWrongTime: number;
    previousUserAnswer: string[];
  };
}

export interface QuestionGroup {
  title: string;
  questions: Question[];
}

export function parseQuestionFile(content: string): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentGroup: QuestionGroup | null = null;
  let currentQuestion: Partial<Question> | null = null;
  let inOptions = false;
  let inExplanation = false;
  let inKnowledge = false;
  
  for (const line of lines) {
    if (line.startsWith('一.') || line.startsWith('二.') || line.startsWith('三.') || line.startsWith('四.') || line.startsWith('五.')) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = { title: line, questions: [] };
      continue;
    }
    
    if (!currentGroup) continue;
    
    const questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)(.+)/);
    if (questionMatch) {
      if (currentQuestion) {
        currentGroup.questions.push(currentQuestion as Question);
      }
      currentQuestion = {
        id: parseInt(questionMatch[1]),
        type: questionMatch[2] === '单选题' ? 'single' : 'multiple',
        question: questionMatch[3],
        options: [],
        correctAnswer: [],
        score: 0,
        explanation: '',
        knowledgePoints: []
      };
      inOptions = true;
      inExplanation = false;
      inKnowledge = false;
      continue;
    }
    
    if (currentQuestion && inOptions && !line.includes('我的答案') && !line.includes('正确答案') && !line.includes('分') && !line.includes('答案解析') && !line.includes('知识点')) {
      const optionMatch = line.match(/^([A-D])\.\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push({
          key: optionMatch[1],
          value: optionMatch[2]
        });
      }
      continue;
    }
    
    if (line.includes('我的答案') && line.includes('正确答案')) {
      const correctStart = line.indexOf('正确答案:') + 5;
      const semicolonPos = line.indexOf(';', correctStart);
      if (correctStart > 0 && semicolonPos > correctStart) {
        const correctPart = line.substring(correctStart, semicolonPos);
        const answerPart = correctPart.split(':')[0];
        currentQuestion!.correctAnswer = answerPart.split('');
        inOptions = false;
        continue;
      }
    }
    
    const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
    if (scoreMatch) {
      currentQuestion!.score = parseFloat(scoreMatch[1]);
      continue;
    }
    
    if (line.includes('答案解析：')) {
      currentQuestion!.explanation = line.replace('答案解析：', '');
      inExplanation = true;
      continue;
    }
    
    if (line.includes('知识点：')) {
      inExplanation = false;
      inKnowledge = true;
      continue;
    }
    
    if (inKnowledge && line && !line.includes('AI讲解')) {
      currentQuestion!.knowledgePoints.push(line);
    }
    
    if (line === 'AI讲解') {
      inKnowledge = false;
    }
  }
  
  if (currentQuestion && currentGroup) {
    currentGroup.questions.push(currentQuestion as Question);
  }
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  return groups;
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}