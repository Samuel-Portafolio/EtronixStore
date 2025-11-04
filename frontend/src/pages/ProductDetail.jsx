// frontend/src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addToCart = () => {
    // Guardar en localStorage para que Shop.jsx lo tome
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = cart.find(x => x._id === product._id);
    
    if (found) {
      found.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    // Notificar actualización del carrito
    window.dispatchEvent(new Event('cartUpdated'));
    setToast('✓ Producto agregado al carrito');
    setTimeout(() => setToast(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Producto no encontrado</p>
            <Link to="/shop" className="text-primary hover:underline">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link to="/" className="text-primary hover:underline">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="text-primary hover:underline">Productos</Link>
          <span className="mx-2">/</span>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">
            {product.title}
          </span>
        </div>

        {/* Producto */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Imagen */}
          <div className="aspect-square rounded-xl overflow-hidden bg-border-light dark:bg-border-dark">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-text-secondary-light dark:text-text-secondary-dark">
                  image
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
              {product.category}
            </div>
            
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
              {product.title}
            </h1>
            
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
              {product.description}
            </p>

            <div className="mb-6">
              <p className="text-4xl font-bold text-primary">
                ${product.price?.toLocaleString("es-CO") || "0"}
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Stock disponible: {product.stock || 0} unidades
              </p>
            </div>

            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>

            {/* Features rápidas */}
            {product.specs?.features && product.specs.features.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {product.specs.features.map((feature, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark"
                  >
                    <span className="material-symbols-outlined text-primary text-lg">
                      check_circle
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs de información */}
        <div className="border-t border-border-light dark:border-border-dark pt-8">
          <div className="flex gap-4 border-b border-border-light dark:border-border-dark mb-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === 'specs'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary'
              }`}
            >
              Especificaciones
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === 'faqs'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary'
              }`}
            >
              Preguntas Frecuentes
            </button>
          </div>

          {/* Especificaciones */}
          {activeTab === 'specs' && product.specs && (
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value || key === 'features') return null;
                return (
                  <div key={key} className="flex border-b border-border-light dark:border-border-dark pb-3">
                    <span className="font-semibold capitalize w-1/3 text-text-light dark:text-text-dark">
                      {key === 'brand' ? 'Marca' : 
                       key === 'model' ? 'Modelo' :
                       key === 'color' ? 'Color' :
                       key === 'material' ? 'Material' :
                       key === 'compatibility' ? 'Compatibilidad' :
                       key === 'warranty' ? 'Garantía' : key}:
                    </span>
                    <span className="text-text-secondary-light dark:text-text-secondary-dark w-2/3">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQs */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              {product.faqs && product.faqs.length > 0 ? (
                product.faqs.map((faq, idx) => (
                  <div 
                    key={idx}
                    className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-5"
                  >
                    <h3 className="font-bold text-text-light dark:text-text-dark mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                      {faq.answer}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
                  No hay preguntas frecuentes para este producto
                </p>
              )}
              
              <div className="mt-8 p-6 bg-primary/5 rounded-lg text-center">
                <p className="text-text-light dark:text-text-dark font-semibold mb-2">
                  ¿Tienes otra pregunta?
                </p>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                  Contáctanos por WhatsApp y te respondemos en minutos
                </p>
                <a 
                  href="https://wa.me/573001234567?text=Hola,%20tengo%20una%20pregunta%20sobre%20este%20producto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          {toast}
        </div>
      )}
    </div>
  );
}