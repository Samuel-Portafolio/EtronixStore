import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin({ onLoginSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!code.trim()) {
      setError('Por favor ingresa el código de administrador');
      setLoading(false);
      return;
    }

    try {
      // Verificar el código intentando hacer una petición al endpoint protegido
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders?page=1&limit=1`, {
        headers: {
          'x-admin-code': code
        }
      });

      if (res.ok) {
        // Código válido - guardar en localStorage
        localStorage.setItem('adminCode', code);
        localStorage.setItem('adminLoginTime', Date.now().toString());
        onLoginSuccess(code);
      } else if (res.status === 401 || res.status === 403) {
        setError('Código de administrador inválido');
      } else {
        setError('Error de conexión. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-2 sm:px-4">
      <div className="w-full max-w-md">
        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-xl p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary">
                admin_panel_settings
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-light dark:text-text-dark mb-2">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Ingresa tu código de administrador para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                Código de Administrador
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base ${
                  error 
                    ? 'border-red-500' 
                    : 'border-border-light dark:border-border-dark'
                } bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Ingresa tu código secreto"
                autoFocus
              />
              {error && (
                <div className="mt-2 p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">error</span>
                    {error}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-3 rounded-lg bg-primary text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border-light dark:border-border-dark">
            <button
              onClick={() => navigate('/')}
              className="w-full text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">arrow_back</span>
              Volver a la tienda
            </button>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            🔒 Tu código es confidencial. No lo compartas con nadie.
          </p>
        </div>
      </div>
    </div>
  );
}
