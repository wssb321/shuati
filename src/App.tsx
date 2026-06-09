import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizPage } from '@/pages/QuizPage';
import { BookmarkPage } from '@/pages/BookmarkPage';
import { WrongQuestionPage } from '@/pages/WrongQuestionPage';
import { DiagnosticsPage } from '@/pages/DiagnosticsPage';
import SoftAurora from './components/SoftAurora';
import { ToastProvider } from './components/Toast';
import { ConfirmDialogProvider } from './components/ConfirmDialog';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <div className="relative min-h-screen">
      <SoftAurora
        className="fixed inset-0 z-0"
        speed={0.6}
        scale={1.5}
        brightness={1.2}
        color1="#818cf8"
        color2="#3b82f6"
      />
      <div className="relative z-10">
        <ToastProvider>
          <ConfirmDialogProvider>
            <Router>
              <Routes>
                <Route path="/" element={<QuizPage />} />
                <Route path="/diagnostics" element={<DiagnosticsPage />} />
                <Route path="/bookmarks" element={<BookmarkPage />} />
                <Route path="/wrong-questions" element={<WrongQuestionPage />} />
              </Routes>
            </Router>
          </ConfirmDialogProvider>
        </ToastProvider>
      </div>
      <Analytics />
    </div>
  );
}
