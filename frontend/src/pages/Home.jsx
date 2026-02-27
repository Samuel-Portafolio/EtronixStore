import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";
import { generateMetaTags } from "../config/seo";
import { SEO_CONFIG } from "../config/seo";

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

import ProductMediaCarousel from "../components/ProductMediaCarousel";

const ProductCard = memo(function ProductCard({ product, idx }) {
  // Soporte para múltiples imágenes y videos
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

export default function Home() {
  const initialProducts = getInitialProducts();
  const [featuredProducts, setFeaturedProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(() => initialProducts.length === 0);
  const [showLightRays, setShowLightRays] = useState(false);

  const seoData = generateMetaTags({
    title: null, // Usar título por defecto
    path: ''
  });

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

    const controller = new AbortController();

    // SIEMPRE hacer fetch — mostrar caché mientras llega la respuesta (stale-while-revalidate)
    // El bloqueo por TTL causaba que ediciones del admin no se reflejaran en Home
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
          if (sliced.length > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(sliced));
            localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
          } else {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TS_KEY);
          }
        } catch { }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error cargando productos:", error);
        }
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TS_KEY);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://etronix-store.com/" />
        <meta property="og:image" content={seoData.image || 'https://etronix-store.com/logo.png'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image || 'https://etronix-store.com/logo.png'} />
        <link rel="canonical" href="https://etronix-store.com/" />

        {/* Open Graph */}
        <meta property="og:title" content={seoData.openGraph.title} />
        <meta property="og:description" content={seoData.openGraph.description} />
        <meta property="og:url" content={seoData.openGraph.url} />
        <meta property="og:image" content={seoData.openGraph.image} />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.twitter.title} />
        <meta name="twitter:description" content={seoData.twitter.description} />
        <meta name="twitter:image" content={seoData.twitter.image} />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": SEO_CONFIG.siteName,
            "url": SEO_CONFIG.siteUrl,
            "description": SEO_CONFIG.defaultDescription,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${SEO_CONFIG.siteUrl}/shop?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": SEO_CONFIG.organization.name,
              "logo": {
                "@type": "ImageObject",
                "url": `${SEO_CONFIG.siteUrl}${SEO_CONFIG.organization.logo}`
              }
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Etronix",
            "url": "https://etronix-store.com/",
            "description": "Etronix es una tienda online especializada en accesorios y tecnología premium para celulares en Colombia. Ofrecemos garantía extendida, envíos rápidos y atención personalizada todos los días.",
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+57-3207208410",
              "contactType": "customer service",
              "availableLanguage": ["Spanish"]
            }],
            "sameAs": [
              "https://instagram.com/Etronix2025"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Etronix",
            "image": "https://etronix-store.com/logo.png",
            "url": "https://etronix-store.com/",
            "telephone": "+57-3207208410",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CO"
            },
            "openingHours": "Todos los días"
          })}
        </script>
      </Helmet>

      {/* ✅ Fondo SIMPLE primero (sin WebGL) */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        {/* ✅ Solo cargar LightRays cuando el contenido principal esté listo */}
        {/*showLightRays && <LazyLightRays />}*/}
      </div>

      <main className="relative min-h-screen z-10">
        {/* HERO */}
        <section className="relative">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-0 pb-12 sm:pb-16 lg:pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Imagen - Full width en móvil, 7 cols en desktop */}
      <div className="order-2 lg:order-1 lg:col-span-7 flex items-center justify-center">
        <div className="relative flex justify-center lg:justify-start items-center h-[300px] sm:h-[400px] lg:h-[600px] xl:h-[700px] w-full overflow-hidden">
          <OptimizedImage
            src={hero}
            alt="Logo Etronix"
            className="w-full h-auto max-w-[280px] sm:max-w-[400px] lg:max-w-[700px] xl:max-w-[900px] object-contain"
            priority
          />
        </div>
      </div>

      {/* Texto - Full width en móvil, 5 cols en desktop */}
      <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-6">
          <span className="block">Transforma</span>
          <span className="block">tu</span>
          <span className="block">experiencia</span>
          <span className="block bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            móvil
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-md">
          En Etronix encuentras calidad, innovación y estilo.
        </p>

        {/* Botones responsive */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 text-gray-900"
          >
            Explorar ahora
          </Link>
          <Link
            to="/offers"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl border-2 border-white/30 text-white"
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
                  <div key={i} className="rounded-2xl bg-white/10 border border-white/20 p-4 shadow-lg">
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
                  className="rounded-2xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 p-6 text-center shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50"
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