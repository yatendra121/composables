import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import type { AxiosInstance } from "axios";
import {
    setAxiosInstance,
    useAxios,
    useAsyncAxios,
    useAsyncAxiosGenerator,
    setHandleUnauthenticated
} from "../";

/** Flush pending microtasks/timers so promise chains settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

interface RecordedCall {
    url: string;
    config: { cancelToken?: unknown; [key: string]: unknown };
}

/**
 * Fake axios instance that resolves every request with `{ data: body }` and
 * records the url/config it was called with.
 */
function recordingInstance(body: unknown) {
    const calls: RecordedCall[] = [];
    const fn = vi.fn((url: string, config: RecordedCall["config"]) => {
        calls.push({ url, config });
        return Promise.resolve({ data: body });
    });
    return { instance: fn as unknown as AxiosInstance, calls };
}

/** Fake axios instance that rejects every request with `err`. */
function rejectingInstance(err: unknown) {
    const fn = vi.fn(() => Promise.reject(err));
    return fn as unknown as AxiosInstance;
}

beforeEach(() => {
    // useErrorResponse logs through console; keep test output clean.
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("useAxios", () => {
    test("starts loading, then populates response and finishes on success", async () => {
        const { instance } = recordingInstance({ id: 1 });
        setAxiosInstance(instance);

        const { response, isLoading, isFinished } = useAxios<{ id: number }>("/x", {
            method: "GET"
        });

        expect(isLoading.value).toBe(true);
        expect(isFinished.value).toBe(false);
        expect(response.value).toBeUndefined();

        await flush();

        expect(response.value).toEqual({ id: 1 });
        expect(isLoading.value).toBe(false);
        expect(isFinished.value).toBe(true);
    });

    test("merges the request config and injects a cancel token", async () => {
        const { instance, calls } = recordingInstance({ ok: true });
        setAxiosInstance(instance);

        useAxios("/users", { method: "POST", data: { a: 1 } });
        await flush();

        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe("/users");
        expect(calls[0].config.method).toBe("POST");
        expect(calls[0].config.data).toEqual({ a: 1 });
        expect(calls[0].config.cancelToken).toBeDefined();
    });

    test("abort() marks the request aborted AND finished", () => {
        // Never-resolving request so abort() is what completes the lifecycle.
        const fn = vi.fn(() => new Promise(() => {}));
        setAxiosInstance(fn as unknown as AxiosInstance);

        const { aborted, isLoading, isFinished, abort } = useAxios("/x", { method: "GET" });

        abort();

        expect(aborted.value).toBe(true);
        expect(isLoading.value).toBe(false);
        // Regression guard: abort previously left isFinished=false.
        expect(isFinished.value).toBe(true);
    });

    test("abort() is a no-op once the request has finished", async () => {
        const { instance } = recordingInstance({ id: 1 });
        setAxiosInstance(instance);

        const { aborted, isFinished, abort } = useAxios("/x", { method: "GET" });
        await flush();
        expect(isFinished.value).toBe(true);

        abort();

        expect(aborted.value).toBe(false);
        expect(isFinished.value).toBe(true);
    });

    test("exposes the parsed error body via the `errorResponse` ref", async () => {
        const axiosError = {
            isAxiosError: true,
            message: "Unprocessable",
            response: { status: 422, statusText: "Unprocessable", data: { error: "bad" } }
        };
        setAxiosInstance(rejectingInstance(axiosError));

        const { response, errorResponse, isFinished } = useAxios<unknown, { error: string }>(
            "/x",
            { method: "GET" }
        );

        await flush();
        await flush();

        expect(errorResponse.value).toEqual({ error: "bad" });
        expect(response.value).toBeUndefined();
        expect(isFinished.value).toBe(true);
    });

    test("ignores cancellation errors (leaves errorResponse empty)", async () => {
        // axios.isCancel() keys off __CANCEL__.
        setAxiosInstance(rejectingInstance({ __CANCEL__: true, message: "canceled" }));

        const { errorResponse, isFinished } = useAxios("/x", { method: "GET" });

        await flush();

        expect(errorResponse.value).toBeUndefined();
        expect(isFinished.value).toBe(true);
    });

    test("exposes alias refs/methods that share identity with their canonical pair", () => {
        const { instance } = recordingInstance({});
        setAxiosInstance(instance);

        const r = useAxios("/x", { method: "GET" });

        expect(r.loading).toBe(r.isLoading);
        expect(r.finished).toBe(r.isFinished);
        expect(r.canceled).toBe(r.aborted);
        expect(r.cancel).toBe(r.abort);
    });
});

describe("useAsyncAxios", () => {
    test("resolves with the response body", async () => {
        const { instance } = recordingInstance({ ok: true });
        setAxiosInstance(instance);

        await expect(useAsyncAxios("/x", { method: "GET" })).resolves.toEqual({ ok: true });
    });

    test("rejects with the original axios error", async () => {
        const err = { isAxiosError: true, message: "boom" };
        setAxiosInstance(rejectingInstance(err));

        await expect(useAsyncAxios("/x", { method: "GET" })).rejects.toBe(err);
    });

    test("passes a provided cancel token through to the request config", async () => {
        const { instance, calls } = recordingInstance({ ok: true });
        setAxiosInstance(instance);
        const source = axios.CancelToken.source();

        await useAsyncAxios("/x", { method: "GET" }, { cancelToken: source });

        expect(calls[0].config.cancelToken).toBe(source.token);
    });

    test("defaults to a generated cancel token when none is supplied", async () => {
        const { instance, calls } = recordingInstance({ ok: true });
        setAxiosInstance(instance);

        await useAsyncAxios("/x", { method: "GET" });

        expect(calls[0].config.cancelToken).toBeDefined();
    });
});

describe("useAsyncAxiosGenerator", () => {
    // total = 25 records, page_size 10 => exactly 3 pages (10 + 10 + 5).
    beforeEach(() => {
        const { instance } = recordingInstance({ data: { total: 25 } });
        setAxiosInstance(instance);
        // Make sure 401s never escape via the shared handler.
        setHandleUnauthenticated(() => {});
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

    test("requests sequential pages and embeds the page in the query string", async () => {
        const { instance, calls } = recordingInstance({ data: { total: 25 } });
        setAxiosInstance(instance);

        const gen = useAsyncAxiosGenerator(
            "/users",
            { method: "GET" },
            { page_size: 10, queryParams: { search: "abc" } }
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _page of gen) {
            /* drain */
        }

        expect(calls.map((c) => c.url)).toEqual([
            "/users?search=abc&page=1",
            "/users?search=abc&page=2",
            "/users?search=abc&page=3"
        ]);
    });

    test("does not mutate the caller's queryParams object", async () => {
        const queryParams = { search: "abc" };
        const gen = useAsyncAxiosGenerator(
            "/users",
            { method: "GET" },
            { page_size: 10, queryParams }
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _page of gen) {
            /* drain */
        }

        expect(queryParams).toEqual({ search: "abc" });
    });

    test("works without queryParams (no crash)", async () => {
        const gen = useAsyncAxiosGenerator("/users", { method: "GET" }, { page_size: 10 });

        let pages = 0;
        for await (const _page of gen) pages++;

        expect(pages).toBe(3);
    });

    test("honours an explicit starting page", async () => {
        const { instance, calls } = recordingInstance({ data: { total: 25 } });
        setAxiosInstance(instance);

        const gen = useAsyncAxiosGenerator(
            "/users",
            { method: "GET" },
            { page_size: 10, page: 3 }
        );
        // page 3 already satisfies 10 * 3 >= 25, so a single page is fetched.
        const first = await gen.next();
        const second = await gen.next();

        expect(first.done).toBe(false);
        expect(second.done).toBe(true);
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe("/users?page=3");
    });

    test("lets the consumer drive the next page via .next(page)", async () => {
        const { instance, calls } = recordingInstance({ data: { total: 25 } });
        setAxiosInstance(instance);

        const gen = useAsyncAxiosGenerator(
            "/users",
            { method: "GET" },
            { page_size: 10, queryParams: {} }
        );

        await gen.next(); // fetch page 1
        await gen.next(5); // consumer jumps to page 5

        expect(calls[0].url).toBe("/users?page=1");
        expect(calls[1].url).toBe("/users?page=5");
    });

    test("supports a custom getTotalCount extractor", async () => {
        const { instance } = recordingInstance({ count: 30, items: [] });
        setAxiosInstance(instance);

        const gen = useAsyncAxiosGenerator<{ count: number }>(
            "/users",
            { method: "GET" },
            { page_size: 10, queryParams: {}, getTotalCount: (res) => res.count }
        );

        let pages = 0;
        for await (const _page of gen) pages++;

        expect(pages).toBe(3);
    });

    test("still completes when a delay between pages is configured", async () => {
        const gen = useAsyncAxiosGenerator(
            "/users",
            { method: "GET" },
            { page_size: 10, queryParams: {}, delay: 1 }
        );

        let pages = 0;
        for await (const _page of gen) pages++;

        expect(pages).toBe(3);
    });

    test("rethrows an Error from a failing request unchanged", async () => {
        setAxiosInstance(rejectingInstance(new Error("boom")));

        const gen = useAsyncAxiosGenerator("/users", { method: "GET" }, { page_size: 10 });

        await expect(gen.next()).rejects.toThrow("boom");
    });

    test("wraps a non-Error rejection in an Error", async () => {
        setAxiosInstance(rejectingInstance({ code: "ECONN" }));

        const gen = useAsyncAxiosGenerator("/users", { method: "GET" }, { page_size: 10 });

        await expect(gen.next()).rejects.toThrow("[object Object]");
    });
});
