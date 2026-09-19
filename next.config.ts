import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone：产出自带最小依赖的服务端产物，用 node .next/standalone/server.js 启动。
  // 原来是 "export" 纯静态导出，改一篇文章就要全量重新构建 + 重新上传。
  output: "standalone",
};

export default nextConfig;
