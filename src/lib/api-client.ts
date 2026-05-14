import axios, { AxiosError } from "axios";

export const AUTH_TOKEN_KEY = "lumio_access_token";
export const AUTH_USER_KEY = "lumio_user";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }

    const responseData = error.response?.data as { message?: string | string[] } | undefined;
    const message = Array.isArray(responseData?.message)
      ? responseData?.message.join(", ")
      : responseData?.message || error.message || "Request failed";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
