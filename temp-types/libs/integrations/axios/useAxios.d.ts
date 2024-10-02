import { CancelTokenSource } from "axios";
import type { Ref } from "vue";
import type { RawAxiosRequestConfig } from "axios";
export interface UseAxiosReturn<T, _E> {
    response: Ref<T | undefined>;
    finished: Ref<boolean>;
    loading: Ref<boolean>;
    isFinished: Ref<boolean>;
    isLoading: Ref<boolean>;
    cancel: (message?: string) => void;
    canceled: Ref<boolean>;
    aborted: Ref<boolean>;
    abort: (message?: string) => void;
}
/**
 * axios.
 * @param url
 */
export declare function useAxios<T = any, _D = any, E = any>(url: string, args: RawAxiosRequestConfig): UseAxiosReturn<T, E>;
export declare function useAsyncAxios<T = any>(url: string, args: RawAxiosRequestConfig, option?: {
    cancelToken: CancelTokenSource;
}): Promise<T>;
export declare function useAsyncAxiosGenerator<T = any>(url: string, args: RawAxiosRequestConfig, option?: {
    queryParams?: any;
    page_size: number;
    page?: number;
    deley?: number;
}): any;
//# sourceMappingURL=useAxios.d.ts.map