const fs = require('fs');
const path = require('path');

// 简单的解析测试函数
function testParse(content) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentQuestion = null;
  let inExplanation = false;
  let currentExplanation = '';
  let questions = [];
  
  for (const line of lines) {
    // 匹配题目
    const questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)\s*(.+)/);
    if (!questionMatch) {
      const simpleMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (simpleMatch) {
        if (currentQuestion) {
          currentQuestion.explanation = currentExplanation.trim();
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: parseInt(simpleMatch[1]),
          question: simpleMatch[2],
          explanation: '',
          correctAnswer: []
        };
        inExplanation = false;
        currentExplanation = '';
        continue;
      }
    }
    
    if (questionMatch) {
      if (currentQuestion) {
        currentQuestion.explanation = currentExplanation.trim();
        questions.push(currentQuestion);
      }
      currentQuestion = {
        id: parseInt(questionMatch[1]),
        question: questionMatch[3],
        explanation: '',
        correctAnswer: []
      };
      inExplanation = false;
      currentExplanation = '';
      continue;
    }
    
    // 匹配答案
    const answerMatch = line.match(/^答案[：:]?\s*([A-D,，、]+)/);
    if (answerMatch && currentQuestion) {
      currentQuestion.correctAnswer = answerMatch[1].replace(/[，,、]/g, '').split('');
      inExplanation = true;
      continue;
    }
    
    // 处理解析
    if (currentQuestion && inExplanation) {
      const explanationStart = line.match(/^解析[：:]?\s*(.+)/);
      if (explanationStart) {
        currentExplanation = explanationStart[1];
        continue;
      }
      
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

// 读取并测试
const filePath = path.join(__dirname, 'public', 'tiku', '第一章.txt');
const content = fs.readFileSync(filePath, 'utf-8');

const questions = testParse(content);

console.log('=== 解析结果 ===');
questions.forEach((q, i) => {
  console.log(`\n题目 ${i + 1}:`);
  console.log(`  题干: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`);
  console.log(`  答案: ${q.correctAnswer.join(',')}`);
  console.log(`  解析长度: ${q.explanation.length} 字符`);
  console.log(`  解析内容:"${q.explanation.substring(0, 150)}${q.explanation.length > 150 ? '...' : ''}"`);
});
