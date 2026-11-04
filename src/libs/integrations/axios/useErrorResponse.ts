import { shallowRef } from "vue";
import type { AxiosError } from "axios";

const isPromise = (value: unknown): value is Promise<unknown> =>
    !!value && typeof (value as Promise<unknown>).then === "function";

// A failing handler must not replace the request's own outcome, or reject unobserved.
const executeFunction = (fun: () => void | Promise<void>) => {
    try {
        const result = fun();
        if (isPromise(result)) result.catch(console.error);
    } catch (e: unknown) {
        console.error(e);
    }
};

let unauthenticationError: () => void | Promise<void> = () =>
    console.warn("[@qnx/composables] 401 received; register a handler with setHandleUnauthenticated");

export const setHandleUnauthenticated = (fun: () => void | Promise<void>) => {
    unauthenticationError = fun;
};

export default function useErrorResponse() {
    const getErrorResponse = async <T>(response: AxiosError<T>) => {
        const status = shallowRef<number | undefined>();
        const statusText = shallowRef<string | undefined>();
        const errorResponse = shallowRef<T>();

        if (response.response) {
            const r = response.response;
            status.value = r.status;
            statusText.value = r.statusText;

            if ([400, 422].includes(r.status)) {
                errorResponse.value = r.data;
            } else if (r.status === 401) {
                executeFunction(unauthenticationError);
            } else {
                throw new Error(response.message, { cause: response });
            }
        } else {
            console.error("API Error (No response):", response.message);
            throw new Error(response.message, { cause: response });
        }

        return { status, statusText, eResponse: errorResponse };
    };

    return { getErrorResponse };
}
