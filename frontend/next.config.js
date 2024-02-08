/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  
  env:{
    DEPLOY_URL: "https://alantick.vercel.app"
  }
}

module.exports = nextConfig
