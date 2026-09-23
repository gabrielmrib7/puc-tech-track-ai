/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/admin/dashboard",
      },
      {
        source: "/customers",
        destination: "/admin/customers",
      },
      {
        source: "/equipment",
        destination: "/admin/equipment",
      },
      {
        source: "/settings",
        destination: "/admin/settings",
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
