import {
  createApi,
  type Tokens,
  type SessionStorage,
} from "@studyprogress/client";
let token: string | null = null;
const storage: SessionStorage = {
  access: async () => token,
  refresh: async () => null,
  save: async (t: Tokens) => {
    token = t.token;
  },
  clear: async () => {
    token = null;
  },
};
export const api = createApi(
  import.meta.env.VITE_API_BASE_URL || "/api/v1",
  storage,
  false,
  () => window.dispatchEvent(new Event("session-expired")),
);
