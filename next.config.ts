import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: false,
  typescript: {
    // ข้าม typecheck ตอน build เพื่อประหยัด CPU/เวลาบน CI runner (มี step typecheck ใน ci.yml อยู่แล้ว)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
