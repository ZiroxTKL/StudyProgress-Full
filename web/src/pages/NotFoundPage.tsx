import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <main className="state not-found">
      <span className="eyebrow">404</span>
      <h1>Este camino no lleva a un curso</h1>
      <p>La página que buscas no existe o cambió de lugar.</p>
      <Link className="button primary" to="/dashboard">
        Volver a mi espacio
      </Link>
    </main>
  );
}
