import { useRef, useState } from "react";
import { friendlyError } from "@studyprogress/client";
import { useToast } from "../contexts/ToastContext";
export function useMutation(reload: () => void) {
  const [busy, setBusy] = useState(false),
    running = useRef(false),
    toast = useToast();
  async function run(
    action: () => Promise<unknown>,
    message = "Cambios guardados",
  ) {
    if (running.current) return false;
    running.current = true;
    setBusy(true);
    try {
      await action();
      toast(message);
      reload();
      return true;
    } catch (e) {
      toast(friendlyError(e), "error");
      return false;
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return { busy, run };
}
