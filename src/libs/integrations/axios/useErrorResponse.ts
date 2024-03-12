import { shallowRef } from "vue";
import type { AxiosError } from "axios";

function isPromise(promise: any) {
    return !!promise && typeof promise.then === "function";
}

const executeFuncation = (fun: () => void | Promise<() => void>) => {
    if (isPromise(fun)) {
        //@ts-ignore
        fun().then(() => console.log("promise unauthentication handler executed"));
    } else fun();
};

let unauthenticationError = () => console.log("no unauthenticate handled");

export const setHandleUnauthenticated = (fun: () => void | Promise<() => void>) => {
    unauthenticationError = fun;
};

export default function useErrorResponse() {
    const getErrorResponse = async <T>(response: AxiosError<T>) => {
        const status = shallowRef();
        const statusText = shallowRef();
        const errorResponse = shallowRef<T>();
        if (response.response) {
            const r = response.response;
            status.value = r.status;
            statusText.value = r.statusText;

            if ([400, 422].includes(status.value)) {
                errorResponse.value = r.data;
            } else if ([401].includes(status.value)) {
                executeFuncation(unauthenticationError);
            } else if ([405, 404].includes(status.value)) {
                throw new Error(response.message);
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
