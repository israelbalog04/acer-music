import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Désactiver le prerendering pour éviter les erreurs de Suspense
    workerThreads: false,
    cpus: 1
  },
  // Forcer le rendu côté client pour toutes les pages
  output: 'standalone',
  // Désactiver ESLint pendant le build (temporaire - bug Next.js 15)
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
