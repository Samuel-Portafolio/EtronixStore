import { Link } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import LightRays from "../components/LightRays";
import OptimizedImage from "../components/OptimizedImage"; // ✅ YA AGREGADO
const FAQ = lazy(() => import("../components/FAQ"));

import hero from "../assets/logoEtronix.webp";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("featuredProducts");
    if (cached) {
      setFeaturedProducts(JSON.parse(cached));
      setLoading(false);
    }

    
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        const sliced = Array.isArray(data) ? data.slice(0, 5) : [];
        setFeaturedProducts(sliced);
        localStorage.setItem("featuredProducts", JSON.stringify(sliced));
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badges = ["BEST", "NEW", "SALE", "HOT", "NEW"];

  return (
    <>
      <Helmet>
        <title>Etronix Store – Accesorios para celulares y tecnología | Tienda Online Colombia</title>
        <meta name="description" content="Accesorios para celulares en Colombia: audífonos, cargadores, cables y más. Envío gratis desde $100.000. Garantía extendida y pago seguro." />
        <meta name="keywords" content="accesorios celulares, audífonos, cargadores, cables, protectores, fundas, tecnología Colombia, tienda online" />
        <meta property="og:title" content="Etronix Store – Accesorios Tecnológicos Premium en Colombia" />
        <meta property="og:description" content="Accesorios para celulares con envío a toda Colombia. Garantía extendida, pago seguro y soporte 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://etronix-store.com/" />
        <meta property="og:image" content="https://etronix-store.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Etronix Store – Accesorios para celulares" />
        <meta name="twitter:description" content="Audífonos, cargadores, cables y más con garantía extendida" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Etronix Store",
            url: "https://etronix-store.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://etronix-store.com/shop?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
        <link rel="canonical" href="https://etronix-store.com/" />
      </Helmet>

      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        <LightRays
          /*raysOrigin="top-center"
          raysColor="#00d4ff"
          raysSpeed={1.5} 
          lightSpread={0.9}
          rayLength={1.2} 
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.06}
          distortion={0.03}
          className="w-full h-full pointer-events-none opacity-70"*/
        />
      </div>

      <main className="relative min-h-screen z-10">
        {/* ---------- HERO (diseño tipo imagen referencia) ---------- */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-0 pb-20">
            <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Robot grande a la izquierda */}
              <div className="order-2 lg:order-1 col-span-12 lg:col-span-7 flex items-center justify-center">
                <div className="relative flex justify-start items-center h-[400px] lg:h-[600px] xl:h-[700px] overflow-visible">
                  <OptimizedImage
                    src={hero}
                    alt="Logo Etronix - Accesorios tecnológicos"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-screen max-w-none lg:w-[850px] xl:w-[1050px] 2xl:w-[1230px] h-auto object-left object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.45)] z-0"
                    priority
                  />
                </div>
              </div>
              {/* Texto y botones a la derecha */}
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
                  En Etronix encuentras calidad, innovación y estilo. Potencia tu mundo digital con accesorios premium, envíos rápidos y pagos seguros.
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

        {/* ---------- FEATURED PRODUCTS ---------- */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-white">
                  Destacados
                </h2>
              </div>
              <Link
                to="/shop"
                className="hidden md:inline-flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Ver todo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
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
                  <article
                    key={p._id || idx}
                    className="group relative rounded-2xl backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 p-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50"
                  >
                    <Link to={`/products/${p._id}`} className="block">
                      {/* ⚠️ CAMBIO 2: Imágenes de productos destacados */}
                      <div className="aspect-4/5 rounded-xl bg-white/5 overflow-hidden mb-4 border border-white/10">
                        {p.image ? (
                          <OptimizedImage
                            src={p.image}
                            alt={p.title}
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
                        {p.title}
                      </h3>
                      <p className="text-[13px] text-gray-300 line-clamp-2 min-h-10] mb-3">
                        {p.description || "Producto de alta calidad con garantía extendida."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-lg font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                          {typeof p.price === "number" ? `$${p.price.toLocaleString("es-CO")}` : "Consultar"}
                        </span>
                        <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                          Ver →
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- BENEFICIOS ---------- */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🛡️", t: "Garantía 12 meses", d: "Cobertura real en Colombia" },
                { icon: "💳", t: "Pago seguro", d: "Mercado Pago, PSE, tarjetas" },
                { icon: "🚀", t: "Entrega rápida", d: "Envíos a todo el país" },
                { icon: "💬", t: "Soporte humano", d: "WhatsApp cuando lo necesites" },
              ].map((b, i) => (
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

        <Suspense fallback={null}>
          <FAQ />
        </Suspense>
      </main>
    </>
  );
}
