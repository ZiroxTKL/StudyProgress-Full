import { describe, it, expect } from "vitest";
import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { createApi, friendlyError } from "./api";
describe("API client safety", () => {
  it("explains status and network failures without server internals", () => {
    expect(
      friendlyError(
        new AxiosError("SQL password leaked", "X", undefined, undefined, {
          status: 500,
          data: {},
          statusText: "",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }),
      ),
    ).not.toContain("SQL");
    expect(friendlyError(new AxiosError("network"))).toContain("conexión");
  });
  it("never retries failed mutations", async () => {
    let calls = 0;
    const api = createApi("https://example.invalid", {
      access: async () => null,
      refresh: async () => null,
      save: async () => {},
      clear: async () => {},
    });
    api.http.defaults.adapter = async (config) => {
      calls++;
      throw new AxiosError("offline", "ERR_NETWORK", config);
    };
    await expect(
      api.saveCourse({ nombre: "DBP", descripcion: "" }),
    ).rejects.toThrow();
    expect(calls).toBe(1);
  });
  it("attaches bearer credentials and honors cancellation", async () => {
    const api = createApi("https://example.invalid", {
      access: async () => "access-token",
      refresh: async () => null,
      save: async () => {},
      clear: async () => {},
    });
    let auth = "";
    api.http.defaults.adapter = async (config) => {
      auth = String(config.headers.Authorization);
      return {
        data: { id: 1 },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };
    await api.me();
    expect(auth).toBe("Bearer access-token");
    const c = new AbortController();
    c.abort();
    await expect(api.me(c.signal)).rejects.toSatisfy(axios.isCancel);
  });
});
