/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Suppress warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
