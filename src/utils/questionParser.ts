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
  
  console.log(`解析题库: ${lines.length} 行`);
  
  let currentGroup: QuestionGroup | null = null;
  let currentQuestion: Partial<Question> | null = null;
  let inOptions = false;
  let inExplanation = false;
  let currentExplanation = '';
  
  // 尝试从标题中提取总分
  let totalScore = 0;
  let totalQuestions = 0;
  
  // 检测文件格式类型
  let formatType: 'standard' | 'simple' = 'standard';
  
  // 检查第一行是否是章节标题（如"一、单选题"或"（一）单选题"）
  const firstLine = lines[0] || '';
  const hasChapterTitle = firstLine.match(/^(一|二|三|四|五|六|七|八|九|十|十一|十二)[、.．](.*)$/) || 
                          firstLine.match(/^（(一|二|三|四|五|六|七|八|九|十|十一|十二)）(.*)$/);
  const hasTypeMarker = firstLine.match(/\(单选题\)|\(多选题\)/);
  
  // 如果第一行既不是章节标题，也没有题目类型标识，认为是简化格式
  if (!hasChapterTitle && !hasTypeMarker) {
    formatType = 'simple';
  }
  
  console.log(`检测到格式类型: ${formatType}`);
  
  // 如果是简化格式，创建一个默认组
  if (formatType === 'simple') {
    currentGroup = { title: '全部题目', questions: [] };
  }
  
  for (const line of lines) {
    // 匹配章节标题（支持多种格式）
    const chapterMatch = line.match(/^(一|二|三|四|五|六|七|八|九|十)[、.．](.*)$/) || 
                        line.match(/^（(一|二|三|四|五|六|七|八|九|十)）(.*)$/);
    if (chapterMatch) {
      // 如果有未完成的题目，先保存
      if (currentQuestion && currentGroup) {
        currentQuestion.explanation = currentExplanation.trim();
        currentGroup.questions.push(currentQuestion as Question);
        currentQuestion = null;
        currentExplanation = '';
      }
      
      if (currentGroup) {
        groups.push(currentGroup);
      }
      
      // 提取标题（中文括号格式匹配的是第3组，其他格式匹配的是第2组）
      const title = chapterMatch.length === 4 ? chapterMatch[3] : chapterMatch[2];
      currentGroup = { title, questions: [] };
      
      // 从标题中提取分数和题目数量
      const scoreMatch = title.match(/共(\d+)题.*?(\d+\.?\d*)分/);
      if (scoreMatch) {
        totalQuestions = parseInt(scoreMatch[1]);
        totalScore = parseFloat(scoreMatch[2]);
      }
      
      continue;
    }
    
    if (!currentGroup) continue;
    
    // 匹配题目（支持多种格式）
    // 格式1: 1. (单选题) 问题内容?
    // 格式2: 1.(单选题)问题内容
    // 格式3: 1. 问题内容? (简化格式，默认单选题)
    let questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)\s*(.+)/);
    
    // 如果没有匹配到带类型的格式，尝试简化格式（标准格式下也支持）
    if (!questionMatch) {
      questionMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (questionMatch) {
        // 从章节标题判断类型，如果没有则默认单选题
        let questionType: 'single' | 'multiple' = 'single';
        if (currentGroup?.title.includes('多选题')) {
          questionType = 'multiple';
        } else if (currentGroup?.title.includes('单选题')) {
          questionType = 'single';
        }
        
        if (currentQuestion) {
          currentGroup.questions.push(currentQuestion as Question);
        }
        
        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
        
        currentQuestion = {
          id: parseInt(questionMatch[1]),
          type: questionType,
          question: questionMatch[2],
          options: [],
          correctAnswer: [],
          score: avgScore,
          explanation: '',
          knowledgePoints: []
        };
        inOptions = true;
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
    }
    
    if (questionMatch) {
      if (currentQuestion) {
        currentGroup.questions.push(currentQuestion as Question);
      }
      
      const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
      
      currentQuestion = {
        id: parseInt(questionMatch[1]),
        type: questionMatch[2] === '单选题' ? 'single' : 'multiple',
        question: questionMatch[3],
        options: [],
        correctAnswer: [],
        score: avgScore,
        explanation: '',
        knowledgePoints: []
      };
      inOptions = true;
      inExplanation = false;
      currentExplanation = '';
      continue;
    }
    
    // 匹配选项（支持多种格式）
    if (currentQuestion && inOptions) {
      // 格式1: A. 选项内容
      // 格式2: A、选项内容
      // 格式3: A 选项内容
      const optionMatch = line.match(/^([A-D])[．.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push({
          key: optionMatch[1],
          value: optionMatch[2]
        });
        continue;
      }
      
      // 检查是否是分数行（如"3.3分"）- 在选项阶段也需要处理
      const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
      if (scoreMatch) {
        currentQuestion.score = parseFloat(scoreMatch[1]);
        continue;
      }
      
      // 检查是否是知识点行或AI讲解行（跳过）
      const knowledgeMatch = line.match(/^(知识点|AI讲解)/);
      if (knowledgeMatch) {
        continue;
      }
      
      // 如果不是选项，检查是否是答案行
      const answerMatch = line.match(/^答案[：:]?\s*([A-D,，、]+)/);
      if (answerMatch) {
        const answerStr = answerMatch[1];
        // 支持逗号和顿号分隔的多个答案（多选题）
        currentQuestion.correctAnswer = answerStr.replace(/[，,、]/g, '').split('');
        // 判断是否是多选题（多个答案）
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        inOptions = false;
        inExplanation = true;
        continue;
      }
      
      // 新格式的答案行（我的答案:A:wx.getFuzzyLocation;正确答案:A:wx.getFuzzyLocation;）
      const newAnswerMatch = line.match(/正确答案[：:]\s*([A-D,，、]+)/);
      if (newAnswerMatch) {
        const answerStr = newAnswerMatch[1];
        // 提取纯字母答案，去掉后面的内容（如 ":选项内容"）
        const pureAnswer = answerStr.match(/^[A-D,，、]+/)?.[0] || answerStr;
        currentQuestion.correctAnswer = pureAnswer.replace(/[，,、]/g, '').split('');
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        inOptions = false;
        inExplanation = true;
        continue;
      }
      
      // 如果以上都不匹配，说明这行不属于选项部分，进入解析部分
      inOptions = false;
      inExplanation = true;
      currentExplanation = line;
    }
    
    // 处理解析部分
    if (currentQuestion && inExplanation) {
      // 检查是否是章节标题（支持多种格式）
      const chapterMatch = line.match(/^(一|二|三|四|五|六|七|八|九|十)[、.．](.*)$/) || 
                          line.match(/^（(一|二|三|四|五|六|七|八|九|十)）(.*)$/);
      if (chapterMatch) {
        // 将当前题目添加到组
        currentQuestion.explanation = currentExplanation.trim();
        currentGroup.questions.push(currentQuestion as Question);
        
        // 开始新章节
        const title = chapterMatch.length === 4 ? chapterMatch[3] : chapterMatch[2];
        currentGroup = { title, questions: [] };
        
        // 从标题中提取分数和题目数量
        const scoreMatch = title.match(/共(\d+)题.*?(\d+\.?\d*)分/);
        if (scoreMatch) {
          totalQuestions = parseInt(scoreMatch[1]);
          totalScore = parseFloat(scoreMatch[2]);
        }
        
        currentQuestion = null;
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
      
      // 先处理特殊行（分数行、知识点、解析等），避免被误识别为新题目
      
      // 检查是否是分数行（如"3.3分"）
      const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
      if (scoreMatch) {
        currentQuestion.score = parseFloat(scoreMatch[1]);
        continue;
      }
      
      // 检查是否是知识点行或AI讲解行（跳过）
      const knowledgeMatch = line.match(/^(知识点|AI讲解)/);
      if (knowledgeMatch) {
        continue;
      }
      
      // 检查是否是解析开头行（支持"解析："和"答案解析："格式）
      const explanationStartMatch = line.match(/^(答案)?解析[：:]?\s*(.+)/);
      if (explanationStartMatch) {
        // 添加解析内容（去掉"解析："或"答案解析："前缀）
        currentExplanation = explanationStartMatch[2] || '';
        continue;
      }
      
      // 检查是否是答案行（在解析中间出现）
      const answerMatch = line.match(/^答案[：:]?\s*([A-D,，、]+)/);
      if (answerMatch) {
        const answerStr = answerMatch[1];
        currentQuestion.correctAnswer = answerStr.replace(/[，,、]/g, '').split('');
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        continue;
      }
      
      // 检查是否是新题开始（带类型标识）
      const newQuestionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)/);
      if (newQuestionMatch) {
        // 将当前题目添加到组
        currentQuestion.explanation = currentExplanation.trim();
        currentGroup.questions.push(currentQuestion as Question);
        
        // 开始新题目
        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
        
        // 提取问题内容（去掉题号和类型标识）
        let questionContent = line.replace(/^\d+\.\s*/, '').replace(/\(单选题\)|\(多选题\)/g, '').trim();
        
        currentQuestion = {
          id: parseInt(newQuestionMatch[1]),
          type: newQuestionMatch[2] === '单选题' ? 'single' : 'multiple',
          question: questionContent,
          options: [],
          correctAnswer: [],
          score: avgScore,
          explanation: '',
          knowledgePoints: []
        };
        inOptions = true;
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
      
      // 检查是否是简化格式的新题开始（不带类型标识）
      // 注意：只有在前面的 newQuestionMatch 没有匹配到时才处理
      const simpleQuestionMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (simpleQuestionMatch && !line.includes('(单选题)') && !line.includes('(多选题)')) {
        // 将当前题目添加到组
        currentQuestion.explanation = currentExplanation.trim();
        currentGroup.questions.push(currentQuestion as Question);
        
        // 开始新题目（从章节标题推断类型）
        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
        let questionType: 'single' | 'multiple' = 'single';
        if (currentGroup?.title.includes('多选题')) {
          questionType = 'multiple';
        } else if (currentGroup?.title.includes('单选题')) {
          questionType = 'single';
        }
        
        currentQuestion = {
          id: parseInt(simpleQuestionMatch[1]),
          type: questionType,
          question: simpleQuestionMatch[2],
          options: [],
          correctAnswer: [],
          score: avgScore,
          explanation: '',
          knowledgePoints: []
        };
        inOptions = true;
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
      
      // 累积解析内容
      currentExplanation += (currentExplanation ? '\n' : '') + line;
    }
  }
  
  // 添加最后一个题目
  if (currentQuestion && currentGroup) {
    currentQuestion.explanation = currentExplanation.trim();
    currentGroup.questions.push(currentQuestion as Question);
  }
  
  // 添加最后一个组
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  // 如果没有找到任何组（简化格式），创建一个默认组
  if (groups.length === 0 && currentGroup) {
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
