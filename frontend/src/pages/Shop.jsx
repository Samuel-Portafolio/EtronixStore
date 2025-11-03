import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    })();

    // Cargar carrito desde localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const addToCart = (p) => {
    setCart((prev) => {
      const found = prev.find((x) => x._id === p._id);
      if (found) {
        const updated = prev.map((x) =>
          x._id === p._id ? { ...x, quantity: x.quantity + 1 } : x
        );
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      }
      const newCart = [...prev, { ...p, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const found = prev.find((x) => x._id === id);
      if (found && found.quantity > 1) {
        const updated = prev.map((x) =>
          x._id === id ? { ...x, quantity: x.quantity - 1 } : x
        );
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      }
      const filtered = prev.filter((x) => x._id !== id);
      localStorage.setItem('cart', JSON.stringify(filtered));
      return filtered;
    });
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = cart.reduce((a, i) => a + i.quantity, 0);

  const goToCheckout = () => {
    if (!cart.length) return;
    // Guardar carrito en localStorage y navegar al checkout
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={totalItems} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-8">
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-8">
          Productos
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div 
                key={p._id} 
                className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow p-6 flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                      {p.description}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-primary mb-2">
                    ${p.price.toLocaleString("es-CO")}
                  </p>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Stock: {p.stock}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className="w-full rounded-lg bg-primary text-black py-3 font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {p.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
                  </button>
                  <Link
                    to={`/products/${p._id}`}
                    className="block w-full text-center rounded-lg border border-primary text-primary py-2 font-semibold hover:bg-primary hover:text-black transition-colors"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="mt-12 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow p-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              Carrito de Compras
            </h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div 
                  key={item._id}
                  className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-light dark:text-text-dark">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      ${item.price.toLocaleString("es-CO")} x {item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-border-light dark:bg-border-dark hover:bg-primary hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-text-light dark:text-text-dark w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-border-light dark:bg-border-dark hover:bg-primary hover:text-white transition-colors"
                    >
                      +
                    </button>
                    <p className="font-bold text-text-light dark:text-text-dark ml-4 min-w-[100px] text-right">
                      ${(item.price * item.quantity).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
              <div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Total ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                </p>
                <p className="text-3xl font-bold text-text-light dark:text-text-dark">
                  ${total.toLocaleString("es-CO")}
                </p>
              </div>
              
              <button
                onClick={goToCheckout}
                className="rounded-lg bg-primary text-black py-3 px-8 font-bold hover:bg-opacity-90 transition-colors"
              >
                Continuar con la Compra
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}