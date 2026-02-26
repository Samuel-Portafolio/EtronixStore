import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NoResults, ProductSkeleton } from "../components/EmptyState";
import { Helmet } from "react-helmet-async";
import OptimizedImage from '../components/OptimizedImage';
import ProductMediaCarousel from '../components/ProductMediaCarousel';

export default function Shop() {
  const location = useLocation();
  // Obtener categoría desde query param
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sidebarOpen] = useState(true);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;
  const paginatedProducts = filteredProducts.slice(0, page * PRODUCTS_PER_PAGE);

  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 999999999 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        const productsArray = Array.isArray(data) ? data : [];

        setProducts(productsArray);
        setFilteredProducts(productsArray);

        // Filtrar carrito si los productos cambiaron
        if (productsArray.length === 0) {
          localStorage.removeItem('cart');
        } else {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const validIds = new Set(productsArray.map(p => p._id));
          const filteredCart = cart.filter(item => validIds.has(item._id));
          localStorage.setItem('cart', JSON.stringify(filteredCart));
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProducts([]);
        setFilteredProducts([]);
        localStorage.removeItem('cart');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // --- FILTROS Y ORDENAMIENTO ---
  useEffect(() => {
    let filtered = [...products];

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.specs?.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    filtered = filtered.filter(p =>
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }

    setFilteredProducts(filtered);
    setPage(1);
  }, [debouncedQuery, products, sortBy, priceRange]);

  const addToCart = (p) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = cart.find((x) => x._id === p._id);

    if (found) found.quantity += 1;
    else cart.push({ ...p, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setToast('Producto agregado al carrito');
    setTimeout(() => setToast(""), 1800);
  };

  const priceStats = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : { min: 0, max: 1000000 };

  const applyPriceFilter = () => {
    const min = tempPriceRange.min === '' ? 0 : Number(tempPriceRange.min);
    const max = tempPriceRange.max === '' ? 999999999 : Number(tempPriceRange.max);

    if (min > max) {
      alert('El precio mínimo no puede ser mayor al máximo');
      return;
    }
    setPriceRange({ min, max });
  };

  // Título dinámico basado en categoría
  const pageTitle = selectedCategory
    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} | Etronix Store Colombia`
    : "Tienda de Accesorios para Celulares | Etronix Store Colombia";

  const pageDescription = selectedCategory
    ? `Compra ${selectedCategory} para celulares en Colombia. Envío a todo el país. Pago seguro con MercadoPago.`
    : "Explora nuestro catálogo de audífonos, cargadores, cables, protectores y más accesorios para celulares. Envío a toda Colombia.";

  const canonicalUrl = selectedCategory
    ? `https://etronix-store.com/shop?category=${selectedCategory}`
    : "https://etronix-store.com/shop";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Etronix Store" />
        <meta property="og:image" content="https://etronix-store.com/og-image.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* Schema.org ItemList para catálogo */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": pageTitle,
            "description": pageDescription,
            "url": canonicalUrl,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Etronix Store",
              "url": "https://etronix-store.com"
            }
          })}
        </script>
      </Helmet>

      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black"></div>

      <div className="relative min-h-screen flex flex-col z-10">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* HEADER */}
            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-white mb-3">
                    Catálogo de Productos
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Explora nuestra selección completa de accesorios tecnológicos
                  </p>
                </div>

                {/* BUSCADOR */}
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* ORDENAR Y FILTRO DE PRECIO */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">

                {/* Ordenar */}
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="name-asc">Nombre: A-Z</option>
                    <option value="name-desc">Nombre: Z-A</option>
                    <option value="popular">Más Populares</option>
                  </select>
                </div>

                {/* Filtro de precio */}
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">Rango de Precio</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={`Min $${priceStats.min.toLocaleString('es-CO')}`}
                      value={tempPriceRange.min}
                      onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                    />
                    <input
                      type="number"
                      placeholder={`Max $${priceStats.max.toLocaleString('es-CO')}`}
                      value={tempPriceRange.max}
                      onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                    />
                    <button
                      onClick={applyPriceFilter}
                      className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-black"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCTOS */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <NoResults onClear={() => setSearchQuery('')} />
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-300">
                      Mostrando <span className="text-cyan-400 font-black">
                        {paginatedProducts.length}
                      </span>{" "}
                      productos
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((p) => (
                      <div
                        key={p._id}
                        className="bg-white/10 rounded-2xl border border-white/20 shadow-lg hover:shadow-cyan-500/30 transition-all overflow-hidden flex flex-col"
                      >
                        <Link to={`/products/${p._id}`}>
                          <div className="relative aspect-square bg-white/5 overflow-hidden">
                            {p.stock > 0 && p.stock < 5 && (
                              <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-amber-500 text-white text-xs font-black">
                                Últimas unidades
                              </span>
                            )}

                            {/* Carrusel de imágenes/videos */}
                            <ProductMediaCarousel
                              images={Array.isArray(p.images) ? p.images : p.image ? [p.image] : []}
                              videos={Array.isArray(p.videos) ? p.videos : []}
                              alt={p.title}
                              aspect="aspect-square"
                            />
                          </div>
                        </Link>

                        <div className="p-3 flex flex-col gap-2 flex-1">
                          <h3 className="text-base font-bold text-white line-clamp-1">{p.title}</h3>
                          <p className="text-gray-300 text-xs line-clamp-2">{p.description}</p>

                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-lg font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                              ${p.price.toLocaleString('es-CO')}
                            </span>
                            <span className="text-xs font-bold text-cyan-400">
                              {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
                            </span>
                          </div>

                          <button
                            disabled={p.stock === 0}
                            onClick={() => addToCart(p)}
                            className="w-full mt-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white py-3.5 font-black hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {p.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {paginatedProducts.length < filteredProducts.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setPage(page + 1)}
                        className="px-8 py-4 rounded-xl bg-cyan-500 text-white font-black"
                      >
                        Cargar más productos
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="font-black">{toast}</span>
          </div>
        )}
      </div>
    </>
  );
}
