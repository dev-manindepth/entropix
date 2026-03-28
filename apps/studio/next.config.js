/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@entropix/react",
    "@entropix/core",
    "@entropix/ai",
    "@entropix/data",
  ],
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
