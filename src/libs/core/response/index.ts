type ApiErrorCode = string;
type ApiErrors = Record<string, string[]>;
type ApiMessage = string;
type ApiError = string;
type ApiServerError = any;

interface ApiResponseInterface<T> {
    getData: () => T | undefined;
    getMessage: () => ApiMessage | undefined;
    getErrorCode(): ApiErrorCode | undefined;
    getErrors(): ApiErrors | undefined;
    getError(): ApiError | undefined;
}

interface ApiResponseValue<T> {
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
class ApiResponse<T> implements ApiResponseInterface<T> {
    constructor(private readonly response: ApiResponseValue<T> = {}) {}

    getErrorCode(): ApiErrorCode | undefined {
        return this.response.errorCode;
    }

    getErrors(): ApiErrors | undefined {
        return this.response.errors;
    }

    getError(): ApiError | undefined {
        return this.response.error;
    }

    getMessage(): ApiMessage | undefined {
        return this.response.message;
    }

    getData(): T | undefined {
        return this.response.data;
    }
}

interface ApiSuccessResponseInterface<T> {
    getData: () => T;
    getMessage: () => ApiMessage;
}

type ApiSuccessResponseValue<T> = Pick<Required<ApiResponseValue<T>>, "data" | "message">;

/**
 * Will use collect data from success api response
 */
class ApiSuccessResponse<T> implements ApiSuccessResponseInterface<T> {
    constructor(private readonly response: ApiSuccessResponseValue<T>) {}

    getData(): T {
        return this.response.data;
    }

    getMessage(): ApiMessage {
        return this.response.message;
    }
}

interface ApiErrorResponseInterface {
    getError: () => string;
    getErrors: () => Record<string, string[]> | undefined;
    getErrorCode: () => string | undefined;
}

type ApiErrorResponseValue = Pick<Required<ApiResponseValue<unknown>>, "errors" | "error"> &
    Pick<ApiResponseValue<unknown>, "errorCode">;

/**
 * Will use collect data from error api response
 */
class ApiErrorResponse implements ApiErrorResponseInterface {
    constructor(private readonly response: ApiErrorResponseValue) {}

    getError() {
        return this.response.error;
    }

    getErrors() {
        return this.response.errors;
    }

    getErrorCode() {
        return this.response.errorCode;
    }
}

export { ApiResponse, ApiSuccessResponse, ApiErrorResponse };
