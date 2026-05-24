import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/pages/QuizPage.tsx',
  'src/pages/BookmarkPage.tsx',
  'src/pages/MinimalQuizPage.tsx',
  'src/utils/quizLoader.ts',
  'src/utils/pwa.ts',
  'src/utils/quizDiagnostics.ts'
];

for (const file of filesToUpdate) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const beforeCount1 = (content.match(/fetch\(`\/tiku\//g) || []).length;
    const beforeCount2 = (content.match(/fetchWithTimeout\(`\/tiku\//g) || []).length;
    content = content.replace(/fetch\(`\/tiku\//g, "fetch(`/shuati/tiku/");
    content = content.replace(/fetchWithTimeout\(`\/tiku\//g, "fetchWithTimeout(`/shuati/tiku/");
    const afterCount1 = (content.match(/fetch\(`\/shuati\/tiku\//g) || []).length;
    const afterCount2 = (content.match(/fetchWithTimeout\(`\/shuati\/tiku\//g) || []).length;
    fs.writeFileSync(filePath, content);
    console.log(`${file}: ${beforeCount1 + beforeCount2} -> ${afterCount1 + afterCount2} paths updated`);
  } else {
    console.log(`${file}: not found`);
  }
}

console.log('Done!');
