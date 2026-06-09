const fs = require('fs');
const path = require('path');

const chapters = ['第四章.txt', '第五章.txt', '第六章.txt'];

chapters.forEach(chapter => {
  const filePath = path.join(__dirname, 'public', 'tiku', chapter);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`\n=== ${chapter} ==`);
    console.log(`总行数: ${lines.length}`);
    
    // 检查前几行的内容
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      console.log(`\n第 ${i + 1} 行:`);
      console.log(`原始内容: "${line}"`);
      console.log(`长度: ${line.length}`);
      console.log(`字符码点:`);
      for (let j = 0; j < Math.min(20, line.length); j++) {
        console.log(`  [${j}] '${line[j]}' -> ${line.charCodeAt(j)}`);
      }
      
      // 测试正则匹配
      const questionMatch = line.match(/^(\d+)\.\s*\((单选题|多选题)\)\s*(.+)/);
      console.log(`正则匹配结果:`, questionMatch);
    }
    
  } catch (err) {
    console.error(`读取 ${chapter} 出错:`, err.message);
  }
});
