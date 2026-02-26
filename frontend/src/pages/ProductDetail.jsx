import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";
import ProductMediaCarousel from "../components/ProductMediaCarousel";

const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, "");

function resolveMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/uploads")) {
    return `${BACKEND_BASE}${url}`;
  }
  return url;
}

function getYouTubeEmbedUrl(url) {
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}


export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specs");
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addToCart = (p) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = cart.find((x) => x._id === p._id);

    if (found) {
      found.quantity += 1;
    } else {
      cart.push({ ...p, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setToast('✅ Producto agregado al carrito');
    setTimeout(() => setToast(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-slate-900 to-black">
        <div className="animate-spin h-16 w-16 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-900 via-slate-900 to-black text-white">
        <span className="material-symbols-outlined text-8xl text-gray-600 mb-4">error</span>
        <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
        <Link to="/shop" className="text-cyan-400 hover:underline">← Volver a la tienda</Link>
      </div>
    );
  }

  // 🔥 CORRECCIÓN: Procesar y validar specs correctamente
  const specsArray = [];

  if (product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)) {
    Object.entries(product.specs).forEach(([key, value]) => {
      // Filtrar campos vacíos, null, undefined, o strings vacíos
      if (key &&
        value !== null &&
        value !== undefined &&
        value !== '' &&
        String(value).trim() !== '') {

        // Formatear el valor
        let displayValue;
        if (Array.isArray(value)) {
          displayValue = value.filter(v => v && String(v).trim() !== '').join(", ");
        } else {
          displayValue = String(value).trim();
        }

        // Solo agregar si el valor formateado no está vacío
        if (displayValue) {
          specsArray.push({ key, value: displayValue });
        }
      }
    });
  }

  const hasSpecs = specsArray.length > 0;
  const hasFaqs = Array.isArray(product.faqs) && product.faqs.length > 0;

  // Obtener imagen principal para SEO
  const mainImage = product.images?.[0] || product.image || '';
  const imageUrl = mainImage.startsWith('http') ? mainImage : `https://etronix-store.com${mainImage}`;
  const productUrl = `https://etronix-store.com/product/${product._id}`;

  // Schema.org de Producto para Google Rich Snippets
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || `${product.title} - Compra en Etronix Store`,
    "image": imageUrl,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Etronix"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "COP",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Etronix Store"
      }
    }
  };

  // Schema de FAQ si el producto tiene preguntas frecuentes
  const faqSchema = hasFaqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": product.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Eliminados logs innecesarios

  return (
    <>
      <Helmet>
        <title>{product.title} | Etronix Store Colombia</title>
        <meta name="description" content={product.description || `Compra ${product.title} en Etronix Store. Envío a toda Colombia. Pago seguro con MercadoPago.`} />
        <link rel="canonical" href={productUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.title} | Etronix Store`} />
        <meta property="og:description" content={product.description || `Compra ${product.title} en Etronix Store`} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:site_name" content="Etronix Store" />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="COP" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title} | Etronix Store`} />
        <meta name="twitter:description" content={product.description || `Compra ${product.title}`} />
        <meta name="twitter:image" content={imageUrl} />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      <div className="fixed inset-0 bg-linear-to-br from-gray-900 via-slate-900 to-black z-0" />

      <div className="relative z-10 min-h-screen text-white px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm mb-6 text-gray-400 flex items-center gap-2">
          <Link to="/" className="text-cyan-400 hover:underline">Inicio</Link>
          <span>/</span>
          <Link to="/shop" className="text-cyan-400 hover:underline">Productos</Link>
          <span>/</span>
          <span className="text-gray-300">{product.title}</span>
        </div>

        {/* Layout Principal */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Carrusel */}
          <div className="h-fit md:sticky md:top-24">
            <ProductMediaCarousel
              images={Array.isArray(product.images) ? product.images : product.image ? [product.image] : []}
              videos={Array.isArray(product.videos) ? product.videos : []}
              alt={product.title}
              aspect="aspect-square"
            />
          </div>

          {/* Info Producto */}
          <div>
            {product.category && (
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-400/30">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">{product.title}</h1>

            {product.description && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-baseline gap-4 mb-6">
              <p className="text-5xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ${product.price.toLocaleString("es-CO")}
              </p>
              {product.stock > 0 && product.stock < 5 && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-400/30">
                  ⚡ Últimas {product.stock} unidades
                </span>
              )}
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold mb-8 ${product.stock > 0
                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                : 'bg-red-500/20 text-red-400 border border-red-400/30'
              }`}>
              <span className="material-symbols-outlined text-xl">
                {product.stock > 0 ? 'check_circle' : 'cancel'}
              </span>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </div>

            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white py-4 font-black text-lg hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5 mb-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>

            <Link
              to="/shop"
              className="block w-full text-center rounded-xl border-2 border-white/30 text-white py-3 font-bold hover:bg-white/10 hover:border-cyan-400/50 transition-all"
            >
              ← Seguir Comprando
            </Link>
          </div>
        </div>

        {/* Tabs */}
        {(hasSpecs || hasFaqs) && (
          <div className="mt-12 pt-8 border-t border-white/10">
            {hasFaqs && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-cyan-400 flex items-center gap-2">
                  <span className="material-symbols-outlined">help</span>
                  Preguntas Frecuentes
                </h2>
                {product.faqs.map((faq, i) => (
                  <details key={i} className="group bg-linear-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-400/30 transition-all">
                    <summary className="cursor-pointer list-none p-6 font-bold text-lg text-white hover:text-cyan-400 transition-colors flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400">help</span>
                        {faq.question}
                      </span>
                      <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                        expand_more
                      </span>
                    </summary>
                    <div className="px-6 pb-6 pt-2">
                      <p className="text-gray-300 leading-relaxed pl-9">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mensaje si no hay specs ni FAQs */}
        {!hasSpecs && !hasFaqs && (
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 italic">No hay información adicional disponible para este producto.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/50 flex items-center gap-3 border border-green-400/50 animate-in slide-in-from-bottom-5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-black">{toast}</span>
        </div>
      )}
    </>
  );
}