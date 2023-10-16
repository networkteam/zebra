import { NextConfig } from 'next';

export const withZebra = (nextConfig: NextConfig): NextConfig => {
  return {
    ...nextConfig,
    rewrites: async () => {
      const baseUrl = process.env.NEOS_BASE_URL ?? '';
      const neosRewrites = [
        {
          source: '/neos/:path*',
          destination: baseUrl + '/neos/:path*',
        },
        {
          source: '/media/thumbnail/:path*',
          destination: baseUrl + '/media/thumbnail/:path*',
        },
        {
          source: '/_Resources/:path*',
          destination: baseUrl + '/_Resources/:path*',
        },
      ];

      const rewrites = await nextConfig.rewrites?.();

      if (!rewrites) {
        return neosRewrites;
      }
      if (Array.isArray(rewrites)) {
        return rewrites.concat(neosRewrites);
      }

      rewrites.afterFiles = rewrites.afterFiles.concat(neosRewrites);
      return rewrites;
    },
  };
};
