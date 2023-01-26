type ApiErrorCode = string | null;
type ApiErrors = Record<string, string[]> | null;
type ApiMessage = string | null;
type ApiError = string | null;
type ApiServerError = any | null;

export interface ApiDataResponse<T = any> {
  data: T | null;
  errorCode: ApiErrorCode;
  errors: ApiErrors;
  error: ApiError;
  message: ApiMessage;
  serverError: ApiServerError;
}

export interface ApiResponseInterface<T = any> {
  getData: () => T | null;
  getErrorCode: () => ApiErrorCode;
  getErrors: () => ApiErrors;
  getMessage: () => ApiMessage;
  getError: () => string | null;
}

class ApiResponse<T> implements ApiResponseInterface<T> {
  private data = <T | null>null;
  private errorCode: ApiErrorCode = null;
  private error: ApiError = null;
  private errors: ApiErrors = null;
  private message: ApiMessage = "";
  constructor(response: ApiDataResponse | undefined) {
    if (typeof response === "undefined") return;
    this.data = response.data;
    this.error = response.error;
    this.errorCode = response.errorCode;
    this.errors = response.errors;
    this.message = response.message;
  }

  /**
   * Returns data
   */
  getData() {
    return this.data;
  }

  /**
   * Returns Error code
   */
  getErrorCode() {
    return this.errorCode;
  }

  /**
   * Returns error
   */
  getError() {
    return this.error;
  }

  /**
   * Returns errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Returns message
   */
  getMessage() {
    return this.message;
  }
}

export { ApiResponse };
