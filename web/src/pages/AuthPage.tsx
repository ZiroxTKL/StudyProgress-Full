import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Check, ArrowUpRight } from "lucide-react";
import { loginSchema, registerSchema } from "@studyprogress/client";
import { ResourceForm, type Field } from "../components/ResourceForm";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";
export default function AuthPage() {
  const location = useLocation(),
    register = location.pathname === "/registro",
    auth = useAuth(),
    navigate = useNavigate(),
    toast = useToast();
  const fields: Field[] = [
    ...(register ? [{ name: "nombre", label: "Nombre completo" }] : []),
    { name: "email", label: "Correo electrónico", type: "email" },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      hint: register
        ? "Mínimo 8 caracteres con mayúscula, minúscula y número."
        : undefined,
    },
  ];
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <Link to="/login" className="brand">
          <GraduationCap />
          studyprogress.
        </Link>
        <div>
          <p className="eyebrow">MENOS CAOS. MÁS AVANCE.</p>
          <h1>
            Tu semestre,
            <br />
            con un poco
            <br />
            más de <em>claridad.</em>
          </h1>
          <p>
            Cursos, tareas y objetivos en un solo lugar.
            <br />
            Concéntrate en aprender, nosotros te ayudamos a seguir el ritmo.
          </p>
          <div className="story-check">
            <Check size={18} /> Un próximo paso, siempre a la vista.
          </div>
        </div>
        <span className="auth-bottom">
          HECHO PARA TU VIDA UNIVERSITARIA <ArrowUpRight size={20} />
        </span>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <span className="auth-tag">TU ESPACIO ACADÉMICO</span>
          <h2>
            {register
              ? "Empecemos tu próximo capítulo"
              : "Qué bueno tenerte de vuelta"}
          </h2>
          <p className="muted">
            {register
              ? "Crea tu cuenta y organiza tu semestre."
              : "Ingresa para continuar donde lo dejaste."}
          </p>
          {auth.error && <p className="form-error">{auth.error}</p>}
          <ResourceForm
            key={register ? "register" : "login"}
            fields={fields}
            schema={register ? registerSchema : loginSchema}
            initial={{ nombre: "", email: "", password: "" }}
            submitLabel={register ? "Crear mi cuenta" : "Ingresar a mi espacio"}
            onSubmit={async (v) => {
              if (register) {
                await api.register(v.nombre, v.email, v.password);
                toast("Cuenta creada. ¡Bienvenido a StudyProgress!");
              }
              await auth.login(v.email, v.password);
              const from = (location.state as { from?: string } | null)?.from;
              navigate(
                from?.startsWith("/") && !from.startsWith("//")
                  ? from
                  : "/dashboard",
                { replace: true },
              );
            }}
          />
          <p className="auth-switch">
            {register ? "¿Ya tienes cuenta?" : "¿Primera vez por aquí?"}{" "}
            <Link to={register ? "/login" : "/registro"}>
              {register ? "Inicia sesión" : "Crea una cuenta"}
            </Link>
          </p>
          <p className="auth-privacy">
            Tu información académica es personal. Solo tú puedes acceder a tus
            cursos.
          </p>
        </div>
      </section>
    </div>
  );
}
