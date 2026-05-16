import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('作者:不是我,域名:zzrbsw.com','联系作者:https://github.com/zzrbsw','电话:15989454108,邮箱:3067805413@qq.com','这是挂了服务器的网站,希望不要有人来攻击我,我只用来学习')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
