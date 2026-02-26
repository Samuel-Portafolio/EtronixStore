import { useEffect } from "react";
import { useRouteError, useNavigate } from "react-router-dom";

/**
 * Captura errores de chunks dinámicos que fallan al cargar
 * (ocurre cuando se hace deploy y el usuario tiene la versión anterior en caché).
 * 
 * Uso en tu router:
 *   <Route errorElement={<ChunkErrorBoundary />} />
 */
export default function ChunkErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isChunkError =
    error instanceof TypeError &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed") ||
      error.message.includes("error loading dynamically imported module"));

  useEffect(() => {
    if (!isChunkError) return;

    // Marcar que ya intentamos recargar para no entrar en loop infinito
    const alreadyReloaded = sessionStorage.getItem("chunk_reload");

    if (!alreadyReloaded) {
      sessionStorage.setItem("chunk_reload", "1");
      // Forzar recarga completa (sin caché)
      window.location.reload();
    } else {
      // Si ya recargamos y sigue fallando, limpiar la marca
      sessionStorage.removeItem("chunk_reload");
    }
  }, [isChunkError]);

  // Limpiar la marca cuando la navegación funciona bien
  useEffect(() => {
    sessionStorage.removeItem("chunk_reload");
  }, []);

  if (isChunkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔄</div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Actualizando la app...
          </h1>
          <p className="text-gray-400 mb-6">
            Hay una nueva versión disponible. Recargando automáticamente.
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors"
          >
            Si no carga, haz clic aquí
          </button>
        </div>
      </div>
    );
  }

  // Error genérico (no es de chunk)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Algo salió mal
        </h1>
        <p className="text-gray-400 mb-6">
          {error?.message || "Error inesperado. Intenta recargar la página."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-cyan-500 text-gray-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Recargar
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}