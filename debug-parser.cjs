const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'tiku', '第五章.txt');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n').map(line => line.trim()).filter(line => line);

console.log('=== 调试解析过程 ===\n');

let inExplanation = false;

for (let i = 0; i < Math.min(15, lines.length); i++) {
  const line = lines[i];
  console.log(`行 ${i + 1}: "${line}"`);
  
  // 匹配答案
  const answerMatch = line.match(/正确答案[：:]([A-D,，、]+)/);
  if (answerMatch) {
    console.log(`  -> 匹配到答案行: ${answerMatch[1]}`);
    inExplanation = true;
  }
  
  // 在解析模式下
  if (inExplanation) {
    // 检查解析开头
    const expStart = line.match(/^(答案)?解析[：:]?\s*(.+)/);
    if (expStart) {
      console.log(`  -> 匹配到解析开头:`);
      console.log(`     expStart[0]: "${expStart[0]}"`);
      console.log(`     expStart[1]: "${expStart[1]}"`);
      console.log(`     expStart[2]: "${expStart[2]}"`);
    }
    
    // 检查分数行
    const scoreMatch = line.match(/^(\d+\.?\d*)分$/);
    if (scoreMatch) {
      console.log(`  -> 匹配到分数行: ${scoreMatch[1]}分`);
    }
    
    // 检查知识点行
    const knowledgeMatch = line.match(/^(知识点|AI讲解)/);
    if (knowledgeMatch) {
      console.log(`  -> 匹配到知识点/AI讲解行`);
    }
  }
  
  console.log();
}
