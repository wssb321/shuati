# Steam刷题管家 - 部署指南

## 🚀 快速部署

### 1. 构建项目

```bash
npm install
npm run build
```

构建完成后，`dist/` 目录包含：
- `index.html` - 主页
- `assets/` - JS 和 CSS 资源
- `tiku/` - 题库文件
- `manifest.json` - PWA配置
- `steam.png` - 图标

### 2. 上传到服务器

```bash
# 使用 scp 上传
scp -r dist/* user@www.zzrbsw.xyz:/var/www/shuati/dist/

# 或使用 rsync（推荐）
rsync -avz --delete dist/ user@www.zzrbsw.xyz:/var/www/shuati/dist/
```

### 3. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/shuati
sudo ln -s /etc/nginx/sites-available/shuati /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 4. 配置 SSL 证书

```bash
# 使用 Let's Encrypt（推荐）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d www.zzrbsw.xyz -d zzrbsw.xyz

# 或手动配置
sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
sudo cp your-cert-key.pem /etc/nginx/ssl/key.pem
```

### 5. 设置文件权限

```bash
sudo chown -R www-data:www-data /var/www/shuati/dist
sudo chmod -R 755 /var/www/shuati/dist
```

## 📁 目录结构

```
/var/www/shuati/
└── dist/
    ├── index.html
    ├── assets/
    │   ├── index-*.js
    │   └── index-*.css
    ├── tiku/
    │   ├── 第一章.txt
    │   ├── 第二章.txt
    │   └── ...
    ├── manifest.json
    └── steam.png
```

## 🔍 故障排查

### 1. 页面空白
```bash
# 检查文件是否存在
ls -la /var/www/shuati/dist/

# 检查 assets 目录
ls -la /var/www/shuati/dist/assets/

# 检查权限
ls -la /var/www/shuati/dist/
```

### 2. 资源 404
```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/shuati_error.log

# 检查文件权限
sudo chown -R www-data:www-data /var/www/shuati/dist
```

### 3. 题库文件无法加载
```bash
# 检查 tiku 目录
ls -la /var/www/shuati/dist/tiku/

# 检查 Nginx alias 配置
sudo tail -f /var/log/nginx/shuati_error.log
```

### 4. SSL 证书问题
```bash
# 检查证书是否存在
ls -la /etc/nginx/ssl/

# 测试 SSL 配置
openssl s_client -connect www.zzrbsw.xyz:443
```

## 🔒 安全检查清单

- [ ] HTTPS 启用且强制重定向
- [ ] SSL 证书有效
- [ ] HSTS 头已配置
- [ ] 文件权限正确
- [ ] Nginx 配置测试通过
- [ ] 日志文件可写

## 📊 性能优化

### 1. 启用 Brotli 压缩（可选）
```nginx
# 在 gzip 后面添加
brotli on;
brotli_types text/plain text/css text/javascript
           application/javascript application/json;
brotli_comp_level 6;
```

### 2. HTTP/2 推送（可选）
```nginx
http2_push_preload on;
```

### 3. 缓存策略
- HTML: no-cache
- JS/CSS: 1 year (immutable)
- Images: 30 days
- 题库文件: 7 days

## 🌐 常用命令

```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重载配置
sudo systemctl reload nginx

# 测试配置
sudo nginx -t

# 查看日志
sudo tail -f /var/log/nginx/shuati_access.log
sudo tail -f /var/log/nginx/shuati_error.log

# 检查进程
ps aux | grep nginx

# 重启 PHP-FPM（如果有）
sudo systemctl restart php-fpm
```

## 📞 支持

如果遇到问题：
1. 检查 Nginx 错误日志
2. 确认文件权限
3. 验证 SSL 证书
4. 测试配置并重载

---

**祝你部署成功！** 🎉
