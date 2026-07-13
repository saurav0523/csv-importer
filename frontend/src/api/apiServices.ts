import axiosInstance from "../lib/api";
import ENDPOINTS from "../utils/endpoints";
import { createSafeApiCall, ApiResponse } from "../lib/apiUtils";
import { CrmRecord, ImportResult } from "../lib/types";

export interface LeadsResponseData {
  leads: CrmRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  stats: {
    total: number;
    sales: number;
    followUps: number;
  };
}

export const getLeads = (
  search: string,
  status: string,
  limit: number,
  offset: number
): Promise<ApiResponse<LeadsResponseData>> => {
  return createSafeApiCall<LeadsResponseData>(() =>
    axiosInstance.get(ENDPOINTS.LEADS.GET(search, status, limit, offset))
  );
};

export const importCsvFile = (file: File): Promise<ApiResponse<ImportResult>> => {
  const formData = new FormData();
  formData.append("file", file);

  return createSafeApiCall<ImportResult>(() =>
    axiosInstance.post(ENDPOINTS.IMPORT.POST, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
