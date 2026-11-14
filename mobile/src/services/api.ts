import * as SecureStore from "expo-secure-store";
import {
  createApi,
  type SessionStorage,
  type Tokens,
} from "@studyprogress/client";
let expire = () => {};
export const setExpiredHandler = (handler: () => void) => {
  expire = handler;
};
export const storage: SessionStorage = {
  access: () => SecureStore.getItemAsync("sp.access"),
  refresh: () => SecureStore.getItemAsync("sp.refresh"),
  save: async (t: Tokens) => {
    if (t.refreshToken)
      await SecureStore.setItemAsync("sp.refresh", t.refreshToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    await SecureStore.setItemAsync("sp.access", t.token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync("sp.access"),
      SecureStore.deleteItemAsync("sp.refresh"),
    ]);
  },
};
const url = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api/v1";
if (!__DEV__ && !url.startsWith("https://"))
  throw new Error(
    "EXPO_PUBLIC_API_URL debe usar HTTPS para una compilación de producción",
  );
export const api = createApi(url, storage, true, () => expire());
