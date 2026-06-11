/**
 * 题库文件诊断工具
 * 用于检查所有题库文件是否能够正常访问
 */
import { QUIZ_FILES, TIKU_PATH } from './quizConfig';

export const diagnoseQuizFiles = async (baseUrl: string = '') => {
  const quizFiles = [...QUIZ_FILES];

  const results: {
    file: string;
    status: 'success' | 'error';
    statusCode?: number;
    error?: string;
    responseTime?: number;
  }[] = [];

  console.group('📋 题库文件诊断开始');
  console.log(`基础 URL: ${baseUrl || window.location.origin}`);
  console.log(`题库总数: ${quizFiles.length}`);
  console.log('---');

  for (const file of quizFiles) {
    const startTime = performance.now();
    const url = `${baseUrl}${TIKU_PATH}/${encodeURIComponent(file)}`;
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (response.ok) {
        results.push({
          file,
          status: 'success',
          statusCode: response.status,
          responseTime
        });
        console.log(`✅ ${file} - ${response.status} (${responseTime}ms)`);
      } else {
        results.push({
          file,
          status: 'error',
          statusCode: response.status,
          error: `HTTP ${response.status}`
        });
        console.log(`❌ ${file} - ${response.status}`);
      }
    } catch (error) {
      results.push({
        file,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`❌ ${file} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.groupEnd();
  console.log('');
  console.log('📊 诊断结果汇总:');
  console.log(`  ✅ 成功: ${successCount}/${quizFiles.length}`);
  console.log(`  ❌ 失败: ${errorCount}/${quizFiles.length}`);
  
  if (errorCount > 0) {
    console.log('');
    console.log('❌ 无法访问的文件:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`  - ${r.file}: ${r.error || `HTTP ${r.statusCode}`}`);
    });
  }

  return results;
};

// 诊断单个文件
export const diagnoseSingleFile = async (fileName: string, baseUrl: string = '') => {
  const url = `${baseUrl}${TIKU_PATH}/${encodeURIComponent(fileName)}`;
  
  console.log(`诊断文件: ${fileName}`);
  console.log(`完整URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const content = await response.text();
    
    console.log(`状态码: ${response.status}`);
    console.log(`响应内容长度: ${content.length} 字符`);
    console.log(`响应内容预览: ${content.substring(0, 200)}...`);
    
    return {
      success: response.ok,
      statusCode: response.status,
      contentLength: content.length,
      preview: content.substring(0, 500)
    };
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// 导出到全局供控制台使用
if (typeof window !== 'undefined') {
  (window as any).diagnoseQuizFiles = diagnoseQuizFiles;
  (window as any).diagnoseSingleFile = diagnoseSingleFile;
  console.log('💡 诊断工具已加载。在控制台运行以下命令:');
  console.log('  diagnoseQuizFiles() - 检查所有题库文件');
  console.log('  diagnoseSingleFile("第一章.txt") - 检查单个文件');
}
