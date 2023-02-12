import axios from "axios";
import type { AxiosInstance } from "axios";

const cancelToken = axios.CancelToken;

class AxiosPlugin {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  private static instance: AxiosInstance = axios.create({});

  static getInstance(): AxiosInstance {
    return AxiosPlugin.instance;
  }

  static setInstance(instance: AxiosInstance): void {
    this.instance = instance;
  }
}

const setAxiosInstance = (instance: AxiosInstance) => {
  AxiosPlugin.setInstance(instance);
};

export { AxiosPlugin, cancelToken, setAxiosInstance };
