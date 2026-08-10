import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" || Boolean(basePath);

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
