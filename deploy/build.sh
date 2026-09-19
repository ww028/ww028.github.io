#!/usr/bin/env bash
# 本地构建 standalone 产物并打包。
#
# ⚠️ 必须在本地构建，不要在 2G 内存的服务器上跑 next build（峰值可能 1G+，会 OOM）。
#
# 用法：./deploy/build.sh
set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"
OUT_TAR="${PROJECT_ROOT}/website-standalone.tar.gz"

# 用 mv 而不是 rm -rf 清理旧产物：
# 本机有批量删除保护，Next 清理 .next 时会触发阈值导致构建直接失败。
if [ -d .next ]; then
  mv .next "/tmp/ww028-next-$(date +%s)"
fi

echo "==> 构建（output: standalone）"
# env -u NODE_OPTIONS：环境里可能注入了 Next worker 不接受的参数
# （如 --use-system-ca），会让构建报 ERR_WORKER_INVALID_EXEC_ARGV。
env -u NODE_OPTIONS npm run build

echo "==> 补齐 standalone 不会自动带上的目录"
# standalone 产物默认不含 public/ 和 .next/static/，必须手动拷，
# 否则线上会丢静态资源和图片（之前线上就是漏了 _next 导致页面没样式）。
mkdir -p .next/standalone
[ -d public ] && mkdir -p .next/standalone/public && cp -r public/. .next/standalone/public/
mkdir -p .next/standalone/.next/static
cp -r .next/static/. .next/standalone/.next/static/

echo "==> 打包"
tar -czf "${OUT_TAR}" -C .next/standalone .

echo
echo "完成：${OUT_TAR}  ($(du -h "${OUT_TAR}" | cut -f1))"
echo "下一步：./deploy/publish.sh"
