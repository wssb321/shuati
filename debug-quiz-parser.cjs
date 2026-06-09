const fs = require('fs');
const path = require('path');

// 导入解析器
const { parseQuestionFile } = require('./src/utils/questionParser');

const chapters = ['第四章.txt', '第五章.txt', '第六章.txt'];

chapters.forEach(chapter => {
  const filePath = path.join(__dirname, 'public', 'tiku', chapter);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const groups = parseQuestionFile(content);
    
    console.log(`\n=== ${chapter} 解析结果 ===`);
    console.log(`分组数: ${groups.length}`);
    
    let totalQuestions = 0;
    let emptyQuestions = 0;
    
    groups.forEach((group, gIdx) => {
      console.log(`\n分组 ${gIdx + 1}: ${group.title}`);
      console.log(`题目数: ${group.questions.length}`);
      
      group.questions.forEach((q, qIdx) => {
        totalQuestions++;
        if (!q.question || q.question.trim() === '') {
          emptyQuestions++;
          console.log(`  ❌ 题目 ${qIdx + 1} 为空 (ID: ${q.id})`);
        } else {
          console.log(`  ✓ 题目 ${qIdx + 1}: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`);
        }
      });
    });
    
    console.log(`\n总计: ${totalQuestions} 题，其中 ${emptyQuestions} 题为空`);
    
  } catch (err) {
    console.error(`解析 ${chapter} 出错:`, err.message);
  }
});
