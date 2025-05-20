import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // functions ディレクトリを完全に除外
    config.externals = [
      ...(config.externals || []),
      // Deno を外部として扱う
      { 'deno': 'Deno' },
    ];

    // functions ディレクトリを exclude
    config.module.rules.push({
      test: /functions\//,
      exclude: /node_modules/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
