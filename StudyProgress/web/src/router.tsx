import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Spinner } from "./components/ui";
import Layout from "./components/Layout";
const AuthPage = lazy(() => import("./pages/AuthPage")),
  DashboardPage = lazy(() => import("./pages/DashboardPage")),
  CoursesPage = lazy(() => import("./pages/CoursesPage")),
  TasksPage = lazy(() => import("./pages/TasksPage")),
  CourseDetailPage = lazy(() => import("./pages/CourseDetailPage")),
  PersonalPage = lazy(() => import("./pages/PersonalPage")),
  ProfilePage = lazy(() => import("./pages/ProfilePage")),
  NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
function PrivateRoute() {
  const a = useAuth(),
    location = useLocation();
  return a.loading ? (
    <Spinner />
  ) : a.user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
}
const page = (node: React.ReactNode) => (
  <Suspense fallback={<Spinner />}>{node}</Suspense>
);
export const router = createBrowserRouter([
  { path: "/login", element: page(<AuthPage />) },
  { path: "/registro", element: page(<AuthPage />) },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: page(<DashboardPage />) },
          { path: "/cursos", element: page(<CoursesPage />) },
          { path: "/cursos/:id", element: page(<CourseDetailPage />) },
          { path: "/tareas", element: page(<TasksPage />) },
          { path: "/objetivos", element: page(<PersonalPage key="goals" />) },
          {
            path: "/recordatorios",
            element: page(<PersonalPage key="reminders" />),
          },
          { path: "/perfil", element: page(<ProfilePage />) },
        ],
      },
    ],
  },
  { path: "*", element: page(<NotFoundPage />) },
]);
