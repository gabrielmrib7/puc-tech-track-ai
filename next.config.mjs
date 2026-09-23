/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/dashboard",
      },
      {
        source: "/admin/service-orders",
        destination: "/service-orders",
      },
      {
        source: "/admin/service-orders/new",
        destination: "/service-orders/new",
      },
      {
        source: "/admin/service-orders/:id",
        destination: "/service-orders/:id",
      },
    ];
  },
};

export default nextConfig;
