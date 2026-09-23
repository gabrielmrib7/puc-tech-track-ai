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
