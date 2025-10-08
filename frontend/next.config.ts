import type { NextConfig } from "next";

const remotePatterns: any[] = [
  {
    protocol: 'https' as const,
    hostname: 'avatars.githubusercontent.com',
    port: '',
    pathname: '/**',
  },
];

if (process.env.NEXT_PUBLIC_API_BASE_URL) {
  try {
    const apiUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL);
    const protocol = apiUrl.protocol.replace(':', '');
    if (protocol === 'https') {
      remotePatterns.push({
        protocol: 'https' as const,
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: '/uploads/**',
      });
    } else if (protocol === 'http') {
      remotePatterns.push({
        protocol: 'http' as const,
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: '/uploads/**',
      });
    }
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_API_BASE_URL for image remote patterns', error);
  }
} else {
  remotePatterns.push({
    protocol: 'http' as const,
    hostname: 'localhost',
    port: '8000',
    pathname: '/uploads/**',
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
  // 添加开发时的热重载配置
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config, { dev }) => {
      if (dev && config.watchOptions) {
        config.watchOptions = {
          ...config.watchOptions,
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;
