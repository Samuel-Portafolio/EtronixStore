import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Success() {
  const [params] = useSearchParams();
  const orderId = params.get("order");

  return (
    <>
      <Helmet>
        <title>Pago Exitoso | Etronix Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-cyan-950">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/10 dark:bg-black/30 rounded-2xl border-2 border-cyan-400/30 shadow-2xl p-10 text-center backdrop-blur-xl">
            <div className="w-20 h-20 bg-linear-to-br from-green-400 via-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="material-symbols-outlined text-5xl text-white drop-shadow-lg">
                check_circle
              </span>
            </div>

            <h1 className="text-4xl font-black mb-4 bg-clip-text bg-linear-to-r from-cyan-400 via-green-400 to-blue-400 text-transparent">
              ¡Pago Exitoso!
            </h1>

            <p className="text-lg text-gray-200 mb-8">
              Tu orden <span className="font-black text-cyan-400">{orderId}</span> fue confirmada exitosamente.<br />
              Gracias por comprar en <span className="font-black text-cyan-400">Etronix Store</span>.
            </p>

            <div className="flex flex-col gap-4 mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-black text-lg bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:from-cyan-400 hover:to-blue-400 hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                Seguir Comprando
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-black text-lg bg-linear-to-r from-gray-200 to-gray-400 text-cyan-700 shadow-lg hover:from-gray-300 hover:to-gray-500 hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined text-2xl">home</span>
                Volver al Inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}