/**
 * TechTrack Route Map
 * Centralizes all supported application routes and API endpoints,
 * eliminating dead '#' links.
 */
export const ROUTES = {
  // Public & Authentication
  home: "/",
  login: "/login",
  postLogin: "/post-login",

  // Administrative & Staff Areas
  admin: {
    dashboard: "/admin/dashboard",
    orders: "/service-orders",
    newOrder: "/service-orders/new",
    orderDetail: (id: string) => `/service-orders/${id}`,
    customers: "/admin/customers",
    equipment: "/admin/equipment",
    settings: "/admin/settings",
    users: "/admin/users",
  },

  // Customer Portal Areas
  portal: {
    home: "/portal",
    orders: "/portal/orders",
    orderDetail: (id: string) => `/customer/orders/${id}`,
    budgetApproval: (id: string) => `/orders/${id}/budget`,
  },

  // REST API v1
  api: {
    dashboard: "/api/v1/admin/dashboard",
    customers: "/api/v1/customers",
    customerDetail: (id: string) => `/api/v1/customers/${id}`,
    equipment: "/api/v1/equipment",
    equipmentDetail: (id: string) => `/api/v1/equipment/${id}`,
    users: "/api/v1/users",
    userDetail: (id: string) => `/api/v1/users/${id}`,
    serviceOrders: "/api/v1/service-orders",
    serviceOrderDetail: (id: string) => `/api/v1/service-orders/${id}`,
    serviceOrderStatus: (id: string) => `/api/v1/service-orders/${id}/status`,
    serviceOrderDiagnosis: (id: string) => `/api/v1/service-orders/${id}/diagnosis`,
    serviceOrderBudget: (id: string) => `/api/v1/service-orders/${id}/budget`,
    serviceOrderBudgetDecision: (id: string, decision: "approve" | "reject") =>
      `/api/v1/service-orders/${id}/budget/${decision}`,
    serviceOrderDeliver: (id: string) => `/api/v1/service-orders/${id}/deliver`,
    customerOrders: "/api/v1/customer/orders",
    customerOrderDetail: (id: string) => `/api/v1/customer/orders/${id}`,
    webhooksClerk: "/api/webhooks/clerk",
  },
} as const;
