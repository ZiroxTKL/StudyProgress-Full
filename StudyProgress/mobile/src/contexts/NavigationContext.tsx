import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { BackHandler } from "react-native";
export type Route = {
  name:
    | "dashboard"
    | "courses"
    | "course"
    | "tasks"
    | "goals"
    | "reminders"
    | "tools"
    | "profile";
  id?: number;
};
type Action =
  | { type: "push"; route: Route }
  | { type: "back" }
  | { type: "tab"; route: Route };
function reducer(state: Route[], action: Action): Route[] {
  if (action.type === "back")
    return state.length > 1 ? state.slice(0, -1) : state;
  if (action.type === "tab") return [action.route];
  return [...state, action.route];
}
const Context = createContext<{
  route: Route;
  go: (route: Route) => void;
  back: () => void;
  tab: (route: Route) => void;
  canBack: boolean;
} | null>(null);
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, dispatch] = useReducer(reducer, [{ name: "dashboard" }]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (stack.length === 1) return false;
      dispatch({ type: "back" });
      return true;
    });
    return () => sub.remove();
  }, [stack.length]);
  return (
    <Context.Provider
      value={{
        route: stack[stack.length - 1],
        canBack: stack.length > 1,
        go: (route) => dispatch({ type: "push", route }),
        tab: (route) => dispatch({ type: "tab", route }),
        back: () => dispatch({ type: "back" }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useNavigation() {
  const n = useContext(Context);
  if (!n) throw new Error("NavigationProvider requerido");
  return n;
}
