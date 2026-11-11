/** Contract base URL from §1.4 (override with VITE_API_BASE_URL). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
