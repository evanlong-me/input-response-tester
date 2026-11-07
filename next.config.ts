import type { NextConfig } from "next";

// 只在 GitHub Actions 构建时设置。Vercel 不提供该变量，站点仍从域名根路径发布。
const basePath =
  process.env.GITHUB_PAGES === "true" ? "/input-response-tester" : "";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
