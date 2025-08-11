import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Désactiver le prerendering pour éviter les erreurs de Suspense
    workerThreads: false,
    cpus: 1
  },
  // Forcer le rendu côté client pour toutes les pages
  output: 'standalone'
};

export default nextConfig;
