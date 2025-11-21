import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";

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

function ProductMediaCarousel({ product }) {
  const images = Array.isArray(product.images)
    ? product.images
    : product.image
    ? [product.image]
    : [];

  const videos = Array.isArray(product.videos) ? product.videos : [];
  const media = [...images, ...videos];

  const [current, setCurrent] = useState(0);

  const currentUrl = resolveMediaUrl(media[current]);

  const isVideo = (url) => {
    return (
      typeof url === "string" &&
      (url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.endsWith(".mp4"))
    );
  };

  const handlePrev = () =>
    setCurrent((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrent((prev) => (prev === media.length - 1 ? 0 : prev + 1));

  if (media.length === 0) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-border-light/40 dark:bg-border-dark/60 flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-text-secondary-light dark:text-text-secondary-dark">
          image
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-border-light/40 dark:bg-border-dark/60 flex items-center justify-center">
      {media.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10"
        >
          <span className="material-symbols-outlined text-3xl">
            chevron_left
          </span>
        </button>
      )}

      <div className="w-full h-full flex items-center justify-center">
        {isVideo(currentUrl) ? (
          currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be") ? (
            <iframe
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl(currentUrl)}
              title="Video del producto"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video controls className="w-full h-full object-contain rounded-xl">
              <source src={currentUrl} type="video/mp4" />
              Tu navegador no soporta el video.
            </video>
          )
        ) : (
          <OptimizedImage
            src={currentUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            priority={true}
          />
        )}
      </div>

      {media.length > 1 && (
        <>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10"
          >
            <span className="material-symbols-outlined text-3xl">
              chevron_right
            </span>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {media.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === current ? "bg-primary" : "bg-white/30"
                } border border-white/50`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
    setToast('Producto agregado al carrito');
    setTimeout(() => setToast(""), 1800);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-white">Producto no encontrado</h2>
      </div>
    );
  }

  // 🔥 CORRECCIÓN: Procesar specs correctamente
  const hasSpecs = product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0;
  const hasFaqs = Array.isArray(product.faqs) && product.faqs.length > 0;

  return (
    <>
      <Helmet>
        <title>{product.title} | Etronix Store</title>
        <meta name="description" content={product.description || `Compra ${product.title} en Etronix Store`} />
      </Helmet>

      <div className="fixed inset-0 bg-linear-to-br from-gray-900 via-slate-900 to-black z-0" />

      <div className="relative z-10 min-h-screen text-white px-6 py-12 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm mb-6 text-gray-400">
          <Link to="/" className="text-primary hover:underline">Inicio</Link> /{" "}
          <Link to="/shop" className="text-primary hover:underline">Productos</Link> /{" "}
          <span>{product.title}</span>
        </div>

        {/* Layout Principal */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Carrusel */}
          <ProductMediaCarousel product={product} />

          {/* Info Producto */}
          <div>
            {product.category && (
              <p className="text-primary bg-primary/10 inline-block px-3 py-1 rounded-full text-xs mb-4 uppercase">
                {product.category}
              </p>
            )}

            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

            {product.description && (
              <p className="text-gray-300 mb-6">{product.description}</p>
            )}

            <p className="text-4xl font-bold text-primary mb-2">
              ${product.price.toLocaleString("es-CO")}
            </p>

            <p className={`text-sm font-bold mb-6 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Agotado'}
            </p>

            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white py-4 font-black hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mb-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {(hasSpecs || hasFaqs) && (
          <div className="mt-10 border-t border-white/10 pt-8">
            <div className="flex gap-6 border-b border-white/10 pb-3 mb-6">
              {hasSpecs && (
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-2 font-bold ${
                    activeTab === "specs"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-400"
                  }`}
                >
                  Especificaciones
                </button>
              )}

              {hasFaqs && (
                <button
                  onClick={() => setActiveTab("faqs")}
                  className={`pb-2 font-bold ${
                    activeTab === "faqs"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-400"
                  }`}
                >
                  Preguntas Frecuentes
                </button>
              )}
            </div>

            {/* 🔥 CORRECCIÓN: Mostrar specs correctamente */}
            {activeTab === "specs" && hasSpecs && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-bold mb-4 text-cyan-400">Especificaciones Técnicas</h2>
                <dl className="space-y-3">
                  {Object.entries(product.specs).map(([key, value]) => {
                    // Evitar mostrar campos vacíos
                    if (!value || (Array.isArray(value) && value.length === 0)) {
                      return null;
                    }

                    return (
                      <div key={key} className="flex border-b border-white/10 pb-2">
                        <dt className="font-bold text-gray-300 capitalize min-w-[150px]">
                          {key}:
                        </dt>
                        <dd className="text-white flex-1">
                          {Array.isArray(value) ? value.join(", ") : value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}

            {activeTab === "faqs" && hasFaqs && (
              <div className="space-y-4 text-gray-300">
                {product.faqs.map((faq, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-3 text-lg">{faq.question}</h3>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/50 flex items-center gap-3 border border-green-400/50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-black">{toast}</span>
        </div>
      )}
    </>
  );
}