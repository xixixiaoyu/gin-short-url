/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  },
  
  // API 代理配置（开发环境）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/:path*`,
      },
    ];
  },
  
  // 图片优化配置
  images: {
    domains: ['localhost'],
  },
  
  // 实验性功能
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
