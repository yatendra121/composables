import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "./response";
import { describe, beforeEach, test, expect, it } from "vitest";

describe("ApiResponse", () => {
  let response: ApiResponse<unknown>;
  beforeEach(() => {
    response = new ApiResponse({
      data: "test data",
      errorCode: "errorCode",
      errors: { error: ["test error"] },
      error: "test error",
      message: "test message",
      serverError: "test serverError",
    });
  });
  test("getData should return the data property", () => {
    expect(response.getData()).toBe("test data");
  });
  test("getErrorCode should return the errorCode property", () => {
    expect(response.getErrorCode()).toBe("errorCode");
  });
  test("getError should return the error property", () => {
    expect(response.getError()).toBe("test error");
  });
  test("getErrors should return the errors property", () => {
    expect(response.getErrors()).toEqual({ error: ["test error"] });
  });
  test("getMessage should return the message property", () => {
    expect(response.getMessage()).toBe("test message");
  });
});

describe("ApiSuccessResponse", () => {
  const data = { id: 1, name: "test" };
  const message = "Success";

  it("should create an instance with data and message", () => {
    const response = new ApiSuccessResponse({ data, message });
    expect(response.getData()).toEqual(data);
    expect(response.getMessage()).toEqual(message);
  });

  it("should return data as undefined if not provided", () => {
    const response = new ApiSuccessResponse({ message });
    expect(response.getData()).toBeUndefined();
    expect(response.getMessage()).toEqual(message);
  });

  it("should return message as undefined if not provided", () => {
    const response = new ApiSuccessResponse({ data });
    expect(response.getData()).toEqual(data);
    expect(response.getMessage()).toBeUndefined();
  });
});

describe("ApiErrorResponse", () => {
  describe("constructor", () => {
    it("should set the error property", () => {
      const response = { error: "example error" };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.error).toEqual("example error");
    });

    it("should set the errorCode property", () => {
      const response = { error: "example error", errorCode: 123 };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.errorCode).toEqual(123);
    });

    it("should set the errors property", () => {
      const response = { error: "example error", errors: ["example error 1", "example error 2"] };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.errors).toEqual(["example error 1", "example error 2"]);
    });
  });

  describe("getErrorCode", () => {
    it("should return the error code", () => {
      const response = { error: "example error", errorCode: 123 };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.getErrorCode()).toEqual(123);
    });

    it("should return undefined if errorCode is not set", () => {
      const response = { error: "example error" };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.getErrorCode()).toBeUndefined();
    });
  });

  describe("getError", () => {
    it("should return the error", () => {
      const response = { error: "example error" };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.getError()).toEqual("example error");
    });
  });

  describe("getErrors", () => {
    it("should return the errors", () => {
      const response = { error: "example error", errors: ["example error 1", "example error 2"] };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.getErrors()).toEqual(["example error 1", "example error 2"]);
    });

    it("should return undefined if errors are not set", () => {
      const response = { error: "example error" };
      const apiErrorResponse = new ApiErrorResponse(response);
      expect(apiErrorResponse.getErrors()).toBeUndefined();
    });
  });
});
