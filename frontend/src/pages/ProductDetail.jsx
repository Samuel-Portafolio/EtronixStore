import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";

const API_URL = import.meta.env.VITE_API_URL;        // Ej: http://localhost:3000/api
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, "");  // -> http://localhost:3000

// ------------------------
//   NORMALIZAR URL MEDIA
// ------------------------
function resolveMediaUrl(url) {
  if (!url) return "";

  // Si ya viene con http:// o https:// → no tocar
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Archivos locales subidos → agregar dominio backend
  if (url.startsWith("/uploads")) {
    return `${BACKEND_BASE}${url}`;
  }

  return url;
}

// ------------------------
//   EXTRAER ID DE YOUTUBE
// ------------------------
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

// ------------------------
//   CARRUSEL COMPLETO
// ------------------------
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

      {/* ---- MEDIA ---- */}
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

      {/* ---- NAVEGACIÓN ---- */}
      {media.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10"
        >
          <span className="material-symbols-outlined text-3xl">
            chevron_right
          </span>
        </button>
      )}

      {media.length > 1 && (
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
      )}
    </div>
  );
}

// ------------------------
//   PRODUCT DETAIL PAGE
// ------------------------
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

  return (
    <>
      <Helmet>
        <title>{product.title} | Etronix Store</title>
      </Helmet>

      {/* ---- FONDO ---- */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black z-0" />

      <div className="relative z-10 min-h-screen text-white px-6 py-12 max-w-7xl mx-auto">
        {/* ---- BREADCRUMB ---- */}
        <div className="text-sm mb-6 text-gray-400">
          <Link to="/" className="text-primary hover:underline">Inicio</Link> /{" "}
          <Link to="/shop" className="text-primary hover:underline">Productos</Link> /{" "}
          <span>{product.title}</span>
        </div>

        {/* ---- LAYOUT ---- */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* 🟦 CARRUSEL */}
          <ProductMediaCarousel product={product} />

          {/* 🟦 INFO PRODUCTO */}
          <div>
            <p className="text-primary bg-primary/10 inline-block px-3 py-1 rounded-full text-xs mb-4">
              {product.category}
            </p>

            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

            <p className="text-gray-300 mb-6">{product.description}</p>

            <p className="text-4xl font-bold text-primary mb-2">
              ${product.price.toLocaleString("es-CO")}
            </p>

            <p className="text-gray-400 mb-6">
              Stock disponible: {product.stock}
            </p>
          </div>
        </div>

        {/* ---- TABS ---- */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex gap-6 border-b border-white/10 pb-3 mb-6">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2 ${
                activeTab === "specs"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400"
              }`}
            >
              Especificaciones
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`pb-2 ${
                activeTab === "faqs"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400"
              }`}
            >
              FAQs
            </button>
          </div>

          {activeTab === "specs" && (() => {
            const validSpecs = product.specs && Object.entries(product.specs)
              .filter(([key, value]) => {
                if (Array.isArray(value)) return value.length > 0;
                return value !== undefined && value !== null && value !== "";
              });
            if (validSpecs && validSpecs.length > 0) {
              return (
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-2 text-cyan-400">Especificaciones</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {validSpecs.map(([key, value]) => (
                      <li key={key} className="text-base text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="font-semibold capitalize">{key}:</span> {Array.isArray(value) ? value.join(", ") : value}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })()}

          {activeTab === "faqs" && (
            <div className="space-y-4 text-gray-300">
              {(product.faqs || []).map((f, i) => (
                <div key={i} className="border border-white/10 rounded-lg p-4">
                  <h3 className="font-bold mb-2">{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
