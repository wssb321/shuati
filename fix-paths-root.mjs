import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/utils/pwa.ts',
  'src/pages/QuizPage.tsx',
  'src/pages/BookmarkPage.tsx',
  'src/utils/quizLoader.ts',
  'src/pages/MinimalQuizPage.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const beforeCount = (content.match(/\/shuati\/tiku\//g) || []).length;
    content = content.replace(/\/shuati\/tiku\//g, '/tiku/');
    const afterCount = (content.match(/\/tiku\//g) || []).length;
    fs.writeFileSync(filePath, content);
    console.log(`${file}: ${beforeCount} -> ${afterCount} paths updated`);
  } else {
    console.log(`${file}: not found`);
  }
}

console.log('Done!');
