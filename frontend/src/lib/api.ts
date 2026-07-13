import axios, { AxiosInstance } from "axios";
import ENDPOINTS from "../utils/endpoints";
import { CrmRecord, ImportResult } from "./types";
import { ApiResponse, createSafeApiCall } from "./apiUtils";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});



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

export default axiosInstance;
