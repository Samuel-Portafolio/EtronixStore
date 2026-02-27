import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { io } from "socket.io-client";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";
import ProductMediaCarousel from "../components/ProductMediaCarousel";
import { generateMetaTags, SEO_CONFIG } from "../config/seo";

import hero from "../assets/logoEtronix.webp";

// --- CONSTANTES Y UTILIDADES ---
const BENEFITS = [
  { icon: "🛡️", t: "Garantía 12 meses", d: "Cobertura real en Colombia" },
  { icon: "💳", t: "Pago seguro", d: "Mercado Pago, PSE, tarjetas" },
  { icon: "🚀", t: "Entrega rápida", d: "Envíos a todo el país" },
  { icon: "💬", t: "Soporte humano", d: "WhatsApp cuando lo necesites" },
];

const getInitialProducts = () => {
  try {
    const cachedRaw = localStorage.getItem("featuredProducts");
    if (!cachedRaw) return [];
    const parsed = JSON.parse(cachedRaw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// --- COMPONENTES MEMOIZADOS ---
const ProductCard = memo(function ProductCard({ product }) {
  const images = Array.isArray(product.images) ? product.images : product.image ? [product.image] : [];
  const videos = Array.isArray(product.videos) ? product.videos : [];

  return (
    <article className="group relative rounded-2xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 p-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-4/5 rounded-xl bg-white/5 overflow-hidden mb-4 border border-white/10">
          <ProductMediaCarousel images={images} videos={videos} alt={product.title} aspect="aspect-4/5" />
        </div>

        <h3 className="text-[15px] font-bold text-white line-clamp-1 mb-2">
          {product.title}
        </h3>
        <p className="text-[13px] text-gray-300 line-clamp-2 min-h-10 mb-3">
          {product.description || "Producto de alta calidad con garantía extendida."}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-lg font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {typeof product.price === "number"
              ? `$${product.price.toLocaleString("es-CO")}`
              : "Consultar"}
          </span>
          <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            Ver →
          </span>
        </div>
      </Link>
    </article>
  );
});

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(getInitialProducts);
  const [loading, setLoading] = useState(() => getInitialProducts().length === 0);
  const [showLightRays, setShowLightRays] = useState(false);

  const seoData = generateMetaTags({ title: null, path: "" });

  // 1. Socket.IO para tiempo real
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on("productsUpdated", (data) => {
      const sliced = Array.isArray(data) ? data.slice(0, 5) : [];
      setFeaturedProducts(sliced);
      if (sliced.length > 0) {
        localStorage.setItem("featuredProducts", JSON.stringify(sliced));
      }
    });
    return () => socket.disconnect();
  }, []);

  // 2. Fetch Inicial (Stale-while-revalidate)
  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchProducts() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, { 
          signal: controller.signal 
        });
        const data = await res.json();
        const sliced = Array.isArray(data) ? data.slice(0, 5) : [];
        setFeaturedProducts(sliced);
        localStorage.setItem("featuredProducts", JSON.stringify(sliced));
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, []);

  // 3. Carga diferida de efectos visuales (Performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShowLightRays(true));
      } else {
        setShowLightRays(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        {/* Aquí puedes mantener todos tus scripts de Schema.org que tenías */}
        <script type="application/ld+json">{JSON.stringify({/* ... (Tu JSON original) */})}</script>
      </Helmet>

      {/* FONDO */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        {showLightRays && <LazyLightRays />}
      </div>

      <main className="relative min-h-screen z-10">
        {/* HERO */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-0 pb-12 sm:pb-16 lg:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 lg:col-span-7 flex items-center justify-center">
                <div className="relative flex justify-center lg:justify-start items-center h-[300px] sm:h-[400px] lg:h-[600px] w-full">
                  <OptimizedImage
                    src={hero}
                    alt="Logo Etronix"
                    className="w-full h-auto max-w-[280px] sm:max-w-[400px] lg:max-w-[700px] object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-6">
                  <span className="block">Transforma tu</span>
                  <span className="block bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    experiencia móvil
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-md">
                  En Etronix encuentras calidad, innovación y estilo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link to="/shop" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 text-gray-900">
                    Explorar ahora
                  </Link>
                  <Link to="/offers" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl border-2 border-white/30 text-white">
                    Ver ofertas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DESTACADOS */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-white">Destacados</h2>
              <Link to="/shop" className="text-cyan-400 font-bold hover:underline">Ver todo</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {loading && featuredProducts.length === 0 
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                : featuredProducts.map((p, idx) => <ProductCard key={p._id || idx} product={p} />)
              }
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <div key={i} className="rounded-2xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 p-6 text-center hover:border-cyan-400/50 transition-all">
                  <div className="text-4xl mb-3">{b.icon}</div>
                  <p className="text-base font-black text-white mb-1">{b.t}</p>
                  <p className="text-sm text-gray-300">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// --- COMPONENTES AUXILIARES ---
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
      <div className="aspect-4/5 bg-white/10 rounded-xl mb-3 animate-pulse" />
      <div className="h-4 w-3/4 bg-white/10 rounded mb-2 animate-pulse" />
    </div>
  );
}

function LazyLightRays() {
  const [Component, setComponent] = useState(null);
  useEffect(() => {
    import("../components/LightRays").then((mod) => setComponent(() => mod.default));
  }, []);
  return Component ? <Component raysColor="#00d4ff" className="w-full h-full pointer-events-none opacity-70" /> : null;
}