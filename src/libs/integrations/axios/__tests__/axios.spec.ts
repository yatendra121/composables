import { describe, test, expect, vi, beforeEach } from "vitest";
import type { AxiosInstance } from "axios";
import {
    setAxiosInstance,
    useAxios,
    useAsyncAxios,
    useAsyncAxiosGenerator
} from "../";

/** Flush pending microtasks/timers so promise chains settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Build a fake axios instance that returns `{ data: body }` from `impl`. */
function mockInstance(impl: (url: string, config?: unknown) => Promise<unknown>) {
    const fn = vi.fn((url: string, config?: unknown) =>
        Promise.resolve(impl(url, config)).then((body) => ({ data: body }))
    );
    return fn as unknown as AxiosInstance;
}

/** Build a fake axios instance that rejects with `err`. */
function rejectingInstance(err: unknown) {
    const fn = vi.fn(() => Promise.reject(err));
    return fn as unknown as AxiosInstance;
}

describe("useAxios", () => {
    test("populates response on success and marks finished", async () => {
        setAxiosInstance(mockInstance(() => Promise.resolve({ id: 1 })));

        const { response, isLoading, isFinished } = useAxios<{ id: number }>("/x", {
            method: "GET"
        });
        expect(isLoading.value).toBe(true);
        expect(isFinished.value).toBe(false);

        await flush();

        expect(response.value).toEqual({ id: 1 });
        expect(isLoading.value).toBe(false);
        expect(isFinished.value).toBe(true);
    });

    test("abort() marks the request aborted AND finished", () => {
        // Never-resolving request so the abort path is what completes it.
        setAxiosInstance(mockInstance(() => new Promise(() => {})));

        const { aborted, isLoading, isFinished, abort } = useAxios("/x", {
            method: "GET"
        });

        abort();

        expect(aborted.value).toBe(true);
        expect(isLoading.value).toBe(false);
        // Regression: abort previously left isFinished=false.
        expect(isFinished.value).toBe(true);
    });

    test("exposes the parsed error body via the returned `errorResponse` ref", async () => {
        const axiosError = {
            isAxiosError: true,
            message: "Unprocessable",
            response: { status: 422, statusText: "Unprocessable", data: { error: "bad" } }
        };
        setAxiosInstance(rejectingInstance(axiosError));

        const { errorResponse, isFinished } = useAxios<unknown, { error: string }>("/x", {
            method: "GET"
        });

        await flush();

        expect(errorResponse.value).toEqual({ error: "bad" });
        expect(isFinished.value).toBe(true);
    });
});

describe("useAsyncAxios", () => {
    test("resolves with the response body", async () => {
        setAxiosInstance(mockInstance(() => Promise.resolve({ ok: true })));
        await expect(useAsyncAxios("/x", { method: "GET" })).resolves.toEqual({ ok: true });
    });

    test("rejects with the axios error", async () => {
        const err = { isAxiosError: true, message: "boom" };
        setAxiosInstance(rejectingInstance(err));
        await expect(useAsyncAxios("/x", { method: "GET" })).rejects.toBe(err);
    });
});

describe("useAsyncAxiosGenerator", () => {
    beforeEach(() => {
        // total = 25 records, page_size 10 => exactly 3 pages (10 + 10 + 5).
        setAxiosInstance(mockInstance(() => Promise.resolve({ data: { total: 25 } })));
    });

    test("stops once the cumulative count reaches the total (no off-by-one)", async () => {
        const gen = useAsyncAxiosGenerator<{ data: { total: number } }>(
            "/users",
            { method: "GET" },
            { page_size: 10, queryParams: {} }
        );

        let pages = 0;
        for await (const _page of gen) pages++;

        expect(pages).toBe(3);
    });

    test("does not mutate the caller's queryParams object", async () => {
        const queryParams = { search: "abc" };
        const gen = useAsyncAxiosGenerator("/users", { method: "GET" }, {
            page_size: 10,
            queryParams
        });

        // Drain the generator.
        // eslint-disable-next-line no-empty
        for await (const _page of gen) {
        }

        expect(queryParams).toEqual({ search: "abc" });
    });

    test("works without queryParams (no crash)", async () => {
        const gen = useAsyncAxiosGenerator("/users", { method: "GET" }, { page_size: 10 });
        let pages = 0;
        for await (const _page of gen) pages++;
        expect(pages).toBe(3);
    });
});
