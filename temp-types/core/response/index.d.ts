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
declare class ApiResponse<T> implements ApiResponseInterface<T> {
    private data;
    private errorCode;
    private error;
    private errors;
    private message;
    constructor(response: ApiDataResponse | undefined);
    /**
     * Returns data
     */
    getData(): T | null;
    /**
     * Returns Error code
     */
    getErrorCode(): ApiErrorCode;
    /**
     * Returns error
     */
    getError(): ApiError;
    /**
     * Returns errors
     */
    getErrors(): ApiErrors;
    /**
     * Returns message
     */
    getMessage(): ApiMessage;
}
export { ApiResponse };
//# sourceMappingURL=index.d.ts.map