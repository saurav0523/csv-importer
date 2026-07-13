import { AxiosError, AxiosResponse } from "axios";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const handleApiSuccess = <T>(response: AxiosResponse<any>): ApiResponse<T> => {
  const responseData = response.data;
  if (responseData && typeof responseData === "object" && "success" in responseData) {
    return {
      success: responseData.success,
      data: responseData.data ?? responseData,
      error: responseData.error,
    };
  }

  return {
    success: true,
    data: responseData,
  };
};

export const handleApiError = (error: AxiosError<any>): ApiResponse => {
  let errorMessage = "An unexpected error occurred. Please try again.";

  if (error.response) {
    const status = error.response.status;
    const responseData = error.response.data;

    if (responseData && typeof responseData === "object") {
      if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    }

    if (!responseData || errorMessage === "An unexpected error occurred. Please try again.") {
      switch (status) {
        case 400:
          errorMessage = "Invalid request. Please check your inputs.";
          break;
        case 401:
          errorMessage = "Session expired. Please log in again.";
          break;
        case 403:
          errorMessage = "You do not have permission to perform this action.";
          break;
        case 404:
          errorMessage = "The requested resource was not found.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = `Request failed with status code ${status}.`;
      }
    }
  } else if (error.request) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please check your internet connection.";
    } else {
      errorMessage = "Network error. Please check your connection.";
    }
  } else {
    errorMessage = error.message || errorMessage;
  }

  return {
    success: false,
    error: errorMessage,
  };
};

export const createSafeApiCall = <T>(
  apiCall: () => Promise<AxiosResponse<any>>
): Promise<ApiResponse<T>> => {
  return apiCall()
    .then((res) => handleApiSuccess<T>(res))
    .catch((err) => handleApiError(err));
};
