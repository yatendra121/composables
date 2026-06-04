import { describe, test, expect, afterEach } from "vitest";
import axios from "axios";
import { AxiosPlugin, cancelToken, setAxiosInstance } from "../plugin";

describe("AxiosPlugin", () => {
    // The plugin holds a process-wide singleton; restore it after each test so
    // tests stay order-independent.
    const original = AxiosPlugin.getInstance();
    afterEach(() => {
        AxiosPlugin.setInstance(original);
    });

    test("getInstance returns a callable axios instance by default", () => {
        const instance = AxiosPlugin.getInstance();
        expect(typeof instance).toBe("function");
        expect(typeof instance.getUri).toBe("function");
    });

    test("getInstance returns the same reference on repeated calls (singleton)", () => {
        expect(AxiosPlugin.getInstance()).toBe(AxiosPlugin.getInstance());
    });

    test("setInstance replaces the instance returned by getInstance", () => {
        const custom = axios.create({ baseURL: "https://example.test" });

        AxiosPlugin.setInstance(custom);

        expect(AxiosPlugin.getInstance()).toBe(custom);
    });

    test("setAxiosInstance helper updates the singleton too", () => {
        const custom = axios.create({ baseURL: "https://helper.test" });

        setAxiosInstance(custom);

        expect(AxiosPlugin.getInstance()).toBe(custom);
    });

    test("exposes axios.CancelToken as `cancelToken`", () => {
        expect(cancelToken).toBe(axios.CancelToken);
    });
});
