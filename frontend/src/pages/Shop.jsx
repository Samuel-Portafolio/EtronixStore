import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES } from "../constants/categories";
import { NoResults, ProductSkeleton } from "../components/EmptyState";
import { Helmet } from "react-helmet-async";
import LightRays from "../components/LightRays";
import OptimizedImage from '../components/OptimizedImage';


export default function Shop() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    })();

    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) setSelectedCategory(cat);
  }, [location.search]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.specs?.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, debouncedQuery, products]);

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

  return (
    <>
      <Helmet>
        <title>
          {selectedCategory === 'all'
            ? 'Tienda de Accesorios | Etronix Store'
            : `${CATEGORIES.find(c => c.id === selectedCategory)?.name} | Etronix Store`
          }
        </title>
        <meta
          name="description"
          content={
            selectedCategory === 'all'
              ? 'Explora nuestro catálogo completo de accesorios tecnológicos: audífonos, cargadores, cables, protectores y más. Envío a toda Colombia.'
              : `Compra ${CATEGORIES.find(c => c.id === selectedCategory)?.name} de alta calidad. Envío rápido y garantía extendida en todos los productos.`
          }
        />
        <link rel="canonical" href={`https://etronix-store.com/shop${selectedCategory !== 'all' ? `?cat=${selectedCategory}` : ''}`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": selectedCategory === 'all'
              ? 'Todos los Productos - Etronix Store'
              : `${CATEGORIES.find(c => c.id === selectedCategory)?.name} - Etronix Store`,
            "description": selectedCategory === 'all'
              ? 'Catálogo completo de accesorios tecnológicos'
              : `Productos de ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`,
            "url": `https://etronix-store.com/shop${selectedCategory !== 'all' ? `?cat=${selectedCategory}` : ''}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": filteredProducts.length,
              "itemListElement": filteredProducts.slice(0, 12).map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": product.title,
                  "image": product.image || 'https://etronix-store.com/og-image.jpg',
                  "description": product.description || product.title,
                  "offers": {
                    "@type": "Offer",
                    "url": `https://etronix-store.com/products/${product._id}`,
                    "priceCurrency": "COP",
                    "price": product.price,
                    "availability": product.stock > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                    "seller": {
                      "@type": "Organization",
                      "name": "Etronix Store"
                    }
                  }
                }
              }))
            }
          })}
        </script>
      </Helmet>

      {/* === Fondo LightRays: ocupa toda la pantalla === */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        
      </div>

      <div className="relative min-h-screen flex flex-col z-10">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Header con Título y Búsqueda */}
            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-white mb-3">
                    Catálogo de Productos
                  </h1>
                  <p className="text-gray-300 text-lg">
                    {selectedCategory === 'all'
                      ? 'Explora nuestra selección completa de accesorios tecnológicos'
                      : `Categoría: ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
                  </p>
                </div>

                {/* Barra de Búsqueda */}
                <div className="relative w-full md:w-96">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder-gray-400 font-medium"
                      />
                      <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white font-bold transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón categorías móvil */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mb-6 flex items-center gap-2 px-5 py-3 backdrop-blur-md bg-white/10 rounded-xl border-2 border-white/20 hover:border-cyan-400/50 transition-all font-bold text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Categorías
              </button>
            </div>

            <div className="flex gap-8">

              {/* Sidebar de Categorías */}
              <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-72 shrink-0`}>
                <div className="backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 p-6 sticky top-24 shadow-xl">
                  <h2 className="font-black text-xl text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Categorías
                  </h2>

                  <nav className="space-y-2">
                    {CATEGORIES.map(cat => {
                      const count = cat.id === 'all'
                        ? products.length
                        : products.filter(p => p.category === cat.id).length;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setSidebarOpen(false);
                          }}
                          className={`
                            w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center justify-between group font-bold
                            ${selectedCategory === cat.id
                              ? 'bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                              : 'hover:bg-white/10 text-gray-300 hover:text-white border border-transparent hover:border-white/20'
                            }
                          `}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xl">{cat.icon}</span>
                            <span>{cat.name}</span>
                          </span>
                          <span className={`
                            text-xs px-2.5 py-1 rounded-full font-black
                            ${selectedCategory === cat.id
                              ? 'bg-white/20 text-white'
                              : 'bg-white/10 text-gray-300 group-hover:bg-cyan-400/20 group-hover:text-cyan-300'
                            }
                          `}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* Productos */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <NoResults
                    onClear={() => {
                      setSearchQuery('');
                      setDebouncedQuery('');
                      setSelectedCategory('all');
                    }}
                  />
                ) : (
                  <>
                    {/* Contador de resultados */}
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-sm text-gray-300 font-medium">
                        Mostrando <span className="font-black text-cyan-400">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((p) => (
                        <div
                          key={p._id}
                          className="backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 hover:border-cyan-400/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1"
                        >
                          <div className="relative aspect-square bg-white/5 overflow-hidden">
                            {/* Badge de stock */}
                            {p.stock > 0 && p.stock < 5 && (
                              <span className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-lg">
                                Últimas unidades
                              </span>
                            )}
                            {p.image ? (
                              <OptimizedImage
                                src={p.image}
                                alt={`${p.title} - ${p.category}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                priority={false}
                                placeholder="blur"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-cyan-500/20 to-blue-500/20">
                                <span className="text-white/50 text-4xl">📱</span>
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex-1">
                              {p.category && (
                                <span className="inline-block px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black mb-3">
                                  {CATEGORIES.find(c => c.id === p.category)?.icon} {CATEGORIES.find(c => c.id === p.category)?.name || p.category}
                                </span>
                              )}
                              <h3 className="font-black text-xl mb-2 text-white line-clamp-2">
                                {p.title}
                              </h3>
                              {p.description && (
                                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                                  {p.description}
                                </p>
                              )}
                              <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-white/10">
                                <p className="text-2xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                  ${p.price.toLocaleString("es-CO")}
                                </p>
                                <p className={`text-sm font-black ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <button
                                onClick={() => addToCart(p)}
                                disabled={p.stock === 0}
                                className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white py-3.5 font-black hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {p.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                              </button>
                              <Link
                                to={`/products/${p._id}`}
                                className="block w-full text-center rounded-xl border-2 border-white/30 text-white py-3 font-black hover:bg-white/10 hover:border-cyan-400/50 transition-all"
                              >
                                Ver Detalles
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 backdrop-blur-xl bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/50 flex items-center gap-3 border border-green-400/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-black">{toast}</span>
          </div>
        )}
      </div>
    </>
  );
}
