module.exports = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          child_process: false,
          fs: false,
          net: false,
          tls: false,
        };
      }
      return config;
    },
    images: {
      remotePatterns: [
        {
          protocol: 'http', // Allow any protocol (http or https)
          hostname: '**', // Allow any hostname
          port: '**',     // Allow any port
          pathname: '**', // Allow any pathname
        },
      ],
    },
    async rewrites() {
      return [
        {
          source: '/.well-known/:path*',
          destination: '/api/well-known/:path*',
        },
        {
          source: '/comments/:path*',
          destination: '/api/core/comments/:path*',
        }
      ];
    },
  };
  