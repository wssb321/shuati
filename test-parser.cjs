const fs = require('fs');

function parseQuestionFile(content) {
  const groups = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentGroup = null;
  let currentQuestion = null;
  let inOptions = false;
  let inExplanation = false;
  let currentExplanation = '';
  
  let totalScore = 0;
  let totalQuestions = 0;
  
  let formatType = 'standard';
  
  const firstLine = lines[0] || '';
  const hasChapterTitle = firstLine.match(/^(一|二|三|四|五|六|七|八|九|十|十一|十二)[、.．](.*)$/);
  const hasTypeMarker = firstLine.match(/\(单选题\)|\(多选题\)/);
  
  if (!hasChapterTitle && !hasTypeMarker) {
    formatType = 'simple';
  }
  
  console.log('Format:', formatType);
  
  if (formatType === 'simple') {
    currentGroup = { title: 'All', questions: [] };
  }
  
  for (const line of lines) {
    const chapterMatch = line.match(/^(一|二|三|四|五|六|七|八|九|十|十一|十二)[、.．](.*)$/);
    if (chapterMatch) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      const title = chapterMatch[2];
      currentGroup = { title, questions: [] };
      
      const scoreMatch = title.match(/共(\d+)题.*?(\d+\.?\d*)分/);
      if (scoreMatch) {
        totalQuestions = parseInt(scoreMatch[1]);
        totalScore = parseFloat(scoreMatch[2]);
      }
      continue;
    }
    
    if (!currentGroup) continue;
    
    let questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)\s*(.+)/);
    
    if (!questionMatch && formatType === 'simple') {
      questionMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (questionMatch) {
        if (currentQuestion) {
          currentGroup.questions.push(currentQuestion);
        }
        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
        currentQuestion = {
          id: parseInt(questionMatch[1]),
          type: 'single',
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
        currentGroup.questions.push(currentQuestion);
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
    
    if (currentQuestion && inOptions) {
      const optionMatch = line.match(/^([A-D])[．.、\s]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push({
          key: optionMatch[1],
          value: optionMatch[2]
        });
        continue;
      }
      
      const answerMatch = line.match(/^答案[：:]?\s*([A-D,，]+)/);
      if (answerMatch) {
        const answerStr = answerMatch[1];
        currentQuestion.correctAnswer = answerStr.replace(/[，,]/g, '').split('');
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        inOptions = false;
        inExplanation = true;
        continue;
      }
      
      const oldAnswerMatch = line.match(/正确答案[：:]\s*([A-D,，]+)/);
      if (oldAnswerMatch) {
        const answerStr = oldAnswerMatch[1];
        currentQuestion.correctAnswer = answerStr.replace(/[，,]/g, '').split('');
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        inOptions = false;
        inExplanation = true;
        continue;
      }
    }
    
    if (currentQuestion && inExplanation) {
      const newQuestionMatch = line.match(/^(\d+)\.\s*/);
      if (newQuestionMatch) {
        const typeMatch = line.match(/\((单选题|多选题)\)/);
        currentQuestion.explanation = currentExplanation.trim();
        currentGroup.questions.push(currentQuestion);
        
        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
        let questionContent = line.replace(/^\d+\.\s*/, '').replace(/\(单选题\)|\(多选题\)/g, '').trim();
        
        currentQuestion = {
          id: parseInt(newQuestionMatch[1]),
          type: typeMatch ? (typeMatch[1] === '单选题' ? 'single' : 'multiple') : 'single',
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
      
      const answerMatch = line.match(/^答案[：:]?\s*([A-D,，]+)/);
      if (answerMatch) {
        const answerStr = answerMatch[1];
        currentQuestion.correctAnswer = answerStr.replace(/[，,]/g, '').split('');
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        continue;
      }
      
      const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
      if (scoreMatch) {
        currentQuestion.score = parseFloat(scoreMatch[1]);
        continue;
      }
      
      currentExplanation += (currentExplanation ? '\n' : '') + line;
    }
  }
  
  if (currentQuestion && currentGroup) {
    currentQuestion.explanation = currentExplanation.trim();
    currentGroup.questions.push(currentQuestion);
  }
  
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  return groups;
}

const content = fs.readFileSync('public/题库/第一章.txt', 'utf-8');
console.log('File length:', content.length);

const groups = parseQuestionFile(content);
console.log('Groups:', groups.length);
groups.forEach((g, i) => {
  console.log('Group ' + (i+1) + ': ' + g.title + ', questions: ' + g.questions.length);
});

if (groups.length > 0 && groups[0].questions.length > 0) {
  const q = groups[0].questions[0];
  console.log('First question:', q.question);
  console.log('Options:', JSON.stringify(q.options));
  console.log('Correct answer:', q.correctAnswer);
}
