import { parseQuestionFile } from './src/utils/questionParser.ts';
import fs from 'fs';
import path from 'path';

// 读取题库文件
const filePath = path.join(process.cwd(), 'public', 'tiku', '第一章.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// 解析题库
const groups = parseQuestionFile(content);

// 输出解析结果
console.log('=== 解析结果 ===');
groups.forEach((group, groupIndex) => {
  console.log(`\n章节 ${groupIndex + 1}: ${group.title}`);
  group.questions.forEach((q, qIndex) => {
    console.log(`\n题目 ${qIndex + 1} (${q.type}):`);
    console.log(`  题干: ${q.question.substring(0, 50)}...`);
    console.log(`  正确答案: ${q.correctAnswer.join(',')}`);
    console.log(`  解析长度: ${q.explanation.length} 字符`);
    console.log(`  解析内容: "${q.explanation.substring(0, 100)}${q.explanation.length > 100 ? '...' : ''}"`);
    console.log(`  解析为空: ${q.explanation === ''}`);
  });
});
