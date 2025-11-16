
import { Link } from "react-router-dom";

export default function ProductAdmin() {
  return (
    <div className="mb-12 flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-black mb-6 text-cyan-400">Gestión de Productos</h2>
      <Link
        to="/admin/product/new"
        className="px-6 py-3 bg-cyan-500 text-white font-black rounded-xl shadow-lg hover:bg-cyan-600 transition-colors text-lg"
      >
        Agregar Nuevo Producto
      </Link>
    </div>
  );
}
