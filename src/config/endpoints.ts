const getEndPoint = <T extends Record<string, string>>(
  baseURL: string,
  subEndpoint: T
) => {
  for (const key in subEndpoint) {
    subEndpoint[key] = `/${baseURL}/${subEndpoint[key]}` as T[Extract<
      keyof T,
      string
    >];
  }

  return subEndpoint;
};

export const endpoints = getEndPoint("api/v1", {
  ME: "auth/me",
  LOGIN: "auth/login",
  LOGOUT: "auth/logout",
  REFRESH: "auth/refresh",
  ROLE: "role",
  USERS: "users",

  LOCATIONS: "locations",
  RBAC_ROLES: "rbac/roles",
  RBAC_PERMISSIONS: "rbac/permissions",
  ASSET_GROUPS: "asset-groups/",
  CATALOG_TYPES: "catalog-types",
  CATALOG_GROUPS: "catalog-groups/",
  STATUSES: "statuses",
  USAGE_MODES: "usagemodes",
  SUPPLIERS: "suppliers",
  CUSTOMERS: "customers",
  PHYSICAL_ASSETS: "physical-assets",
  UNITS: "units/",
  ORG_UNITS: "org",
  UPLOAD_ATTACHMENTS: "attachments/upload",
  STOCKS: "stocks/",
  RENTALS: "rentals",
  ALLOCATIONS: "allocations/",
  RECOVERIES: "recoveries/",
  STAFFS: "staffs",
  TEMPLATES: "workflows/templates/",
  TEMPLATE_ACTIVE: "workflows/templates/active/",
  TRANSFERS: "transfers/",
  WORKFLOW_TASKS: "workflows/tasks/",
  STOCK_ADJUSTMENTS: "stock-adjustments",
  AUDIT_MY_AUDITS: "audit/my-audits",
  AUDIT_SESSIONS: "audit/sessions",
  AUDIT_BATCH_START: "audit/batch-start",
  TREE: 'tree',
  MAINTENANCES: "maintenances",
  LIQUIDATIONS: "liquidations",
  IMPORTANCES: "asset-classifications/importances",
});

export const dynamicEndpoints = {
  USER_DETAIL: (id: number) => `/api/v1/users/${id}`,
  USER_CHANGE_PASSWORD: (id: number) => `/api/v1/users/${id}/change-password`,
  RBAC_ROLE_DETAIL: (id: number) => `/api/v1/rbac/roles/${id}`,
  LOCATION_DETAIL: (id: number) => `/api/v1/locations/${id}`,
  ASSET_GROUP_DETAIL: (id: number) => `/api/v1/asset-groups/${id}`,
  CATALOG_TYPE_DETAIL: (id: number) => `/api/v1/catalog-types/${id}`,
  STATUS_DETAIL: (id: number) => `/api/v1/statuses/${id}`,
  USAGE_MODE_DETAIL: (id: number) => `/api/v1/usagemodes/${id}`,
  SUPPLIER_DETAIL: (id: number) => `/api/v1/suppliers/${id}`,
  CUSTOMER_DETAIL: (id: number) => `/api/v1/customers/${id}`,
  PHYSICAL_ASSET_DETAIL: (id: number) => `/api/v1/physical-assets/${id}`,
  PHYSICAL_ASSET_HOLDERS: (id: number) => `/api/v1/physical-assets/${id}/holders/`,
  PHYSICAL_ASSET_STOCK: (id: number) => `/api/v1/physical-assets/${id}/stock/`,
  RENTAL_DETAIL: (id: number) => `/api/v1/rentals/${id}`,
  RENTAL_RETURN: (id: number) => `/api/v1/rentals/${id}/return`,
  STAFF_DETAIL: (id: number) => `/api/v1/staffs/${id}`,
  TRANSFER_DETAIL: (id: number) => `/api/v1/transfers/${id}`,
  TRANSFER_ATTACHMENTS: (id: number) => `/api/v1/transfers/${id}/attachments`,
  WORKFLOW_TASK_COMPLETE: (id: number) => `/api/v1/workflows/tasks/${id}/complete`,
  AUDIT_COMPLETE: (id: number) => `/api/v1/audit/${id}/complete`,
  AUDIT_SESSION_DETAIL: (id: number) => `/api/v1/audit/sessions/${id}`,
  AUDIT_SESSION_DETAILS: (id: number) => `/api/v1/audit/${id}/details`,
  AUDIT_APPROVE: (id: number) => `/api/v1/audit/${id}/approve`,
  AUDIT_REJECT: (id: number, reason: string) =>
    `/api/v1/audit/${id}/reject?reason=${encodeURIComponent(reason)}`,
  ALL_LOCATION_DETAIL: (id: number) => `/api/v1/allocations/${id}`,
  PHYSICAL_ASSET_LIFECYCLE: (id: number) => `/api/v1/physical-assets/${id}/lifecycle/`,
  WORKFLOW_HISTORY: (type: string, id: number) => `/api/v1/workflows/history/${type}/${id}`,
  STOCK_ADJUSTMENT_DETAIL: (id: number) => `/api/v1/stock-adjustments/${id}`,
  MAINTENANCE_DETAIL: (id: number) => `/api/v1/maintenances/${id}`,
  LIQUIDATION_DETAIL: (id: number) => `/api/v1/liquidations/${id}`,
  DOCUMENT_DETAIL: (documentType: string, id: number) => {
    const map: Record<string, string> = {
      allocation: `/api/v1/allocations/${id}`,
      stock_in: `/api/v1/stock-adjustments/${id}`,
      stock_out: `/api/v1/stock-adjustments/${id}`,
      transfer: `/api/v1/transfers/${id}`,
      recovery: `/api/v1/recoveries/${id}`,
      rental: `/api/v1/rentals/${id}`,
      liquidation: `/api/v1/liquidations/${id}`,
    };
    return map[documentType] ?? `/api/v1/allocations/${id}`;
  },
};