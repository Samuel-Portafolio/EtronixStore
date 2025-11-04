import { Link } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
const FAQ = lazy(() => import("../components/FAQ"));
import logo from "../assets/LogoEtronixBordesRedondos.svg";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        // Mostrar los primeros 3 productos
        setFeaturedProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = [
    {
      id: 'celulares',
      name: "Celulares",
      description: "Últimos modelos",
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'audifonos',
      name: "Audífonos",
      description: "Calidad premium",
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
    {
      id: 'cargadores',
      name: "Cargadores",
      description: "Carga rápida",
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'accesorios',
      name: "Accesorios",
      description: "Todo lo que necesitas",
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ];

  const benefits = [
    {
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Garantía Extendida",
      description: "12 meses de garantía en todos nuestros productos"
    },
    {
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Mejores Precios",
      description: "Productos originales a precios competitivos"
    },
    {
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Pago Seguro",
      description: "Integración con Mercado Pago para tu seguridad"
    },
    {
      icon: (
        <svg aria-hidden="true" focusable="false" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: "Soporte 24/7",
      description: "Atención personalizada vía WhatsApp"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section Limpio */}
      <section className="relative bg-white overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-700">Envío gratis en compras superiores a $100.000</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Tecnología Premium para tu Vida Digital
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                Descubre nuestra selección de celulares, audífonos y accesorios de las mejores marcas. 
                Calidad garantizada y atención personalizada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-base hover:bg-indigo-700 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                >
                  Ver Catálogo
                  <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp para asesoría"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-base border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                >
                  <svg aria-hidden="true" focusable="false" className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Asesoría WhatsApp
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-900">500+</p>
                  <p className="text-sm text-slate-600 mt-1">Productos</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-900">1000+</p>
                  <p className="text-sm text-slate-600 mt-1">Clientes</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-900">100%</p>
                  <p className="text-sm text-slate-600 mt-1">Originales</p>
                </div>
              </div>
            </div>
            
            {/* Imagen */}
            <div className="hidden lg:block">
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl opacity-40 blur-xl"></div>
                <img
                  src={logo}
                  alt="Logo de Etronix"
                  width="800"
                  height="800"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="relative w-full h-auto rounded-3xl shadow-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section Minimalista */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Categorías
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explora nuestra selección de productos organizados por categoría
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              return (
                <Link
                  key={category.id}
                  to={`/shop?cat=${category.id}`}
                  className="group relative bg-white rounded-2xl p-8 text-center border-2 border-slate-200 hover:border-indigo-600 hover:shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-slate-600">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Los favoritos de nuestros clientes, seleccionados especialmente para ti
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, idx) => (
                <div 
                  key={product._id}
                  className="group bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-indigo-600 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    {idx === 0 && (
                      <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                        MÁS VENDIDO
                      </span>
                    )}
                    {idx === 1 && (
                      <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                        NUEVO
                      </span>
                    )}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg aria-hidden="true" focusable="false" className="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          ${product.price?.toLocaleString("es-CO")}
                        </p>
                        {product.stock > 0 && product.stock < 5 && (
                          <p className="text-xs text-amber-600 font-semibold mt-1">
                            Últimas {product.stock} unidades
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/products/${product._id}`}
                        aria-label={`Ver detalles de ${product.title}`}
                        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-900 text-slate-900 rounded-lg font-bold hover:bg-slate-900 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
            >
              Ver Todo el Catálogo
              <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={null}>
        <FAQ />
      </Suspense>
    </main>
  );
}