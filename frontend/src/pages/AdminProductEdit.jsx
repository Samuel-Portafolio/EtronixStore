import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

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

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  useEffect(() => {
    setAdminCode(localStorage.getItem("adminCode") || "");
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
          headers: { "x-admin-code": adminCode },
        });
        if (!res.ok) throw new Error("No se encontró el producto");
        const data = await res.json();
        
        console.log('📦 Producto cargado:', data);
        console.log('📋 Specs originales:', data.specs);
        
        // 🔥 CORRECCIÓN COMPLETA: Normalizar specs correctamente
        const normalizedSpecs = [];
        
        if (data.specs && typeof data.specs === 'object' && !Array.isArray(data.specs)) {
          // Es un objeto, convertir a array
          Object.entries(data.specs).forEach(([key, value]) => {
            // Filtrar campos vacíos, null, undefined
            if (key && value !== null && value !== undefined && value !== '') {
              // Si es un array, convertir a string separado por comas
              const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
              normalizedSpecs.push({ key, value: displayValue });
            }
          });
        } else if (Array.isArray(data.specs)) {
          // Ya es un array, solo filtrar
          data.specs.forEach(spec => {
            if (spec.key && spec.value) {
              normalizedSpecs.push({ key: spec.key, value: spec.value });
            }
          });
        }
        
        // Si no hay specs válidas, agregar una vacía
        if (normalizedSpecs.length === 0) {
          normalizedSpecs.push({ key: "", value: "" });
        }
        
        console.log('✅ Specs normalizadas:', normalizedSpecs);
        
        setForm({
          ...data,
          images: Array.isArray(data.images) ? data.images.filter(Boolean) : [data.image || ""].filter(Boolean),
          videos: Array.isArray(data.videos) ? data.videos.filter(Boolean) : [],
          specs: normalizedSpecs,
          faqs: Array.isArray(data.faqs) && data.faqs.length > 0
            ? data.faqs.filter(f => f.question && f.answer)
            : [{ question: "", answer: "" }],
        });
      } catch (err) {
        setError("No se pudo cargar el producto");
        console.error('❌ Error:', err);
      } finally {
        setLoading(false);
      }
    }
    if (adminCode && id) fetchProduct();
  }, [adminCode, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, idx, subfield, value) => {
    const updated = form[field].map((item, i) =>
      i === idx ? { ...item, [subfield]: value } : item
    );
    setForm({ ...form, [field]: updated });
    console.log(`📝 Campo actualizado [${field}][${idx}].${subfield}:`, value);
  };

  const handleAddArrayItem = (field, emptyObj) => {
    setForm({ ...form, [field]: [...form[field], emptyObj] });
  };

  const handleRemoveArrayItem = (field, idx) => {
    const filtered = form[field].filter((_, i) => i !== idx);
    // Asegurar que siempre haya al menos un campo vacío
    if (filtered.length === 0 && field === 'specs') {
      filtered.push({ key: "", value: "" });
    }
    setForm({ ...form, [field]: filtered });
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

  const handleImageFilesChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

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

  const handleVideoFilesChange = (e) => {
    setVideoFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const images = form.images.filter((img) => img && img.trim() !== "");
      const videoUrls = form.videos.filter((v) => v && v.trim() !== "");
      
      // 🔥 CORRECCIÓN: Convertir specs a objeto plano SIN features
      const specsObj = {};
      form.specs.forEach((spec) => {
        const key = spec.key?.trim();
        const value = spec.value?.trim();
        
        // Solo agregar si AMBOS existen y no están vacíos
        if (key && value && key !== "" && value !== "") {
          specsObj[key] = value;
        }
      });

      console.log('💾 Specs a enviar:', specsObj);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      formData.append("description", form.description || "");
      formData.append("image", images[0] || "");
      formData.append("sku", form.sku || "");
      
formData.append("imagesCount", images.length.toString());
if (images.length > 0) {
  images.forEach((img) => formData.append("images", img));
} else {
  formData.append("images", ""); // señal de "borrar todo"
}

formData.append("videoUrlsCount", videoUrls.length.toString());
if (videoUrls.length > 0) {
  videoUrls.forEach((url) => formData.append("videoUrls", url));
} else {
  formData.append("videoUrls", ""); // señal de "borrar todo"
}
      
      // Enviar specs como JSON string
      formData.append("specs", JSON.stringify(specsObj));
      
      // FAQs válidas solamente
      const validFaqs = form.faqs.filter(faq => faq.question?.trim() && faq.answer?.trim());
      validFaqs.forEach((faq, i) => {
        formData.append(`faqs[${i}][question]`, faq.question);
        formData.append(`faqs[${i}][answer]`, faq.answer);
      });
      
      imageFiles.forEach((file) => formData.append("imageFiles", file));
      videoFiles.forEach((file) => formData.append("videoFiles", file));

      console.log('🚀 Enviando actualización...');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "x-admin-code": adminCode,
        },
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        console.log('✅ Producto actualizado:', updated);
        navigate("/admin");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al actualizar el producto");
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }
  
  if (error && !form) {
    return (
      <div className="text-center text-red-400 font-bold py-8">{error}</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-cyan-950">
      <div className="w-full max-w-3xl mx-auto py-6 px-2 sm:py-10 sm:px-4">
        <Helmet>
          <title>Editar Producto | Admin | Etronix Store</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 text-cyan-400 text-center">Editar Producto</h1>
          <p className="text-center text-gray-500 text-sm">ID: {id}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Datos principales */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-3 sm:p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Datos principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                placeholder="Nombre del producto" 
                className="p-2 sm:p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border text-sm" 
                required 
              />
              <input 
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                placeholder="Precio" 
                type="number" 
                className="p-2 sm:p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border text-sm" 
                required 
              />
              <input 
                name="stock" 
                value={form.stock} 
                onChange={handleChange} 
                placeholder="Stock" 
                type="number" 
                className="p-2 sm:p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border text-sm" 
                required 
              />
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className="p-2 sm:p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border text-sm" 
              >
                <option value="celulares">Celulares</option>
                <option value="audifonos">Audífonos</option>
                <option value="cargadores">Cargadores</option>
                <option value="cables">Cables</option>
                <option value="accesorios">Accesorios</option>
                <option value="protectores">Protectores</option>
              </select>
            </div>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Descripción" 
              className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border w-full" 
              rows="4"
            />
          </div>

          {/* Imágenes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Imágenes</h2>
            <div className="mb-4">
              <label className="font-bold text-cyan-400 mb-2 block">Imágenes por URL</label>
              {form.images.map((img, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input 
                    type="text" 
                    value={img} 
                    onChange={(e) => handleImageChange(idx, e.target.value)} 
                    placeholder={`URL Imagen #${idx + 1}`} 
                    className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" 
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(idx)} 
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                  {img && img.trim() !== "" && (
                    <img src={img} alt="preview" className="w-16 h-16 object-cover rounded border" />
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddImage} 
                className="px-3 py-1 bg-cyan-500 text-white rounded font-bold hover:bg-cyan-600"
              >
                + Agregar Imagen
              </button>
            </div>
            
            <div>
              <label className="font-bold text-cyan-400 mb-2 block">Subir nuevas imágenes</label>
              <label className="inline-block px-4 py-2 bg-cyan-500 text-white rounded font-bold cursor-pointer hover:bg-cyan-600 transition-colors">
                <span className="material-symbols-outlined align-middle mr-2">upload</span>
                Elegir archivos
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  multiple 
                  onChange={handleImageFilesChange} 
                  className="hidden" 
                />
              </label>
              <div className="flex gap-2 flex-wrap mt-2">
                {imageFiles.length === 0 && (
                  <span className="text-gray-400 italic text-sm">Sin archivos nuevos seleccionados</span>
                )}
                {imageFiles.map((file, idx) => (
                  <img 
                    key={idx} 
                    src={URL.createObjectURL(file)} 
                    alt="preview" 
                    className="w-16 h-16 object-cover rounded border" 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Videos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Videos</h2>
            <div className="mb-4">
              <label className="font-bold text-cyan-400 mb-2 block">Videos por URL (YouTube o directo)</label>
              {form.videos.map((v, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input 
                    type="text" 
                    value={v} 
                    onChange={(e) => handleVideoUrlChange(idx, e.target.value)} 
                    placeholder={`URL Video #${idx + 1}`} 
                    className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 border" 
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveVideoUrl(idx)} 
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                  {v && v.trim() !== "" && (
                    v.includes("youtube.com") || v.includes("youtu.be") ? (
                      <iframe 
                        src={getYouTubeEmbedUrl(v)} 
                        width="80" 
                        height="45" 
                        title="preview" 
                        frameBorder="0" 
                        allowFullScreen 
                        className="rounded border" 
                      />
                    ) : (
                      <video src={v} width="80" height="45" controls className="rounded border" />
                    )
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddVideoUrl} 
                className="px-3 py-1 bg-cyan-500 text-white rounded font-bold hover:bg-cyan-600"
              >
                + Agregar Video
              </button>
            </div>
            
            <div>
              <label className="font-bold text-cyan-400 mb-2 block">Subir videos (MP4)</label>
              <label className="inline-block px-4 py-2 bg-cyan-500 text-white rounded font-bold cursor-pointer hover:bg-cyan-600 transition-colors">
                <span className="material-symbols-outlined align-middle mr-2">upload</span>
                Elegir archivos
                <input 
                  type="file" 
                  accept="video/mp4,video/webm" 
                  multiple 
                  onChange={handleVideoFilesChange} 
                  className="hidden" 
                />
              </label>
              <div className="flex gap-2 flex-wrap mt-2">
                {videoFiles.length === 0 && (
                  <span className="text-gray-400 italic text-sm">Sin archivos nuevos seleccionados</span>
                )}
                {videoFiles.map((file, idx) => (
                  <video 
                    key={idx} 
                    src={URL.createObjectURL(file)} 
                    width="80" 
                    height="45" 
                    controls 
                    className="rounded border" 
                  />
                ))}
              </div>
            </div>
          </div>


          {/* FAQs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4 border border-cyan-200 dark:border-cyan-900">
            <h2 className="text-xl font-bold text-cyan-500 mb-4">Preguntas Frecuentes</h2>
            {form.faqs.map((faq, idx) => (
              <div key={idx} className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <input 
                  type="text" 
                  value={faq.question} 
                  onChange={(e) => handleArrayChange("faqs", idx, "question", e.target.value)} 
                  placeholder="Pregunta" 
                  className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border focus:border-cyan-400 outline-none" 
                />
                <textarea 
                  value={faq.answer} 
                  onChange={(e) => handleArrayChange("faqs", idx, "answer", e.target.value)} 
                  placeholder="Respuesta" 
                  className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border focus:border-cyan-400 outline-none" 
                  rows="3"
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveArrayItem("faqs", idx)} 
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => handleAddArrayItem("faqs", { question: "", answer: "" })} 
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600"
            >
              + Agregar Pregunta
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => navigate("/admin")}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 px-4 py-3 bg-cyan-500 text-white font-black rounded-xl shadow-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}