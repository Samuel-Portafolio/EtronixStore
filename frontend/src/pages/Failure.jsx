import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Failure() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  return (
    <>
      <Helmet>
        <title>Tienda de Accesorios | Etronix Store</title>
        <meta name="description" content="Explora nuestro catálogo completo..." />
        <link rel="canonical" href="https://etronix-store.com/shop" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Pago rechazado </h1>
          <p className="mb-4">Orden: <b>{orderId}</b>. Intenta de nuevo.</p>
          <Link to="/" className="inline-block bg-black text-white px-4 py-2 rounded-lg">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </>
  );
}
