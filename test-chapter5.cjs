const fs = require('fs');
const path = require('path');

// 读取第五章题库文件
const filePath = path.join(__dirname, 'public', 'tiku', '第五章.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// 使用简化的解析函数测试
function testParse(content) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentQuestion = null;
  let inExplanation = false;
  let currentExplanation = '';
  let questions = [];
  
  for (const line of lines) {
    // 匹配章节标题
    const chapterMatch = line.match(/^(一|二|三|四|五|六|七|八|九|十)[、.．](.*)$/);
    if (chapterMatch) {
      continue;
    }
    
    // 匹配题目
    const questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion) {
        currentQuestion.explanation = currentExplanation.trim();
        questions.push(currentQuestion);
      }
      currentQuestion = {
        id: parseInt(questionMatch[1]),
        question: questionMatch[3],
        type: questionMatch[2] === '单选题' ? 'single' : 'multiple',
        explanation: '',
        correctAnswer: []
      };
      inExplanation = false;
      currentExplanation = '';
      continue;
    }
    
    // 匹配选项
    const optionMatch = line.match(/^([A-D])[．.、\s]\s*(.+)/);
    if (optionMatch && currentQuestion) {
      continue; // 我们只关心答案和解析
    }
    
    // 匹配答案（新格式）
    const answerMatch = line.match(/正确答案[：:]([A-D,，、]+)/);
    if (answerMatch && currentQuestion) {
      const answerStr = answerMatch[1];
      const pureAnswer = answerStr.match(/^[A-D,，、]+/)?.[0] || answerStr;
      currentQuestion.correctAnswer = pureAnswer.replace(/[，,、]/g, '').split('');
      inExplanation = true;
      continue;
    }
    
    // 处理解析
    if (currentQuestion && inExplanation) {
      // 检查是否是新题开始
      const newQMatch = line.match(/^(\d+)\./);
      if (newQMatch) {
        currentQuestion.explanation = currentExplanation.trim();
        questions.push(currentQuestion);
        currentQuestion = null;
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
      
      // 检查是否是章节标题
      const chapMatch = line.match(/^(一|二|三|四|五|六|七|八|九|十)[、.．]/);
      if (chapMatch) {
        currentQuestion.explanation = currentExplanation.trim();
        questions.push(currentQuestion);
        currentQuestion = null;
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
      
      // 检查是否是解析开头
      const expStart = line.match(/^(答案)?解析[：:]?\s*(.+)/);
      if (expStart) {
        currentExplanation = expStart[2] || '';
        continue;
      }
      
      // 检查是否是分数行或知识点行
      const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
      const knowledgeMatch = line.match(/^(知识点|AI讲解)/);
      if (scoreMatch || knowledgeMatch) {
        continue;
      }
      
      // 累积解析内容
      currentExplanation += (currentExplanation ? '\n' : '') + line;
    }
  }
  
  if (currentQuestion) {
    currentQuestion.explanation = currentExplanation.trim();
    questions.push(currentQuestion);
  }
  
  return questions;
}

const questions = testParse(content);

console.log('=== 第五章题库解析结果 ===');
questions.forEach((q, i) => {
  console.log(`\n题目 ${i + 1}:`);
  console.log(`  题干: ${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}`);
  console.log(`  类型: ${q.type === 'single' ? '单选题' : '多选题'}`);
  console.log(`  答案: ${q.correctAnswer.join(',')}`);
  console.log(`  解析长度: ${q.explanation.length} 字符`);
  console.log(`  解析内容:"${q.explanation.substring(0, 100)}${q.explanation.length > 100 ? '...' : ''}"`);
});
