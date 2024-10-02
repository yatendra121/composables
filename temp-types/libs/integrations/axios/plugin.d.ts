import type { AxiosInstance } from "axios";
declare const cancelToken: import("axios").CancelTokenStatic;
declare class AxiosPlugin {
    private constructor();
    private static instance;
    static getInstance(): AxiosInstance;
    static setInstance(instance: AxiosInstance): void;
}
declare const setAxiosInstance: (instance: AxiosInstance) => void;
export { AxiosPlugin, cancelToken, setAxiosInstance };
//# sourceMappingURL=plugin.d.ts.map