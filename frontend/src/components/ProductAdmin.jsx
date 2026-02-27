import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Limpia todos los cachés del frontend relacionados a productos
function clearProductCache() {
  localStorage.removeItem('featuredProducts');
  localStorage.removeItem('featuredProductsTs');
}

export default function ProductAdmin({ adminCode }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          headers: { "x-admin-code": adminCode },
        });
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    }
    if (adminCode) fetchProducts();
  }, [adminCode]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-code": adminCode },
      });
      if (!res.ok) throw new Error("Error eliminando producto");
      // ✅ Invalida el caché del frontend para reflejar cambios de inmediato
      clearProductCache();
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("No se pudo eliminar el producto");
    }
  };

  return (
    <div className="mb-12 py-12">
      <h2 className="text-3xl font-black mb-8 text-cyan-400 text-center flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-3xl text-cyan-400">inventory_2</span>
        Gestión de Productos
      </h2>
      <div className="flex justify-center mb-8">
        <Link
          to="/admin/product/new"
          className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-black rounded-xl shadow-lg hover:scale-105 hover:shadow-cyan-500/50 transition-all text-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Agregar Nuevo Producto
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 font-bold py-8">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400 font-bold py-8">No hay productos</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl text-xs md:text-sm">
            <thead>
              <tr className="bg-linear-to-r from-cyan-500 to-blue-500 text-white">
                <th className="px-2 py-2 md:px-4 md:py-3 text-left font-bold whitespace-nowrap">Título</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-left font-bold whitespace-nowrap">Precio</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-left font-bold whitespace-nowrap">Stock</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-left font-bold whitespace-nowrap">Categoría</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-left font-bold whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-800 transition-all group"
                >
                  <td className="px-2 py-2 md:px-4 md:py-3 font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2 whitespace-nowrap">
                    <span className="material-symbols-outlined text-base text-cyan-400">smartphone</span>
                    {product.title}
                  </td>
                  <td className="px-2 py-2 md:px-4 md:py-3 text-gray-700 dark:text-gray-200 font-bold whitespace-nowrap">
                    <span className="material-symbols-outlined text-base text-green-400">attach_money</span>
                    ${product.price?.toLocaleString("es-CO")}
                  </td>
                  <td className="px-2 py-2 md:px-4 md:py-3 text-gray-700 dark:text-gray-200 font-bold whitespace-nowrap">
                    <span className="material-symbols-outlined text-base text-yellow-400">inventory</span>
                    {product.stock}
                  </td>
                  <td className="px-2 py-2 md:px-4 md:py-3 text-gray-700 dark:text-gray-200 font-bold whitespace-nowrap">
                    <span className="material-symbols-outlined text-base text-purple-400">category</span>
                    {product.category}
                  </td>
                  <td className="px-2 py-2 md:px-4 md:py-3 flex gap-2 whitespace-nowrap">
                    <Link
                      to={`/admin/product/edit/${product._id}`}
                      className="px-2 py-1 md:px-3 md:py-1 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:scale-105 hover:bg-blue-600 text-xs flex items-center gap-1 shadow group-hover:shadow-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-2 py-1 md:px-3 md:py-1 bg-linear-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 hover:bg-red-600 text-xs flex items-center gap-1 shadow group-hover:shadow-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="md:hidden text-gray-400 text-xs mt-2 text-center">Desliza la tabla &rarr;</div>
        </div>
      )}
    </div>
  );
}