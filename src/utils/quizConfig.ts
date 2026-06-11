/**
 * 题库全局配置常量
 * 统一管理题库列表、路径前缀等共享配置
 */

// 部署子路径（需与 vite.config.ts 的 base 保持一致）
export const BASE_PATH = '/shuati';

// 题库文件路径前缀
export const TIKU_PATH = `${BASE_PATH}/tiku`;

// 所有可用题库文件列表
export const QUIZ_FILES = [
  '模拟第一章.txt', '模拟第二章.txt', '模拟第三章.txt', '模拟第四章.txt',
  '模拟第五章.txt', '模拟第六章.txt', '模拟第七章.txt', '模拟第八章.txt',
  '模拟第九章.txt',
  '第一章.txt', '第三章.txt', '第四章.txt', '第五章.txt',
  '第六章.txt', '第七章.txt', '第八章.txt', '第八章2.txt',
  '第八章3.txt', '第八章4.txt', '第八章5.txt',
  '第九章.txt', '第九章1.txt', '第九章2.txt', '第九章3.txt', '第九章4.txt',
  '案例一.txt', '案例二.txt', '案例三.txt', '小游戏.txt',
] as const;

// 获取题库文件的完整 URL
export function getQuizUrl(filename: string): string {
  return `${TIKU_PATH}/${encodeURIComponent(filename)}`;
}
