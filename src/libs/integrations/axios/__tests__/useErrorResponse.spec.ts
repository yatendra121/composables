import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import type { AxiosError } from "axios";
import useErrorResponse, { setHandleUnauthenticated } from "../useErrorResponse";

/** Build a minimal AxiosError carrying a server response. */
function responseError<T>(status: number, data: T, message = "request failed"): AxiosError<T> {
    return {
        message,
        response: { status, statusText: `status-${status}`, data }
    } as unknown as AxiosError<T>;
}

/** Build a minimal AxiosError with no server response (network failure). */
function networkError(message = "Network Error"): AxiosError {
    return { message, response: undefined } as unknown as AxiosError;
}

describe("useErrorResponse", () => {
    beforeEach(() => {
        // Silence the handler/diagnostic logging and reset to a no-op handler so
        // tests don't leak state through the module-level handler.
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
        setHandleUnauthenticated(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("captures the body and status for a 400 response", async () => {
        const { getErrorResponse } = useErrorResponse();
        const body = { errors: { email: ["required"] } };

        const { status, statusText, eResponse } = await getErrorResponse(
            responseError(400, body)
        );

        expect(status.value).toBe(400);
        expect(statusText.value).toBe("status-400");
        expect(eResponse.value).toEqual(body);
    });

    test("captures the body for a 422 response", async () => {
        const { getErrorResponse } = useErrorResponse();
        const body = { message: "Unprocessable" };

        const { status, eResponse } = await getErrorResponse(responseError(422, body));

        expect(status.value).toBe(422);
        expect(eResponse.value).toEqual(body);
    });

    test("invokes the unauthenticated handler on 401 and leaves the body empty", async () => {
        const handler = vi.fn();
        setHandleUnauthenticated(handler);
        const { getErrorResponse } = useErrorResponse();

        const { status, eResponse } = await getErrorResponse(responseError(401, { x: 1 }));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(status.value).toBe(401);
        expect(eResponse.value).toBeUndefined();
    });

    test("supports an async unauthenticated handler on 401", async () => {
        const handler = vi.fn(async () => {});
        setHandleUnauthenticated(handler);
        const { getErrorResponse } = useErrorResponse();

        await getErrorResponse(responseError(401, {}));

        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("replacing the handler means only the latest one runs", async () => {
        const first = vi.fn();
        const second = vi.fn();
        setHandleUnauthenticated(first);
        setHandleUnauthenticated(second);
        const { getErrorResponse } = useErrorResponse();

        await getErrorResponse(responseError(401, {}));

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    test.each([403, 404, 405, 500])(
        "throws with the error message for unhandled status %i",
        async (status) => {
            const { getErrorResponse } = useErrorResponse();

            await expect(getErrorResponse(responseError(status, {}, "boom"))).rejects.toThrow(
                "boom"
            );
        }
    );

    test("throws and logs when there is no response (network error)", async () => {
        const errorSpy = vi.spyOn(console, "error");
        const { getErrorResponse } = useErrorResponse();

        await expect(getErrorResponse(networkError("offline"))).rejects.toThrow("offline");
        expect(errorSpy).toHaveBeenCalled();
    });
});
