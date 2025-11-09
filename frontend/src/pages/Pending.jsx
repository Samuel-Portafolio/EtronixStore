import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Pending() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  return (
    <>
      <Helmet>
        <title>Pago Pendiente | Etronix Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Pago pendiente </h1>
          <p className="mb-4">Estamos esperando confirmación para la orden <b>{orderId}</b>.</p>
          <Link to="/" className="inline-block bg-black text-white px-4 py-2 rounded-lg">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </>
  );
}