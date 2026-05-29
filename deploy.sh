#!/bin/bash

# Steam刷题管家 - 一键部署脚本
# 使用方法: ./deploy.sh user@www.zzrbsw.xyz

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REMOTE_USER="$1"
REMOTE_HOST="www.zzrbsw.xyz"
REMOTE_PATH="/var/www/shuati"
DIST_PATH="dist"

echo -e "${BLUE}======================================"
echo -e "  Steam刷题管家 - 部署脚本"
echo -e "======================================${NC}"
echo ""

# 检查参数
if [ -z "$REMOTE_USER" ]; then
    echo -e "${RED}错误: 请提供服务器用户名${NC}"
    echo "使用方法: $0 user@hostname"
    echo "示例: $0 root@www.zzrbsw.xyz"
    exit 1
fi

# 检查构建目录
if [ ! -d "$DIST_PATH" ]; then
    echo -e "${YELLOW}构建目录不存在，正在构建项目...${NC}"
    npm install
    npm run build
fi

# 确认部署
echo -e "${BLUE}部署信息:${NC}"
echo "  服务器: $REMOTE_USER@$REMOTE_HOST"
echo "  路径: $REMOTE_PATH/dist"
echo ""
read -p "确认部署? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}部署已取消${NC}"
    exit 1
fi

# 1. 上传文件
echo -e "${BLUE}[1/4] 上传文件到服务器...${NC}"
rsync -avz --delete \
    -e "ssh -o StrictHostKeyChecking=no" \
    --exclude='*.map' \
    --exclude='node_modules' \
    "$DIST_PATH/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/dist/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 文件上传成功${NC}"
else
    echo -e "${RED}✗ 文件上传失败${NC}"
    exit 1
fi

# 2. 设置权限
echo -e "${BLUE}[2/4] 设置文件权限...${NC}"
ssh "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
sudo chown -R www-data:www-data /var/www/shuati/dist
sudo chmod -R 755 /var/www/shuati/dist
echo "权限设置完成"
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 权限设置成功${NC}"
else
    echo -e "${RED}✗ 权限设置失败${NC}"
    exit 1
fi

# 3. 测试 Nginx 配置
echo -e "${BLUE}[3/4] 测试 Nginx 配置...${NC}"
ssh "$REMOTE_USER@$REMOTE_HOST" "sudo nginx -t"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"
else
    echo -e "${RED}✗ Nginx 配置测试失败${NC}"
    exit 1
fi

# 4. 重载 Nginx
echo -e "${BLUE}[4/4] 重载 Nginx...${NC}"
ssh "$REMOTE_USER@$REMOTE_HOST" "sudo systemctl reload nginx"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx 重载成功${NC}"
else
    echo -e "${RED}✗ Nginx 重载失败${NC}"
    exit 1
fi

# 完成
echo ""
echo -e "${GREEN}======================================"
echo -e "  部署完成！"
echo -e "======================================${NC}"
echo ""
echo -e "网站地址: ${BLUE}https://www.zzrbsw.xyz${NC}"
echo ""
echo -e "${YELLOW}如果遇到问题，请检查:${NC}"
echo "1. SSL 证书配置"
echo "2. Nginx 错误日志: sudo tail -f /var/log/nginx/shuati_error.log"
echo "3. 文件权限: ls -la /var/www/shuati/dist/"
echo ""
