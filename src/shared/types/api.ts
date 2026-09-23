import type {
  Budget,
  BudgetStatus,
  Customer,
  Equipment,
  OrderStatus,
  ServiceOrder,
  ServiceOrderHistory,
  User,
  UserRole,
} from "@prisma/client";

export type {
  Budget,
  BudgetStatus,
  Customer,
  Equipment,
  OrderStatus,
  ServiceOrder,
  ServiceOrderHistory,
  User,
  UserRole,
};

/**
 * Standard Paginated Response Structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Safe User Response DTO (excluding secrets)
 */
export type UserResponse = Omit<User, "password_hash">;

/**
 * Dashboard Metrics Response
 */
export interface AdminDashboardResponse {
  newOrdersToday: number;
  pendingBudgets: number;
  readyForPickup: number;
  byStatus: Partial<Record<OrderStatus, number>>;
}

/**
 * Enriched Service Order History with Actor
 */
export interface EnrichedHistoryItem extends ServiceOrderHistory {
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

/**
 * Enriched Customer Detail with Relations
 */
export interface CustomerWithRelations extends Customer {
  equipment?: Equipment[];
  service_orders?: ServiceOrder[];
  _count?: {
    equipment: number;
    service_orders: number;
  };
}

/**
 * Enriched Equipment Detail with Relations
 */
export interface EquipmentWithRelations extends Equipment {
  customer?: Customer;
  service_orders?: ServiceOrder[];
  _count?: {
    service_orders: number;
  };
}

/**
 * Enriched Service Order with Relations
 */
export interface ServiceOrderWithRelations extends ServiceOrder {
  customer: Customer;
  equipment: Equipment;
  technician?: User | null;
  budgets?: Budget[];
  history?: EnrichedHistoryItem[];
  status_label?: string;
}

/**
 * API Standard Error Response
 */
export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
