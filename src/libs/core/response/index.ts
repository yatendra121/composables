type ApiErrorCode = string;
type ApiErrors = Record<string, string[]>;
type ApiMessage = string;
type ApiError = string;
type ApiServerError = any;

/**
 * Created types for response
 */
export interface ApiResponseInterface<T = any> {
  data?: T;
  errorCode?: ApiErrorCode;
  errors?: ApiErrors;
  error?: ApiError;
  message?: ApiMessage;
  serverError?: ApiServerError;
  getData: () => T | undefined;
  getErrorCode: () => ApiErrorCode | undefined;
  getErrors: () => ApiErrors | undefined;
  getMessage: () => ApiMessage | undefined;
  getError: () => ApiError | undefined;
}

type ApiSuccessResponseInterface<T> = Required<
  Pick<ApiResponseInterface<T>, "data" | "message" | "getData" | "getMessage">
>;

export type ApiSuccessResponseValue<T> = Pick<ApiSuccessResponseInterface<T>, "data" | "message">;

type ApiErrorResponseInterface = Pick<
  ApiResponseInterface,
  "getErrorCode" | "getErrors" | "getError"
> &
  Pick<ApiResponseInterface, "errorCode" | "errors"> &
  Required<Pick<ApiResponseInterface, "error">>;

export type ApiErrorResponseValue = Pick<
  ApiErrorResponseInterface,
  "errorCode" | "errors" | "error"
>;

/**
 * Created for collect all response from server
 */
class ApiResponse<T = any> implements ApiResponseInterface<T> {
  data?: T;
  errorCode?: ApiErrorCode;
  error?: ApiError;
  errors?: ApiErrors;
  message?: ApiMessage;
  serverError?: any;
  constructor(response: ApiResponse<T>) {
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

/**
 * Created for collect success response from server
 */
class ApiSuccessResponse<T = any> implements ApiSuccessResponseInterface<T> {
  data: T;
  message: ApiMessage;

  constructor(response: ApiSuccessResponseValue<T>) {
    this.data = response.data;
    this.message = response.message;
  }

  /**
   * Returns data
   */
  getData() {
    return this.data;
  }

  /**
   * Returns message
   */
  getMessage() {
    return this.message;
  }
}

/**
 * Created for collect error response from server
 */
class ApiErrorResponse implements ApiErrorResponseInterface {
  errorCode?: ApiErrorCode;
  error: ApiError;
  errors?: ApiErrors;
  serverError?: any;
  constructor(response: ApiErrorResponseValue) {
    this.error = response.error;
    this.errorCode = response.errorCode;
    this.errors = response.errors;
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
}

export { ApiResponse, ApiSuccessResponse, ApiErrorResponse };
