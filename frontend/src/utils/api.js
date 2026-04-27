/**
 * Base API URL — uses env variable in production, falls back to Vite proxy in dev.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
