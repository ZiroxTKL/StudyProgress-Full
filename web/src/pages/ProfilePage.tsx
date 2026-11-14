import { useAuth } from "../contexts/AuthContext";
import { PageHeading, Badge, Button } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { friendlyError } from "@studyprogress/client";
export default function ProfilePage() {
  const { user, logout } = useAuth(),
    toast = useToast();
  return (
    <>
      <PageHeading
        eyebrow="TU ESPACIO PERSONAL"
        title="Mi perfil"
        text="Tu cuenta y la forma en que cuidamos tu información."
      />
      <section className="panel profile-panel">
        <span className="avatar large">{user?.nombre[0]}</span>
        <h2>{user?.nombre}</h2>
        <p className="muted">{user?.email}</p>
        <Badge tone="green">
          {user?.rol === "ADMIN" ? "Administrador" : "Estudiante"}
        </Badge>
        <dl>
          <div>
            <dt>Tu cuenta</dt>
            <dd>#{user?.id}</dd>
          </div>
          <div>
            <dt>Datos académicos</dt>
            <dd>Privados y vinculados a tu usuario</dd>
          </div>
          <div>
            <dt>Sesión web</dt>
            <dd>Acceso temporal y renovación segura</dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          onClick={() =>
            logout().catch((e) => toast(friendlyError(e), "error"))
          }
        >
          Cerrar sesión en este dispositivo
        </Button>
      </section>
    </>
  );
}
