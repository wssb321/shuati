
const fs = require('fs');
const path = require('path');

const chapter5Content = fs.readFileSync(path.join(__dirname, 'public/tiku/第五章.txt'), 'utf-8');

function debugParseQuestionFile(content) {
  console.log('=== 开始解析第五章 ===\n');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  console.log(`总行数: ${lines.length}\n`);
  
  let questions = [];
  let currentQuestion = null;
  let inOptions = false;
  let inExplanation = false;
  let currentExplanation = '';
  let currentLine = 0;
  
  for (const line of lines) {
    currentLine++;
    console.log(`[${currentLine}] ${line}`);
    
    const questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)(.+)/);
    if (questionMatch) {
      console.log(`  → 匹配到题目: 第${questionMatch[1]}题, ${questionMatch[2]}`);
      
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        id: parseInt(questionMatch[1]),
        type: questionMatch[2] === '单选题' ? 'single' : 'multiple',
        question: questionMatch[3].trim(),
        options: [],
        correctAnswer: [],
        explanation: ''
      };
      inOptions = true;
      inExplanation = false;
      currentExplanation = '';
      continue;
    }
    
    if (currentQuestion && inOptions) {
      const optionMatch = line.match(/^([A-D])[．.、\s]\s*(.+)/);
      if (optionMatch) {
        console.log(`  → 匹配到选项: ${optionMatch[1]}`);
        currentQuestion.options.push({
          key: optionMatch[1],
          value: optionMatch[2]
        });
        continue;
      }
      
      const oldAnswerMatch = line.match(/正确答案[：:]\s*([A-D,，、]+)/);
      if (oldAnswerMatch) {
        console.log(`  → 匹配到旧答案: ${oldAnswerMatch[1]}`);
        const answerStr = oldAnswerMatch[1];
        const pureAnswer = answerStr.match(/^[A-D,，、]+/)?.[0] || answerStr;
        currentQuestion.correctAnswer = pureAnswer.replace(/[，,、]/g, '').split('');
        if (currentQuestion.correctAnswer.length > 1) {
          currentQuestion.type = 'multiple';
        }
        inOptions = false;
        inExplanation = true;
        continue;
      }
      
      const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
      if (scoreMatch) {
        console.log(`  → 匹配到分数: ${scoreMatch[1]}`);
        continue;
      }
    }
    
    if (currentQuestion && inExplanation) {
      if (line.startsWith('答案解析：')) {
        console.log(`  → 匹配到解析开始`);
        currentExplanation = line.replace('答案解析：', '');
      } else if (line.startsWith('知识点：')) {
        console.log(`  → 匹配到知识点`);
      } else if (line.startsWith('AI讲解')) {
        console.log(`  → 匹配到AI讲解，跳过`);
      } else if (line.match(/^(\d+)\.\s*\((单选题|多选题)\)/)) {
        console.log(`  → 下一题开始，保存当前解析: ${currentExplanation.substring(0, 30)}...`);
        currentQuestion.explanation = currentExplanation.trim();
        questions.push(currentQuestion);
        
        const qMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)(.+)/);
        currentQuestion = {
          id: parseInt(qMatch[1]),
          type: qMatch[2] === '单选题' ? 'single' : 'multiple',
          question: qMatch[3].trim(),
          options: [],
          correctAnswer: [],
          explanation: ''
        };
        inOptions = true;
        inExplanation = false;
        currentExplanation = '';
      } else if (line.match(/^(一|二|三|四|五|六|七|八|九|十)[、.．](.*)$/)) {
        console.log(`  → 新章节开始`);
        if (currentQuestion) {
          currentQuestion.explanation = currentExplanation.trim();
          questions.push(currentQuestion);
          currentQuestion = null;
        }
      } else {
        currentExplanation += (currentExplanation ? '\n' : '') + line;
      }
    }
  }
  
  if (currentQuestion) {
    currentQuestion.explanation = currentExplanation.trim();
    questions.push(currentQuestion);
  }
  
  console.log('\n=== 解析结果 ===');
  console.log(`总共解析到 ${questions.length} 道题`);
  
  const questionIds = questions.map(q => q.id).sort((a, b) => a - b);
  console.log(`题目ID: ${questionIds.join(', ')}`);
  
  console.log('\n=== 题目详情 ===');
  questions.forEach(q => {
    console.log(`[${q.id}] ${q.question.substring(0, 40)}...`);
    console.log(`  选项: ${q.options.map(o => o.key).join(',')}`);
    console.log(`  答案: ${q.correctAnswer.join(',')}`);
    console.log(`  解析: ${q.explanation ? '有' : '无'}`);
  });
  
  return questions;
}

debugParseQuestionFile(chapter5Content);
