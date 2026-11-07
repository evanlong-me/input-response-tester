import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯客户端页面，导出静态文件后由 Workers Static Assets 托管
  output: "export",
};

export default nextConfig;
