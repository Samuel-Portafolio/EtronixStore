import { Link } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import LightRays from "../components/LightRays";
import OptimizedImage from "../components/OptimizedImage"; // ✅ YA AGREGADO
const FAQ = lazy(() => import("../components/FAQ"));

import hero from "../assets/LogoEtronixBordesRedondos.svg";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        setFeaturedProducts(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setFeaturedProducts([]);
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
      </div>

      <main className="relative min-h-screen z-10">
        {/* ---------- HERO ---------- */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 rounded-3xl p-8 lg:p-10 border border-white/20 shadow-2xl">
                  <h1 className="text-4xl lg:text-6xl font-black leading-[1.05] text-white mb-5">
                    Actualiza tu{" "}
                    <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      mundo móvil
                    </span>
                  </h1>
                  <p className="text-gray-200 text-lg leading-relaxed mb-8">
                    Calidad real, envíos rápidos y pagos seguros. Celulares, cargadores, cables y más para tu día a día.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-gray-900 font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-cyan-500/50 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400"
                    >
                      Explorar ahora
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>

                    <Link
                      to="/offers"
                      className="inline-flex items-center gap-2 rounded-xl px-7 py-4 font-bold shadow-lg transition-all hover:-translate-y-1 border-2 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:border-cyan-400/50"
                    >
                      Ver ofertas
                    </Link>
                  </div>
                </div>
              </div>

              {/* ⚠️ CAMBIO 1: Imagen del Hero - PRIORIDAD ALTA */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-3xl" />
                  <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl overflow-visible">
                    <div className="overflow-visible flex items-center justify-center -m-12">
                      {/* ❌ ANTES: */}
                      {/* <img
                        src={hero}
                        alt="Hero Etronix"
                        className="w-full h-auto rounded-2xl object-contain drop-shadow-2xl scale-95"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                      /> */}

                      {/* ✅ DESPUÉS: */}
                      <OptimizedImage
                        src={hero}
                        alt="Hero Etronix - Accesorios para celulares"
                        className="w-full h-auto rounded-2xl object-contain drop-shadow-2xl scale-95"
                        priority={true}
                        placeholder="none"
                      />
                    </div>
                  </div>
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
                          /* ❌ ANTES: */
                          /* <img
                            src={p.image}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            decoding="async"
                          /> */

                          /* ✅ DESPUÉS: */
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
