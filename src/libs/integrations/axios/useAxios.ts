import { ref, shallowRef } from "vue";
import axios, { AxiosError, AxiosInstance, CancelTokenSource } from "axios";
import { AxiosPlugin } from "./plugin";
import useErrorResponse from "./useErrorResponse";
import { objectToQueryString } from "../../core/form";

import type { Ref } from "vue";
import type { RawAxiosRequestConfig } from "axios";

export interface UseAxiosReturn<T, E> {
    response: Ref<T | undefined>;
    errorResponse: Ref<E | undefined>;
    /** Set when the request failed in a way `errorResponse` can't carry (5xx, 403, network). */
    error: Ref<Error | undefined>;
    finished: Ref<boolean>;
    loading: Ref<boolean>;
    isFinished: Ref<boolean>;
    isLoading: Ref<boolean>;
    cancel: (message?: string) => void;
    canceled: Ref<boolean>;
    aborted: Ref<boolean>;
    abort: (message?: string) => void;
}

export function useAxios<T = any, E = any>(
    url: string,
    args: RawAxiosRequestConfig
): UseAxiosReturn<T, E> {
    const instance: AxiosInstance = AxiosPlugin.getInstance();

    const response = ref<T>();
    const isFinished = ref(false);
    const isLoading = ref(true);
    const aborted = ref(false);
    const errorResponse = shallowRef<E>();
    const error = shallowRef<Error>();

    const cancelToken: CancelTokenSource = axios.CancelToken.source();
    const abort = (message?: string) => {
        if (isFinished.value || !isLoading.value) return;

        cancelToken.cancel(message);
        aborted.value = true;
        isLoading.value = false;
        isFinished.value = true;
    };

    instance<T>(url, { ...args, cancelToken: cancelToken.token })
        .then((res) => {
            response.value = res.data;
        })
        .catch(async (e: AxiosError<E>) => {
            if (axios.isCancel(e)) return;
            const { getErrorResponse } = useErrorResponse();
            try {
                const { eResponse } = await getErrorResponse<E>(e);
                errorResponse.value = eResponse.value;
            } catch (unhandled: unknown) {
                // getErrorResponse throws for anything but 400/401/422. Nothing awaits
                // this chain, so rethrowing would be an unhandled rejection.
                error.value = unhandled as Error;
            }
        })
        .finally(() => {
            isLoading.value = false;
            isFinished.value = true;
        });

    return {
        response,
        errorResponse,
        error,
        finished: isFinished,
        loading: isLoading,
        isFinished,
        isLoading,
        cancel: abort,
        canceled: aborted,
        aborted,
        abort
    };
}

export async function useAsyncAxios<T = unknown>(
    url: string,
    args: RawAxiosRequestConfig,
    option: { cancelToken: CancelTokenSource } = {
        cancelToken: axios.CancelToken.source()
    }
): Promise<T> {
    const instance: AxiosInstance = AxiosPlugin.getInstance();
    const { cancelToken } = option;

    const res = await instance<T>(url, { ...args, cancelToken: cancelToken.token });
    return res.data;
}

export interface AsyncAxiosGeneratorOptions<T> {
    /** Extra query params merged into every request. Not mutated. */
    queryParams?: Record<string, unknown>;
    /** Number of records per page. Sent as `page_size`; override via `queryParams`. */
    page_size: number;
    /** 1-based page to start from. Defaults to 1. */
    page?: number;
    /** Delay in milliseconds between page requests. */
    delay?: number;
    /**
     * Extracts the total record count from a page response so the generator
     * knows when to stop. Defaults to reading `response.data.total`.
     */
    getTotalCount?: (response: T) => number | undefined;
}

const defaultGetTotalCount = <T>(response: T): number | undefined =>
    (response as { data?: { total?: number } } | undefined)?.data?.total;

/**
 * Async generator that walks a paginated endpoint page by page. Yields each
 * page response and accepts the next page number via `.next(page)`. Stops once
 * the cumulative fetched count reaches the reported total.
 *
 * @typeParam T - Shape of a single page response body.
 */
export async function* useAsyncAxiosGenerator<T = unknown>(
    url: string,
    args: RawAxiosRequestConfig,
    option: AsyncAxiosGeneratorOptions<T> = { page_size: 10 }
): AsyncGenerator<T, void, number | undefined> {
    const getTotalCount = option.getTotalCount ?? defaultGetTotalCount;
    let page = option.page ?? 1;
    let dataFinished = false;
    const separator = url.includes("?") ? "&" : "?";

    while (!dataFinished) {
        const queryParams = { page_size: option.page_size, ...(option.queryParams ?? {}), page };

        let response: T;
        try {
            response = await useAsyncAxios<T>(
                `${url}${separator}${objectToQueryString(queryParams, "")}`,
                args
            );
        } catch (e: unknown) {
            throw e instanceof Error ? e : new Error(String(e));
        }

        const total = getTotalCount(response);
        if (total !== undefined && option.page_size * page >= total) {
            dataFinished = true;
        }

        const nextPage = yield response;

        if (!dataFinished && option.delay && option.delay > 0)
            await new Promise((resolve) => setTimeout(resolve, option.delay));

        page = nextPage ?? page + 1;
    }
}
