import { ref, shallowRef } from "vue";
import axios, { AxiosError, AxiosInstance, AxiosResponse, CancelTokenSource } from "axios";
import { AxiosPlugin } from "./plugin";
import useErrorResponse from "./useErrorResponse";
import { objectToQueryString } from "../../core/form";
//import { objectToQueryString } from "@qnx/composables";

//types
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
export function useAxios<T = any, _D = any, E = any>(
    url: string,
    args: RawAxiosRequestConfig
): UseAxiosReturn<T, E> {
    const config: RawAxiosRequestConfig = args;
    const instance: AxiosInstance = AxiosPlugin.getInstance();

    const response = ref<T>();
    const isFinished = ref(false);
    const isLoading = ref(true);
    const aborted = ref(false);
    const errorResponse = shallowRef<E>();

    const cancelToken: CancelTokenSource = axios.CancelToken.source();
    const abort = (message?: string) => {
        if (isFinished.value || !isLoading.value) return;

        cancelToken.cancel(message);
        aborted.value = true;
        isLoading.value = false;
        isFinished.value = false;
    };

    console.log("---------Composable: UseAxios-----------");
    console.log({ url, config });
    instance<T>(url, { ...config, cancelToken: cancelToken.token })
        .then((res) => {
            response.value = res.data;
        })
        .catch(async (e: AxiosError<E>) => {
            console.log({ e });
            const { getErrorResponse } = useErrorResponse();
            const { eResponse } = await getErrorResponse<E>(e);
            errorResponse.value = eResponse.value;
        })
        .finally(() => {
            isLoading.value = false;
            isFinished.value = true;
        });

    return {
        response,
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

export async function useAsyncAxios<T = any>(
    url: string,
    args: RawAxiosRequestConfig,
    option: { cancelToken: CancelTokenSource } = {
        cancelToken: axios.CancelToken.source()
    }
): Promise<T> {
    const config: RawAxiosRequestConfig = args;
    const instance: AxiosInstance = AxiosPlugin.getInstance();

    const { cancelToken } = option;

    try {
        const res = await instance<T>(url, {
            ...config,
            cancelToken: cancelToken.token
        });
        return res.data;
    } catch (e: unknown) {
        const err = e as AxiosError<T>;
        return Promise.reject(err);
    }
}

export async function* useAsyncAxiosGenerator<T = any>(
    url: string,
    args: RawAxiosRequestConfig,
    option: {
        queryParams?: any;
        page_size: number;
        page?: number;
        deley?: number;
    } = {
        page_size: 10
    }
): any {
    let page = 1;
    let nextPage;
    let response;
    let dataFinished = false;
    while (nextPage !== 0 && !dataFinished) {
        console.log({ page });
        option.queryParams.page = page;
        try {
            response = await useAsyncAxios<T>(
                `${url}?${objectToQueryString(option.queryParams, "")}`,
                args
            );
        } catch (e: any) {
            throw new Error(e.message);
        }

        nextPage = yield response;
        page = nextPage ?? ++page;

        if (option && option.deley && option.deley > 0)
            await new Promise((resolve) => setTimeout(resolve, option.deley));
        //@ts-ignore
        if (option && option.page_size * page >= response.data.data.total) dataFinished = true;
    }
}

// const apiParams = reactive({ page: 1, page_size: 3, search: '' })

// const axiosGenerator = useAsyncAxiosGenerator(
//   `user`,
//   {
//     method: 'GET'
//   },
//   { queryParams: apiParams, page_size: 10 }
// )

// const loadMore = async () => {
//   loading.value = true
//   const test = await axiosGenerator.next().finally(() => {
//     loading.value = false
//   })
//   console.log(test)
// }
