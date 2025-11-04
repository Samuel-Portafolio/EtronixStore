import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES } from "../constants/categories";
import { NoResults, ProductSkeleton } from "../components/EmptyState";

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

    // Leer categoría desde query param
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) setSelectedCategory(cat);
  }, [location.search]);

  // Debounce de búsqueda para evitar filtrar en cada tecla
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Filtrar productos por categoría y búsqueda
  useEffect(() => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtrar por búsqueda
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
    <div className="min-h-screen flex flex-col bg-background-light">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header con Título y Búsqueda */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Nuestros Productos
                </h1>
                <p className="text-gray-600">
                  {selectedCategory === 'all' 
                    ? 'Descubre nuestra selección completa de accesorios'
                    : `Categoría: ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>

              {/* Barra de Búsqueda */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Botón para mostrar/ocultar sidebar en móvil */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Categorías
            </button>
          </div>

          <div className="flex gap-6">
            
            {/* Sidebar de Categorías */}
            {/* Sidebar interno solo en móviles, en desktop usamos el menú lateral global */}
            <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:hidden w-full shrink-0`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Categorías
                </h2>
                
                <nav className="space-y-1">
                  {CATEGORIES.map(cat => {
                    const count = cat.id === 'all' 
                      ? products.length 
                      : products.filter(p => p.category === cat.id).length;
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSidebarOpen(false); // Cerrar en móvil después de seleccionar
                        }}
                        className={`
                          w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group
                          ${selectedCategory === cat.id 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'hover:bg-slate-50 text-gray-700'
                          }
                        `}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="font-medium">{cat.name}</span>
                        </span>
                        <span className={`
                          text-xs px-2 py-1 rounded-full
                          ${selectedCategory === cat.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
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
                  <div className="mb-4 text-sm text-gray-600">
                    Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => (
                      <div 
                        key={p._id} 
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 flex flex-col"
                      >
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                          {/* Badge de stock o nuevo */}
                          {p.stock > 0 && p.stock < 5 && (
                            <span className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-bold">
                              Pocas unidades
                            </span>
                          )}
                          {p.image ? (
                            <img 
                              src={p.image} 
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex-1">
                            {p.category && (
                              <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
                                {CATEGORIES.find(c => c.id === p.category)?.icon} {CATEGORIES.find(c => c.id === p.category)?.name || p.category}
                              </span>
                            )}
                            <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
                              {p.title}
                            </h3>
                            {p.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {p.description}
                              </p>
                            )}
                            <div className="flex items-baseline justify-between mb-4">
                              <p className="text-2xl font-bold text-gray-900">
                                ${p.price.toLocaleString("es-CO")}
                              </p>
                              <p className={`text-sm font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => addToCart(p)}
                              disabled={p.stock === 0}
                              className="w-full rounded-lg bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {p.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
                            </button>
                            <Link
                              to={`/products/${p._id}`}
                              className="block w-full text-center rounded-lg border-2 border-indigo-600 text-indigo-600 py-2.5 font-semibold hover:bg-indigo-50 transition-colors"
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

      {/* Toast simple */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}