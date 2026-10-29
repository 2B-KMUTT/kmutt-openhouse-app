import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: false,
  typescript: {
    // ข้าม typecheck ตอน build เพื่อประหยัด CPU/เวลาบน CI runner (มี step typecheck ใน ci.yml อยู่แล้ว)
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const s3Endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
    return [
      {
        source: "/storage/:path*",
        destination: `${s3Endpoint}/:path*`,
      },
    ];
  },
};

export default nextConfig;
