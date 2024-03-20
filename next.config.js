/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  env: {
    BASE_API_URL: process.env.BASE_API_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
