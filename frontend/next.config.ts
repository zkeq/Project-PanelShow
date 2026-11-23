import type { NextConfig } from "next"
import { LOCAL_PORTFOLIO_DOMAIN, resolveApiOrigin } from "./src/lib/site-domain"

type RemotePattern = {
  protocol: "http" | "https"
  hostname: string
  port?: string
  pathname: string
}

const remotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "avatars.githubusercontent.com",
    port: "",
    pathname: "/**"
  }
]

const configuredApiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL
if (configuredApiOrigin) {
  for (const origin of new Set([configuredApiOrigin, resolveApiOrigin(configuredApiOrigin)])) {
    try {
      const apiUrl = new URL(origin)
      const protocol = apiUrl.protocol.replace(":", "")
      if (protocol === "https" || protocol === "http") {
        remotePatterns.push({
          protocol,
          hostname: apiUrl.hostname,
          port: apiUrl.port,
          pathname: "/uploads/**"
        })
      }
    } catch (error) {
      console.warn("Invalid NEXT_PUBLIC_API_BASE_URL for image remote patterns", error)
    }
  }
} else {
  remotePatterns.push({
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/uploads/**"
  })
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  images: {
    remotePatterns
  },
  // 添加开发时的热重载配置
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: [`*.${LOCAL_PORTFOLIO_DOMAIN}`],
    webpack: (config, { dev }) => {
      if (dev && config.watchOptions) {
        config.watchOptions = {
          ...config.watchOptions,
          poll: 1000,
          aggregateTimeout: 300
        }
      }
      return config
    }
  })
}

export default nextConfig
