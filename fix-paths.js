const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/QuizPage.tsx',
  'src/pages/BookmarkPage.tsx',
  'src/pages/MinimalQuizPage.tsx',
  'src/utils/quizLoader.ts',
  'src/utils/pwa.ts',
  'src/utils/quizDiagnostics.ts'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const beforeCount = (content.match(/fetch\(`\/tiku\//g) || []).length;
    content = content.replace(/fetch\(`\/tiku\//g, "fetch(`/shuati/tiku/");
    const afterCount = (content.match(/fetch\(`\/shuati\/tiku\//g) || []).length;
    fs.writeFileSync(filePath, content);
    console.log(`${file}: ${beforeCount} -> ${afterCount} paths updated`);
  } else {
    console.log(`${file}: not found`);
  }
});

console.log('Done!');
