import { CONSTANTS } from "./constants";

export async function api(endpoint: string, method = "GET", data?: any) {
  const res = await fetch(`${CONSTANTS.API.BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: globalThis.localStorage.getItem(CONSTANTS.TOKEN)
        ? `Bearer ${globalThis.localStorage.getItem(CONSTANTS.TOKEN)}`
        : "",
      "x-admin-login": data?.isAdmin,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = await res.json();

  if (json.token) {
    globalThis.localStorage.setItem(CONSTANTS.TOKEN, json.token);
    globalThis.localStorage.setItem(CONSTANTS.ROLE, json.role);
  }

  return { status: res.status, data: json };
}
