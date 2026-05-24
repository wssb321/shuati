// 带超时的 fetch 函数
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时 (${timeout}ms): ${url}`);
    }
    
    throw error;
  }
};

// 带重试的 fetch 函数
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeout: number = 10000
): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`📡 第 ${i + 1} 次尝试请求: ${url}`);
      const response = await fetchWithTimeout(url, options, timeout);
      
      if (response.ok) {
        return response;
      }
      
      // 如果是 404，不再重试
      if (response.status === 404) {
        throw new Error(`文件不存在: ${response.status}`);
      }
      
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i < maxRetries - 1) {
        console.warn(`⚠️ 请求失败，${(i + 1) * 2}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
      }
    }
  }
  
  throw lastError || new Error('请求失败');
};
