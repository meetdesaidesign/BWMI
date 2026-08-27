import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        L: "leaflet",
      }),
    );
    return config;
  },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/BWMI",
        assetPrefix: "/BWMI/",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
