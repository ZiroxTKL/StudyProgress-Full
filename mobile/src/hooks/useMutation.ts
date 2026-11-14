import { useRef, useState } from "react";
import { Alert } from "react-native";
import { friendlyError } from "@studyprogress/client";
export function useMutation(reload: () => void) {
  const [busy, setBusy] = useState(false),
    lock = useRef(false);
  async function run(
    action: () => Promise<unknown>,
    message = "Cambios guardados",
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await action();
      reload();
      Alert.alert("Listo", message);
    } catch (e) {
      Alert.alert("No se pudo completar", friendlyError(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, run };
}
