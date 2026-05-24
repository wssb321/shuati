// PWA 相关工具函数

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // 使用 Workbox 或简单的 service worker
      // 这里我们先只检查浏览器支持，后续可以添加完整的 service worker
      console.log('Service Worker API 支持');
      
      // 检查网络状态
      updateOnlineStatus();
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // 请求通知权限
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('通知权限:', permission);
      }
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  }
};

const updateOnlineStatus = () => {
  const isOnline = navigator.onLine;
  console.log('网络状态:', isOnline ? '在线' : '离线');
  
  // 可以添加全局状态管理
  const event = new CustomEvent('networkStatusChange', { 
    detail: { isOnline } 
  });
  window.dispatchEvent(event);
};

// 本地缓存题库数据
export const cacheQuizData = async (quizFiles: string[]) => {
  try {
    for (const file of quizFiles) {
      const cached = localStorage.getItem(`quiz_cache_${file}`);
      if (!cached) {
        const response = await fetch(`/tiku/${file}`);
        if (response.ok) {
          const content = await response.text();
          localStorage.setItem(`quiz_cache_${file}`, content);
          localStorage.setItem(`quiz_cache_time_${file}`, Date.now().toString());
        }
      }
    }
    console.log('题库缓存完成');
  } catch (error) {
    console.error('缓存题库失败:', error);
  }
};

// 从本地缓存获取题库
export const getCachedQuizData = (file: string): string | null => {
  return localStorage.getItem(`quiz_cache_${file}`);
};

// 发送本地通知
export const sendLocalNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/steam.png',
      badge: '/steam.png'
    });
  }
};

// 每日刷题提醒
export const setupDailyReminder = (hour: number = 20, minute: number = 0) => {
  const now = new Date();
  let reminderTime = new Date();
  reminderTime.setHours(hour, minute, 0, 0);
  
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const delay = reminderTime.getTime() - now.getTime();
  
  setTimeout(() => {
    sendLocalNotification(
      '⏰ 刷题时间到！',
      '每天进步一点点，来刷几道题吧！'
    );
    // 第二天继续
    setupDailyReminder(hour, minute);
  }, delay);
  
  console.log(`每日提醒已设置: ${hour}:${minute.toString().padStart(2, '0')}`);
};
