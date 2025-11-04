import { useSearchParams, Link } from "react-router-dom";

export default function Success() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">
              check_circle
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-text-light dark:text-text-dark">
            ¡Pago Aprobado! 
          </h1>
          
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            Tu orden <span className="font-bold text-primary">{orderId}</span> fue confirmada exitosamente.
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/shop" 
              className="block w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Seguir Comprando
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-border-light dark:bg-border-dark text-text-light dark:text-text-dark px-6 py-3 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}