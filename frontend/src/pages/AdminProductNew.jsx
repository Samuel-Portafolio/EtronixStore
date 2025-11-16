import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

export default function AdminProductNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    category: "celulares",
    description: "",
    images: [""],
    specs: [{ key: "", value: "" }],
    faqs: [{ question: "", answer: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminCode, setAdminCode] = useState("");

  // Obtener adminCode de localStorage al montar
  React.useEffect(() => {
    const code = localStorage.getItem("adminCode") || "";
    setAdminCode(code);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, idx, subfield, value) => {
    setForm({
      ...form,
      [field]: form[field].map((item, i) =>
        i === idx ? { ...item, [subfield]: value } : item
      ),
    });
  };

  const handleAddArrayItem = (field, emptyObj) => {
    setForm({ ...form, [field]: [...form[field], emptyObj] });
  };

  const handleRemoveArrayItem = (field, idx) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) });
  };

  const handleImageChange = (idx, value) => {
    setForm({
      ...form,
      images: form.images.map((img, i) => (i === idx ? value : img)),
    });
  };

  const handleAddImage = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const handleRemoveImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Asegurarse que adminCode persista
      if (adminCode) {
        localStorage.setItem("adminCode", adminCode);
      }
      // Si solo hay una imagen y es válida, asegúrate que esté en array
      const productData = {
        ...form,
        images: form.images.filter(img => img && img.trim() !== ""),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": adminCode,
        },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        // No borrar adminCode, solo redirigir
        navigate("/admin");
      } else {
        setError("Error al crear el producto");
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-cyan-950">
      <div className="max-w-3xl mx-auto py-12">
        <Helmet>
          <title>Nuevo Producto | Admin | Etronix Store</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <h1 className="text-3xl font-black mb-8 text-cyan-400">Agregar Nuevo Producto</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Nombre" className="p-2 rounded bg-gray-800 text-white" required />
            <input name="price" value={form.price} onChange={handleChange} placeholder="Precio" type="number" className="p-2 rounded bg-gray-800 text-white" required />
            <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" className="p-2 rounded bg-gray-800 text-white" required />
            <select name="category" value={form.category} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white">
              <option value="celulares">Celulares</option>
              <option value="audifonos">Audífonos</option>
              <option value="cargadores">Cargadores</option>
              <option value="cables">Cables</option>
              <option value="accesorios">Accesorios</option>
              <option value="protectores">Protectores</option>
            </select>
          </div>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="p-2 rounded bg-gray-800 text-white w-full" />
          {/* Imágenes */}
          <div>
            <label className="font-bold text-cyan-400 mb-2 block">Imágenes</label>
            {form.images.map((img, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={img}
                  onChange={e => handleImageChange(idx, e.target.value)}
                  placeholder={`URL Imagen #${idx + 1}`}
                  className="p-2 rounded bg-gray-800 text-white flex-1"
                />
                <button type="button" onClick={() => handleRemoveImage(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </div>
            ))}
            <button type="button" onClick={handleAddImage} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Imagen</button>
          </div>
          {/* Especificaciones */}
          <div>
            <label className="font-bold text-cyan-400 mb-2 block">Especificaciones</label>
            {form.specs.map((spec, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={e => handleArrayChange("specs", idx, "key", e.target.value)}
                  placeholder="Campo (ej: Marca)"
                  className="p-2 rounded bg-gray-800 text-white flex-1"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={e => handleArrayChange("specs", idx, "value", e.target.value)}
                  placeholder="Valor (ej: Samsung)"
                  className="p-2 rounded bg-gray-800 text-white flex-1"
                />
                <button type="button" onClick={() => handleRemoveArrayItem("specs", idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddArrayItem("specs", { key: "", value: "" })} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Especificación</button>
          </div>
          {/* FAQs */}
          <div>
            <label className="font-bold text-cyan-400 mb-2 block">Preguntas Frecuentes</label>
            {form.faqs.map((faq, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={e => handleArrayChange("faqs", idx, "question", e.target.value)}
                  placeholder="Pregunta"
                  className="p-2 rounded bg-gray-800 text-white flex-1"
                />
                <input
                  type="text"
                  value={faq.answer}
                  onChange={e => handleArrayChange("faqs", idx, "answer", e.target.value)}
                  placeholder="Respuesta"
                  className="p-2 rounded bg-gray-800 text-white flex-1"
                />
                <button type="button" onClick={() => handleRemoveArrayItem("faqs", idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddArrayItem("faqs", { question: "", answer: "" })} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Pregunta</button>
          </div>
          {error && <div className="text-red-500 font-bold">{error}</div>}
          <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-cyan-500 text-white font-black rounded-xl mt-2">
            {loading ? "Guardando..." : "Crear Producto"}
          </button>
        </form>
      </div>
    </div>
  );
}
