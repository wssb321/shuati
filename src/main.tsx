import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './utils/pwa'

console.log('作者:不是我,域名:zzrbsw.com','github地址:https://github.com/wssb321/shuati','电话:15989454108,邮箱:3067805413@qq.com','仅供学习与参考,请勿用于商业用途,目前网页还没备案,都给我老实一点')

// 初始化 PWA 功能
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
