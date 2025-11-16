import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";
// ❌ NO importar LightRays aquí - lo cargaremos después del FCP

import hero from "../assets/logoEtronix.webp";

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

const ProductCard = memo(function ProductCard({ product, idx }) {
  return (
    <article className="group relative rounded-2xl backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 p-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-4/5 rounded-xl bg-white/5 overflow-hidden mb-4 border border-white/10">
          {product.image ? (
            <OptimizedImage
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              priority={idx < 2}
              placeholder="blur"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-cyan-500/20 to-blue-500/20">
              <span className="text-white/50 text-4xl">📱</span>
            </div>
          )}
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

export default function Home() {
  const initialProducts = getInitialProducts();
  const [featuredProducts, setFeaturedProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(() => initialProducts.length === 0);
  const [showLightRays, setShowLightRays] = useState(false);

  // ✅ OPTIMIZACIÓN: Solo cargar LightRays DESPUÉS del First Contentful Paint
  useEffect(() => {
    // Esperar a que el contenido principal esté renderizado
    const timer = setTimeout(() => {
      // Usar requestIdleCallback si está disponible
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShowLightRays(true), { timeout: 3000 });
      } else {
        setShowLightRays(true);
      }
    }, 1500); // Delay de 1.5s después del mount

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const CACHE_KEY = "featuredProducts";
    const CACHE_TS_KEY = "featuredProductsTs";
    const CACHE_TTL = 5 * 60 * 1000;

    const cachedTsRaw = localStorage.getItem(CACHE_TS_KEY);
    const now = Date.now();
    const cacheTs = cachedTsRaw ? parseInt(cachedTsRaw, 10) : 0;
    const cacheAge = now - cacheTs;

    if (initialProducts.length > 0 && cacheTs && cacheAge < CACHE_TTL) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`,
          { signal: controller.signal }
        );
        const data = await res.json();
        const sliced = Array.isArray(data) ? data.slice(0, 5) : [];
        setFeaturedProducts(sliced);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(sliced));
          localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } catch {}
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error cargando productos:", error);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [initialProducts.length]);

  return (
    <>
      <Helmet>
        <title>Etronix Store – Accesorios para celulares y tecnología | Tienda Online Colombia</title>
        <meta name="description" content="Accesorios para celulares en Colombia: audífonos, cargadores, cables y más. Envío gratis desde $100.000. Garantía extendida y pago seguro." />
        <link rel="canonical" href="https://etronix-store.com/" />
      </Helmet>

      {/* ✅ Fondo SIMPLE primero (sin WebGL) */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        {/* ✅ Solo cargar LightRays cuando el contenido principal esté listo */}
        {showLightRays && <LazyLightRays />}
      </div>

      <main className="relative min-h-screen z-10">
        {/* HERO */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-0 pb-20">
            <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 col-span-12 lg:col-span-7 flex items-center justify-center">
                <div className="relative flex justify-start items-center h-[400px] lg:h-[600px] xl:h-[700px] overflow-visible">
                  <OptimizedImage
                    src={hero}
                    alt="Logo Etronix - Accesorios tecnológicos"
                    className="absolute left-0 top-1/3 -translate-y-1/2 w-screen max-w-none lg:w-[700px] xl:w-[900px] 2xl:w-[1200px] h-auto object-left object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.45)] z-0"
                    priority
                  />
                </div>
              </div>

              <div className="order-1 lg:order-2 col-span-12 lg:col-span-5 flex flex-col items-center lg:items-start justify-center text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-6 relative z-10 text-center lg:text-left">
                  <span className="block ml-10 lg:ml-10">Transforma</span>
                  <span className="block ml-44 lg:ml-44">tu</span>
                  <span className="block ml-8 lg:ml-8">experiencia</span>
                  <span className="block ml-30 lg:ml-30 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    móvil
                  </span>
                </h1>

                <p className="text-gray-300 text-lg lg:text-xl mb-10 leading-relaxed max-w-md text-center lg:text-left">
                  En Etronix encuentras calidad, innovación y estilo. Potencia tu mundo digital con accesorios premium.
                </p>

                <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 text-gray-900 shadow-lg hover:-translate-y-1 hover:shadow-cyan-400/50 transition-all"
                  >
                    Explorar ahora
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/offers"
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 backdrop-blur-md transition-all"
                  >
                    Ver ofertas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-white">Destacados</h2>
              <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                Ver todo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading && featuredProducts.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 p-4 shadow-lg animate-pulse">
                    <div className="aspect-4/5 bg-white/10 rounded-xl mb-3" />
                    <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {featuredProducts.map((p, idx) => (
                  <ProductCard key={p._id || idx} product={p} idx={idx} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <div
                  key={i}
                  className="rounded-2xl backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 p-6 text-center shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50"
                >
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

// ✅ Componente separado para cargar LightRays de forma lazy
function LazyLightRays() {
  const [LightRaysComponent, setLightRaysComponent] = useState(null);

  useEffect(() => {
    import("../components/LightRays")
      .then((module) => setLightRaysComponent(() => module.default))
      .catch((err) => console.warn("Failed to load LightRays:", err));
  }, []);

  if (!LightRaysComponent) return null;

  return (
    <LightRaysComponent
      raysOrigin="top-center"
      raysColor="#00d4ff"
      raysSpeed={1.5}
      lightSpread={0.9}
      rayLength={1.2}
      followMouse
      mouseInfluence={0.12}
      noiseAmount={0.06}
      distortion={0.03}
      className="w-full h-full pointer-events-none opacity-70"
    />
  );
}