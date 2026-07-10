const ENDPOINTS = {
  LEADS: {
    GET: (search: string, status: string, limit: number, offset: number) =>
      `/api/leads?search=${encodeURIComponent(search)}&status=${status}&limit=${limit}&offset=${offset}`,
  },
  IMPORT: {
    POST: "/api/import",
  },
} as const;

export default ENDPOINTS;
