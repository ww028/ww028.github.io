#!/usr/bin/env bash
# 一键发布：构建 → 上传产物 → 同步文章 → 重启服务 → 刷新 ISR 缓存。
#
# 用法：
#   KART_SSH_KEY=/path/to/kart_deploy_ed25519 ./deploy/publish.sh
#
# 只更新文章（不动代码）时：
#   ./deploy/publish.sh --content-only
set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

# ── 连接参数 ──────────────────────────────────────────────
SSH_KEY="${KART_SSH_KEY:-$HOME/.ssh/kart_deploy_ed25519}"
SSH_HOST="${SSH_HOST:-124.220.100.161}"
SSH_PORT="${SSH_PORT:-33}"
SSH_USER="${SSH_USER:-root}"
REMOTE_APP="/opt/website/app"
REMOTE_CONTENT="/opt/website/content"
OUT_TAR="${PROJECT_ROOT}/website-standalone.tar.gz"

if [ ! -f "$SSH_KEY" ]; then
  echo "找不到 SSH 私钥：$SSH_KEY"
  echo "请用 KART_SSH_KEY=/path/to/key 指定，或把软链放到 ~/.ssh/kart_deploy_ed25519"
  exit 1
fi

ssh_cmd() { ssh -i "$SSH_KEY" -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$@"; }
CONTENT_ONLY=0
[ "${1:-}" = "--content-only" ] && CONTENT_ONLY=1

# ── 1. 构建并上传应用 ─────────────────────────────────────
if [ "$CONTENT_ONLY" -eq 0 ]; then
  ./deploy/build.sh
  echo "==> 上传产物"
  scp -i "$SSH_KEY" -P "$SSH_PORT" -o StrictHostKeyChecking=no "$OUT_TAR" "$SSH_USER@$SSH_HOST":/tmp/website-standalone.tar.gz

  echo "==> 解压到 ${REMOTE_APP}（保留 .next/cache，避免每次发布都全量重渲染）"
  ssh_cmd "mkdir -p ${REMOTE_APP} && tar -xzf /tmp/website-standalone.tar.gz -C ${REMOTE_APP} && rm -f /tmp/website-standalone.tar.gz"
fi

# ── 2. 同步文章 ──────────────────────────────────────────
echo "==> 同步 content/ → ${REMOTE_CONTENT}"
ssh_cmd "mkdir -p ${REMOTE_CONTENT}"
rsync -az --delete -e "ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=no" \
  "${PROJECT_ROOT}/content/" "$SSH_USER@$SSH_HOST:${REMOTE_CONTENT}/"

# ── 3. 重启服务 ──────────────────────────────────────────
if [ "$CONTENT_ONLY" -eq 0 ]; then
  echo "==> 重启服务"
  ssh_cmd "systemctl restart website && sleep 4 && systemctl is-active website"
fi

# ── 4. 刷新 ISR 缓存 ─────────────────────────────────────
# token 只存在服务器上，本地不保存
echo "==> 刷新缓存"
ssh_cmd 'TOKEN=$(cut -d= -f2 /opt/website/revalidate.env); curl -s --noproxy "*" -X POST -H "x-revalidate-token: $TOKEN" http://127.0.0.1:3000/api/revalidate'
echo
echo "==> 验证"
ssh_cmd 'curl -s --noproxy "*" -o /dev/null -w "  /            %{http_code}\n" http://127.0.0.1:3000/; curl -s --noproxy "*" -o /dev/null -w "  /articles    %{http_code}\n" http://127.0.0.1:3000/articles; curl -s --noproxy "*" http://127.0.0.1:3000/sitemap.xml | grep -o "<url>" | wc -l | xargs echo "  sitemap URL 数:"'
echo
echo "发布完成"
