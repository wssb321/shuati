import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  base: '/shuati/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths(),
    {
      name: 'copy-quizzes',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/tiku/')) {
            const decodedUrl = decodeURIComponent(req.url);
            const filePath = path.join(__dirname, 'public', decodedUrl);
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.end(content);
              return;
            }
          }
          next();
        });
      },
      writeBundle(options, bundle) {
        const quizDir = path.join(__dirname, 'public', 'tiku');
        if (fs.existsSync(quizDir)) {
          const files = fs.readdirSync(quizDir);
          files.forEach(file => {
            const srcPath = path.join(quizDir, file);
            const destDir = path.join(options.dir || 'dist', 'tiku');
            const destPath = path.join(destDir, file);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(srcPath, destPath);
          });
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'public',
})
