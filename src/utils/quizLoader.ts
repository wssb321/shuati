// QuizPage 增强工具函数
import { fetchWithTimeout } from './networkUtils';
import { parseQuestionFile, Question, QuestionGroup } from './questionParser';

// 增强版加载题库函数
export const enhancedLoadQuiz = async (
  quizFile: string,
  options: {
    setLoading: (v: boolean) => void;
    setError: (v: string) => void;
    setQuestions: (v: Question[]) => void;
    setQuestionGroups: (v: QuestionGroup[]) => void;
    resetQuizState: () => void;
  }
) => {
  const { setLoading, setError, setQuestions, setQuestionGroups, resetQuizState } = options;
  
  console.log(`=== 开始加载题库: ${quizFile} ===`);
  
  try {
    setLoading(true);
    
    // 使用带超时的 fetch
    console.log(`📡 发起请求: /tiku/${quizFile}`);
    const response = await fetchWithTimeout(`/tiku/${quizFile}`, {}, 10000);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const content = await response.text();
    console.log(`✅ 请求成功，内容长度: ${content.length} 字符`);
    
    if (content.length < 100) {
      throw new Error('题库内容过少，可能文件损坏');
    }
    
    console.log(`🔄 解析题库...`);
    const groups = parseQuestionFile(content);
    console.log(`📊 解析完成，分组数: ${groups.length}`);
    
    if (groups.length === 0) {
      throw new Error('无法解析题库内容');
    }
    
    const allQuestions = groups.flatMap(g => g.questions);
    console.log(`📝 题目总数: ${allQuestions.length}`);
    
    if (allQuestions.length === 0) {
      throw new Error('题库中没有题目');
    }
    
    console.log(`⚙️ 设置题目数据...`);
    setQuestionGroups(groups);
    setQuestions(allQuestions);
    
    console.log(`🔄 重置状态...`);
    resetQuizState();
    
    setError('');
    setLoading(false);
    console.log(`✅ 题库加载成功: ${quizFile}`);
    
    return { success: true, questions: allQuestions };
    
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知错误';
    console.error(`❌ 加载题库失败: ${errorMsg}`);
    
    setError(`加载题库失败: ${errorMsg}`);
    setLoading(false);
    
    return { success: false, error: errorMsg };
  }
};

// 验证题库文件是否存在
export const verifyQuizFile = async (quizFile: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(`/tiku/${quizFile}`, { method: 'HEAD' }, 5000);
    return response.ok;
  } catch {
    return false;
  }
};

// 检查所有题库文件
export const verifyAllQuizFiles = async (
  quizFiles: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ exists: string[]; missing: string[] }> => {
  const exists: string[] = [];
  const missing: string[] = [];
  
  for (let i = 0; i < quizFiles.length; i++) {
    const file = quizFiles[i];
    const fileExists = await verifyQuizFile(file);
    
    if (fileExists) {
      exists.push(file);
    } else {
      missing.push(file);
    }
    
    if (onProgress) {
      onProgress(i + 1, quizFiles.length);
    }
  }
  
  return { exists, missing };
};
