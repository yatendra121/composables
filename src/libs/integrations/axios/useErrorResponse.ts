import { shallowRef } from "vue";
import type { AxiosError } from "axios";

function isPromise(value: unknown): value is Promise<unknown> {
    return !!value && typeof (value as Promise<unknown>).then === "function";
}

const executeFunction = (fun: () => void | Promise<void>) => {
    const result = fun();
    if (isPromise(result)) {
        result.then(() => console.log("promise unauthentication handler executed"));
    }
};

let unauthenticationError: () => void | Promise<void> = () =>
    console.log("no unauthenticate handled");

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
                throw new Error(response.message);
            }
        } else {
            console.error("API Error (No response):", response.message);
            throw new Error(response.message);
        }

        return { status, statusText, eResponse: errorResponse };
    };

    return { getErrorResponse };
}
