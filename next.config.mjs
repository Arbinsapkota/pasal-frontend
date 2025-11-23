/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],

    domains: [
      "i.ibb.co",
      "everestfitness.s3.us-east-1.amazonaws.com",
      "jitneho-live.s3.us-east-1.amazonaws.com",
      "res.cloudinary.com",
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
