const BOOKMARKS_KEY = 'question_bookmarks';
const FLAGS_KEY = 'question_flags';

export interface BookmarkItem {
  questionId: number;
  quizFile: string;
  timestamp: number;
}

export interface FlagItem {
  questionId: number;
  quizFile: string;
  timestamp: number;
}

export function getBookmarks(): BookmarkItem[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(questionId: number, quizFile: string): void {
  try {
    const bookmarks = getBookmarks();
    const key = `${quizFile}_${questionId}`;
    
    if (!bookmarks.some(b => `${b.quizFile}_${b.questionId}` === key)) {
      bookmarks.push({
        questionId,
        quizFile,
        timestamp: Date.now()
      });
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
  } catch (error) {
    console.error('保存收藏失败:', error);
  }
}

export function removeBookmark(questionId: number, quizFile: string): void {
  try {
    const bookmarks = getBookmarks();
    const key = `${quizFile}_${questionId}`;
    const filtered = bookmarks.filter(b => `${b.quizFile}_${b.questionId}` !== key);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('移除收藏失败:', error);
  }
}

export function isBookmarked(questionId: number, quizFile: string): boolean {
  const bookmarks = getBookmarks();
  const key = `${quizFile}_${questionId}`;
  return bookmarks.some(b => `${b.quizFile}_${b.questionId}` === key);
}

export function toggleBookmark(questionId: number, quizFile: string): boolean {
  if (isBookmarked(questionId, quizFile)) {
    removeBookmark(questionId, quizFile);
    return false;
  } else {
    saveBookmark(questionId, quizFile);
    return true;
  }
}

export function getFlags(): FlagItem[] {
  try {
    const data = localStorage.getItem(FLAGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFlag(questionId: number, quizFile: string): void {
  try {
    const flags = getFlags();
    const key = `${quizFile}_${questionId}`;
    
    if (!flags.some(f => `${f.quizFile}_${f.questionId}` === key)) {
      flags.push({
        questionId,
        quizFile,
        timestamp: Date.now()
      });
      localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
    }
  } catch (error) {
    console.error('保存标记失败:', error);
  }
}

export function removeFlag(questionId: number, quizFile: string): void {
  try {
    const flags = getFlags();
    const key = `${quizFile}_${questionId}`;
    const filtered = flags.filter(f => `${f.quizFile}_${f.questionId}` !== key);
    localStorage.setItem(FLAGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('移除标记失败:', error);
  }
}

export function isFlagged(questionId: number, quizFile: string): boolean {
  const flags = getFlags();
  const key = `${quizFile}_${questionId}`;
  return flags.some(f => `${f.quizFile}_${f.questionId}` === key);
}

export function toggleFlag(questionId: number, quizFile: string): boolean {
  if (isFlagged(questionId, quizFile)) {
    removeFlag(questionId, quizFile);
    return false;
  } else {
    saveFlag(questionId, quizFile);
    return true;
  }
}

export function clearBookmarks(): void {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.error('清除收藏失败:', error);
  }
}

export function clearFlags(): void {
  try {
    localStorage.removeItem(FLAGS_KEY);
  } catch (error) {
    console.error('清除标记失败:', error);
  }
}
