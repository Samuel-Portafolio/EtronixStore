import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

function getYouTubeEmbedUrl(url) {
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

export default function AdminProductNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    category: "celulares",
    description: "",
    images: [""],
    imageFiles: [], // Archivos locales de imagen
    videos: [""], // URLs de videos
    videoFiles: [], // Archivos locales de video
    specs: [{ key: "", value: "" }],
    faqs: [{ question: "", answer: "" }],
  });
      // Archivos de imagen
      const handleImageFilesChange = (e) => {
        setForm({ ...form, imageFiles: Array.from(e.target.files) });
      };
    // Videos por URL
    const handleVideoUrlChange = (idx, value) => {
      setForm({
        ...form,
        videos: form.videos.map((v, i) => (i === idx ? value : v)),
      });
    };
    const handleAddVideoUrl = () => {
      setForm({ ...form, videos: [...form.videos, ""] });
    };
    const handleRemoveVideoUrl = (idx) => {
      setForm({ ...form, videos: form.videos.filter((_, i) => i !== idx) });
    };

    // Archivos de video
    const handleVideoFilesChange = (e) => {
      setForm({ ...form, videoFiles: Array.from(e.target.files) });
    };
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
      if (adminCode) {
        localStorage.setItem("adminCode", adminCode);
      }
      // Filtrar imágenes y videos por URL
      const images = form.images.filter((img) => img && img.trim() !== "");
      const videoUrls = form.videos.filter((v) => v && v.trim() !== "");
      // Convertir especificaciones a objeto plano
      const specsObj = {};
      form.specs.forEach((spec) => {
        if (spec.key && spec.value) specsObj[spec.key] = spec.value;
      });
      // Usar FormData si hay archivos
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("image", images[0] || "");
      images.forEach((img) => formData.append("images", img));
      videoUrls.forEach((url) => formData.append("videoUrls", url));
      formData.append("specs", JSON.stringify(specsObj));
      form.faqs.forEach((faq, i) => {
        formData.append(`faqs[${i}][question]`, faq.question);
        formData.append(`faqs[${i}][answer]`, faq.answer);
      });
      form.imageFiles.forEach((file) => formData.append("imageFiles", file));
      form.videoFiles.forEach((file) => formData.append("videoFiles", file));
      formData.append("sku", form.sku || "");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: "POST",
        headers: {
          "x-admin-code": adminCode,
        },
        body: formData,
      });
      if (res.ok) {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-cyan-950">
      <div className="max-w-3xl mx-auto py-12">
        <Helmet>
          <title>Nuevo Producto | Admin | Etronix Store</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <h1 className="text-3xl font-black mb-8 text-cyan-400 text-center">
          Agregar Nuevo Producto
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos principales */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Datos principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Nombre" className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border" required />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Precio" type="number" className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border" required />
              <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border" required />
              <select name="category" value={form.category} onChange={handleChange} className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border">
                <option value="celulares">Celulares</option>
                <option value="audifonos">Audífonos</option>
                <option value="cargadores">Cargadores</option>
                <option value="cables">Cables</option>
                <option value="accesorios">Accesorios</option>
                <option value="protectores">Protectores</option>
              </select>
            </div>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border w-full" />
          </div>

          {/* Imágenes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Imágenes</h2>
            <div className="mb-4">
              <label className="font-bold text-cyan-400 mb-2 block">Imágenes por URL</label>
              {form.images.map((img, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input type="text" value={img} onChange={(e) => handleImageChange(idx, e.target.value)} placeholder={`URL Imagen #${idx + 1}`} className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" />
                  <button type="button" onClick={() => handleRemoveImage(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
                  {img && img.trim() !== "" && (
                    <img src={img} alt="preview" className="w-16 h-16 object-cover rounded border" />
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddImage} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Imagen por URL</button>
            </div>
            <div>
              <label className="font-bold text-cyan-400 mb-2 block">Subir Imágenes (archivos JPG/PNG)</label>
              <label className="inline-block px-4 py-2 bg-cyan-500 text-white rounded font-bold cursor-pointer hover:bg-cyan-600 transition-colors">
                <span className="material-symbols-outlined align-middle mr-2">upload</span>
                Elegir archivos
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageFilesChange} className="hidden" />
              </label>
              <div className="flex gap-2 flex-wrap mt-2">
                {form.imageFiles.length === 0 && (
                  <span className="text-gray-400 italic">Sin archivos seleccionados</span>
                )}
                {form.imageFiles.map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded border" />
                ))}
              </div>
            </div>
          </div>

          {/* Videos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Videos</h2>
            <div className="mb-4">
              <label className="font-bold text-cyan-400 mb-2 block">Videos por URL</label>
              {form.videos.map((v, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input type="text" value={v} onChange={(e) => handleVideoUrlChange(idx, e.target.value)} placeholder={`URL Video #${idx + 1}`} className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" />
                  <button type="button" onClick={() => handleRemoveVideoUrl(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
                  {v && v.trim() !== "" && (
                    v.includes("youtube.com") || v.includes("youtu.be") ? (
                      <iframe src={getYouTubeEmbedUrl(v)} width="80" height="45" title="preview" frameBorder="0" allowFullScreen className="rounded border" />
                    ) : (
                      <video src={v} width="80" height="45" controls className="rounded border" />
                    )
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddVideoUrl} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Video por URL</button>
            </div>
            <div>
              <label className="font-bold text-cyan-400 mb-2 block">Subir Videos (archivos MP4/WebM)</label>
              <label className="inline-block px-4 py-2 bg-cyan-500 text-white rounded font-bold cursor-pointer hover:bg-cyan-600 transition-colors">
                <span className="material-symbols-outlined align-middle mr-2">upload</span>
                Elegir archivos
                <input type="file" accept="video/mp4,video/webm" multiple onChange={handleVideoFilesChange} className="hidden" />
              </label>
              <div className="flex gap-2 flex-wrap mt-2">
                {form.videoFiles.length === 0 && (
                  <span className="text-gray-400 italic">Sin archivos seleccionados</span>
                )}
                {form.videoFiles.map((file, idx) => (
                  <video key={idx} src={URL.createObjectURL(file)} width="80" height="45" controls className="rounded border" />
                ))}
              </div>
            </div>
          </div>

          {/* Especificaciones */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Especificaciones</h2>
            {form.specs.map((spec, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input type="text" value={spec.key} onChange={(e) => handleArrayChange("specs", idx, "key", e.target.value)} placeholder="Campo (ej: Marca)" className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" />
                <input type="text" value={spec.value} onChange={(e) => handleArrayChange("specs", idx, "value", e.target.value)} placeholder="Valor (ej: Samsung)" className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" />
                <button type="button" onClick={() => handleRemoveArrayItem("specs", idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddArrayItem("specs", { key: "", value: "" })} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Especificación</button>
          </div>

          {/* FAQs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Preguntas Frecuentes</h2>
            {form.faqs.map((faq, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input type="text" value={faq.question} onChange={(e) => handleArrayChange("faqs", idx, "question", e.target.value)} placeholder="Pregunta" className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" />
                <input type="text" value={faq.answer} onChange={(e) => handleArrayChange("faqs", idx, "answer", e.target.value)} placeholder="Respuesta" className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" />
                <button type="button" onClick={() => handleRemoveArrayItem("faqs", idx)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddArrayItem("faqs", { question: "", answer: "" })} className="px-3 py-1 bg-cyan-500 text-white rounded font-bold">Agregar Pregunta</button>
          </div>

          {error && <div className="text-red-500 font-bold text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-cyan-500 text-white font-black rounded-xl mt-2 shadow-lg">
            {loading ? "Guardando..." : "Crear Producto"}
          </button>
        </form>
      </div>
    </div>
  );
}
