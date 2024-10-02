import type { AxiosError } from "axios";
export declare const setHandleUnauthenticated: (fun: () => void | Promise<() => void>) => void;
export default function useErrorResponse(): {
    getErrorResponse: <T>(response: AxiosError<T>) => Promise<{
        status: import("vue").ShallowRef<any>;
        statusText: import("vue").ShallowRef<any>;
        eResponse: import("vue").ShallowRef<T | undefined>;
    }>;
};
//# sourceMappingURL=useErrorResponse.d.ts.map