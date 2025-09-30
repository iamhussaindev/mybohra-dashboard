import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.less'],
  },
  images: {},
}

export default nextConfig
