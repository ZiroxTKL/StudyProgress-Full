import { useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Target,
  Bell,
  User,
  LogOut,
  Menu,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { friendlyError } from "@studyprogress/client";
const links = [
  ["/dashboard", "Mi resumen", LayoutDashboard],
  ["/cursos", "Mis cursos", BookOpen],
  ["/tareas", "Tareas", CheckSquare],
  ["/objetivos", "Objetivos", Target],
  ["/recordatorios", "Recordatorios", Bell],
  ["/perfil", "Mi perfil", User],
] as const;
export default function Layout() {
  const { user, logout } = useAuth(),
    [open, setOpen] = useState(false),
    toast = useToast(),
    location = useLocation();
  const current = links.find((l) => location.pathname.startsWith(l[0]));
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link className="brand" to="/dashboard">
          <span className="brand-icon">
            <GraduationCap size={24} />
          </span>
          studyprogress<span className="brand-dot">.</span>
        </Link>
        <p className="nav-label">TU ESPACIO DE ESTUDIO</p>
        <nav aria-label="Navegación principal">
          {links.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} onClick={() => setOpen(false)}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span>Un paso a la vez</span>
          <p>
            Cada tarea completada cuenta. Haz espacio para tu próximo logro.
          </p>
          <Target size={44} />
        </div>
        <div className="account">
          <span className="avatar">{user?.nombre[0]}</span>
          <div>
            <strong>{user?.nombre.split(" ")[0]}</strong>
            <small>Estudiante</small>
          </div>
          <button
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={() => {
              logout().catch((e) => toast(friendlyError(e), "error"));
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="menu-button"
              aria-label="Abrir menú"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </button>
            <Link to="/dashboard">Mi espacio</Link>
            <span>/</span>
            <span>{current?.[1] || "Curso"}</span>
          </div>
          <div className="topbar-end">
            <span className="semester">2026 · II</span>
            <Link to="/perfil" className="avatar" aria-label="Ver perfil">
              {user?.nombre[0]}
            </Link>
          </div>
        </header>
        <main id="main-content">
          <Outlet />
        </main>
        <footer>
          StudyProgress{" "}
          <span>
            Tu próximo paso empieza aquí <ArrowUpRight size={13} />
          </span>
        </footer>
      </div>
    </div>
  );
}
