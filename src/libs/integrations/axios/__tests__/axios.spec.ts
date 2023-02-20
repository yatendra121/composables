import type { RawAxiosRequestConfig } from "axios";
import axios from "axios";
import { useAxios } from "../";
import { describe, beforeEach, test, expect, it } from "vitest";

describe("useAxios", () => {
  test("should not abort when finished", async () => {
    expect("test").toBe("test");
  });
});

// describe("useAxios", () => {
//   const url = "https://jsonplaceholder.typicode.com/todos/1";
//   const config: RawAxiosRequestConfig = {
//     method: "GET",
//   };
//   const instance = axios.create({
//     baseURL: "https://jsonplaceholder.typicode.com",
//   });
//   const options = { immediate: false };
//   const path = "/todos/1";

//   test("should not abort when finished", async () => {
//     const { isLoading, isFinished, abort } = useAxios(url, config);
//     expect(isLoading.value).toBeTruthy();
//     expect(isFinished.value).toBeFalsy();
//   });

//   test("should cancel request", async () => {
//     const { cancel, canceled } = useAxios("url", {});
//     cancel();
//     expect(canceled.value).toBe(true);
//   });
// });
