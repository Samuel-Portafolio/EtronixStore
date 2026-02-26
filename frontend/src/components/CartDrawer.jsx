import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:3000";

function resolveImageSrc(src) {
  if (!src) return null;
  if (src.startsWith("/uploads")) return `${BACKEND_URL}${src}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${BACKEND_URL}/${src}`;
}

export default function CartDrawer({ open, onClose }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
    };

    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const updateQuantity = (productId, delta) => {
    const updatedCart = cart.map(item => {
      if (item._id === productId) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: Math.max(0, Math.min(newQuantity, item.stock)) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Mi Carrito ({cart.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-4">
                Agrega productos para comenzar tu compra
              </p>
              <Link
                to="/shop"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Ir a la Tienda
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const imgSrc = resolveImageSrc(item.image);
                return (
                  <div
                    key={item._id}
                    className="flex gap-4 bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    {/* ✅ Imagen corregida */}
                    <div className="w-20 h-20 shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.querySelector(".img-fallback").style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="img-fallback w-full h-full items-center justify-center text-gray-300"
                        style={{ display: imgSrc ? "none" : "flex" }}
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-indigo-600 font-bold mb-2">
                        ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="black" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>

                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="black" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-auto p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar del carrito"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              Finalizar Compra
            </Link>

            <button
              onClick={onClose}
              className="block w-full text-center text-gray-600 py-2 mt-2 font-medium hover:text-gray-900 transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}