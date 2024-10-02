type ApiErrorCode = string;
type ApiErrors = Record<string, string[]>;
type ApiMessage = string;
type ApiError = string;
interface ApiResponseInterface<T> {
    getData: () => T | undefined;
    getMessage: () => ApiMessage | undefined;
    getErrorCode(): ApiErrorCode | undefined;
    getErrors(): ApiErrors | undefined;
    getError(): ApiError | undefined;
}
export interface ApiResponseValue<T = any> {
    readonly data?: T;
    readonly errorCode?: ApiErrorCode;
    readonly error?: ApiError;
    readonly errors?: ApiErrors;
    readonly message?: ApiMessage;
    readonly serverError?: any;
}
/**
 * Will use collect data from api response
 */
declare class ApiResponse<T = any> implements ApiResponseInterface<T> {
    private readonly response;
    constructor(response?: ApiResponseValue<T>);
    getErrorCode(): ApiErrorCode | undefined;
    getErrors(): ApiErrors | undefined;
    getError(): ApiError | undefined;
    getMessage(): ApiMessage | undefined;
    getData(): T | undefined;
}
interface ApiSuccessResponseInterface<T> {
    getData: () => T;
    getMessage: () => ApiMessage;
}
export type ApiSuccessResponseValue<T> = Pick<Required<ApiResponseValue<T>>, "data" | "message">;
/**
 * Will use collect data from success api response
 */
declare class ApiSuccessResponse<T> implements ApiSuccessResponseInterface<T> {
    private readonly response;
    constructor(response: ApiSuccessResponseValue<T>);
    getData(): T;
    getMessage(): ApiMessage;
}
interface ApiErrorResponseInterface {
    getError: () => string;
    getErrors: () => Record<string, string[]> | undefined;
    getErrorCode: () => string | undefined;
}
export type ApiErrorResponseValue = Pick<Required<ApiResponseValue<unknown>>, "errors" | "error"> & Pick<ApiResponseValue<unknown>, "errorCode">;
/**
 * Will use collect data from error api response
 */
declare class ApiErrorResponse implements ApiErrorResponseInterface {
    private readonly response;
    constructor(response: ApiErrorResponseValue);
    getError(): string;
    getErrors(): ApiErrors;
    getErrorCode(): string | undefined;
}
export { ApiResponse, ApiSuccessResponse, ApiErrorResponse };
//# sourceMappingURL=index.d.ts.map