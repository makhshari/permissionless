/** @type {import('next').NextConfig} */
const nextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config, { isServer }) => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      
      // Handle ethers.js properly
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        };
      }
      
      return config;
    },
  };
  
  export default nextConfig;
  