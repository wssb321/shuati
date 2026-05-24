/**
 * 题库文件快速诊断脚本
 * 请在浏览器控制台（F12）中运行此脚本
 */

(function() {
  console.group('🔍 题库文件快速诊断');
  console.log('网站地址:', window.location.origin);
  console.log('诊断时间:', new Date().toLocaleString('zh-CN'));
  console.log('---');
  
  const quizFiles = [
    '第一章.txt', '第三章.txt', '第四章.txt', '第五章.txt', 
    '第六章.txt', '第七章.txt', '第八章.txt', '第八章2.txt', 
    '第八章3.txt', '第八章4.txt', '第八章5.txt', '第九章.txt', 
    '第九章1.txt', '第九章2.txt', '第九章3.txt', '第九章4.txt'
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  console.log('开始检查 ' + quizFiles.length + ' 个题库文件...\n');
  
  quizFiles.forEach(async (file, index) => {
    const url = `/tiku/${encodeURIComponent(file)}`;
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (response.ok) {
        successCount++;
        console.log(`✅ [${index + 1}/${quizFiles.length}] ${file} - ${response.status} (${responseTime}ms)`);
      } else {
        errorCount++;
        console.log(`❌ [${index + 1}/${quizFiles.length}] ${file} - HTTP ${response.status} ❌`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ [${index + 1}/${quizFiles.length}] ${file} - ${error.message} ❌`);
    }
  });
  
  setTimeout(() => {
    console.log('\n---');
    console.log('📊 诊断结果汇总:');
    console.log(`   ✅ 成功: ${successCount}/${quizFiles.length}`);
    console.log(`   ❌ 失败: ${errorCount}/${quizFiles.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 所有题库文件访问正常！');
    } else {
      console.log(`\n⚠️ 有 ${errorCount} 个文件无法访问！`);
      console.log('请检查:');
      console.log('   1. 文件是否上传到服务器的 /tiku/ 目录');
      console.log('   2. 文件名是否完全匹配');
      console.log('   3. 服务器配置是否正确');
    }
    
    console.groupEnd();
  }, 500);
  
})();
