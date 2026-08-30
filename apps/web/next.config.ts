import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Traces the pnpm-workspace deps into .next/standalone so the production
  // Docker image doesn't need to ship the full node_modules tree.
  output: 'standalone',
};

export default nextConfig;
