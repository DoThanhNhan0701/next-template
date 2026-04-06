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
});

export const dynamicEndpoints = {
  USER_DETAIL: (id: number) => `/api/v1/users/${id}`,
  USER_CHANGE_PASSWORD: (id: number) => `/api/v1/users/${id}/change-password`,
};