/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@entropix/react",
    "@entropix/core",
    "@entropix/ai",
    "@entropix/data",
  ],
  serverExternalPackages: [],
};

export default nextConfig;
