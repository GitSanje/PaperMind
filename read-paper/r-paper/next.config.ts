import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack:{
    resolveAlias:{
        canvas:'./empty-module.ts',
      }
  },
  serverExternalPackages:['faiss-node','pdf-parse','fs'],
  // trailingSlash:true
  reactStrictMode:false
};

export default nextConfig;
