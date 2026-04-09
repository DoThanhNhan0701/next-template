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

  LOCATIONS: "locations/",
  RBAC_ROLES: "rbac/roles",
  RBAC_PERMISSIONS: "rbac/permissions",
  ASSET_GROUPS: "asset-groups/",
  CATALOG_TYPES: "catalog-types/",
  CATALOG_GROUPS: "catalog-groups/",
  STATUSES: "statuses/",
  USAGE_MODES: "usagemodes/",
  SUPPLIERS: "suppliers/",
  CUSTOMERS: "customers/",
  PHYSICAL_ASSETS: "physical-assets/",
  UNITS: "units/",
  ORG_UNITS: "org/",
  UPLOAD_ATTACHMENTS: "attachments/upload",
  STOCKS: "stocks/",
  RENTALS: "rentals/",
  ALLOCATIONS: "allocations/",
  RECOVERIES: "recoveries/",
  STAFFS: "staffs/",
  TEMPLATES: "workflows/templates/",
  TRANSFERS: "transfers/",
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
  RENTAL_DETAIL: (id: number) => `/api/v1/rentals/${id}`,
  RENTAL_RETURN: (id: number) => `/api/v1/rentals/${id}/return`,
  STAFF_DETAIL: (id: number) => `/api/v1/staffs/${id}`,
  TRANSFER_DETAIL: (id: number) => `/api/v1/transfers/${id}`,
  TRANSFER_ATTACHMENTS: (id: number) => `/api/v1/transfers/${id}/attachments`,
};