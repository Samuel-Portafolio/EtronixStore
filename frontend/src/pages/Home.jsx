import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";
import { generateMetaTags } from "../config/seo";
import { SEO_CONFIG } from "../config/seo";
import ProductMediaCarousel from "../components/ProductMediaCarousel";

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
  const images = Array.isArray(product.images) ? product.images : product.image ? [product.image] : [];
  const videos = Array.isArray(product.videos) ? product.videos : [];
  
  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ProductMediaCarousel
          images={images}
          videos={videos}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description || "Producto de alta calidad con garantía extendida."}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {typeof product.price === "number"
              ? `$${product.price.toLocaleString("es-CO")}`
              : "Consultar"}
          </span>
          <span className="text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
            Ver →
          </span>
        </div>
      </div>
    </Link>
  );
});

export default function Home() {
  const initialProducts = getInitialProducts();
  const [featuredProducts, setFeaturedProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(() => initialProducts.length === 0);
  const [showLightRays, setShowLightRays] = useState(false);

  const seoData = generateMetaTags({
    title: null,
    path: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShowLightRays(true), { timeout: 3000 });
      } else {
        setShowLightRays(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const CACHE_KEY = "featuredProducts";
    const CACHE_TS_KEY = "featuredProductsTs";
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
        <link rel="canonical" href={seoData.canonical} />
        <meta name="keywords" content={SEO_CONFIG.keywords.join(', ')} />
        <meta name="author" content="Etronix" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SEO_CONFIG.siteName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
        <link rel="alternate" hrefLang="es-co" href={seoData.canonical} />
        <link rel="alternate" hrefLang="x-default" href={seoData.canonical} />

        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:image:alt" content={seoData.title} />

        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        <meta name="twitter:image:alt" content={seoData.title} />

        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {showLightRays && <LazyLightRays />}
      </div>

      <div className="relative z-10">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-7 order-2 md:order-1">
              <div className="relative">
                <OptimizedImage
                  src={hero}
                  alt="Etronix - Tecnología móvil de calidad"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  priority={true}
                />
              </div>
            </div>

            <div className="md:col-span-5 order-1 md:order-2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforma
                <br />
                tu
                <br />
                experiencia
                <br />
                <span className="text-blue-600">móvil</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                En Etronix encuentras calidad, innovación y estilo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/products"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Explorar ahora
                </Link>
                <Link
                  to="/products?filter=ofertas"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-blue-600"
                >
                  Ver ofertas
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  ✨ Destacados
                </h2>
                <Link
                  to="/products"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
                >
                  Ver todo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {loading && featuredProducts.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {featuredProducts.map((p, idx) => (
                    <ProductCard key={p._id || idx} product={p} idx={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <div key={i} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all">
                  <div className="text-4xl mb-3">{b.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{b.t}</h3>
                  <p className="text-sm text-white/90">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function LazyLightRays() {
  const [LightRaysComponent, setLightRaysComponent] = useState(null);

  useEffect(() => {
    import("../components/LightRays")
      .then((module) => setLightRaysComponent(() => module.default))
      .catch((err) => console.warn("Failed to load LightRays:", err));
  }, []);

  if (!LightRaysComponent) return null;

  return <LightRaysComponent />;
}