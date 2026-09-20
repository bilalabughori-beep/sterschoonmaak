import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function getBuildRevision() {
  const fromEnvironment = process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromEnvironment) return fromEnvironment;

  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "local";
  }
}

const buildRevision = getBuildRevision().slice(0, 12);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: false,
  deploymentId: `ster-schoonmaak-${buildRevision}`,
  generateBuildId: async () => `ster-${buildRevision}`,
  images: {
    unoptimized: true,
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
