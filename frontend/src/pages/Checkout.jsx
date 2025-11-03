import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Datos del cliente
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar carrito desde localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    
    if (savedCart.length === 0) {
      // Si no hay productos, redirigir a la tienda
      navigate('/shop');
    }
  }, [navigate]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Ingresa un teléfono válido (10 dígitos)";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "La ciudad es obligatoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            title: item.title,
            unit_price: item.price,
            quantity: item.quantity,
            productId: item._id,
          })),
          buyer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            notes: formData.notes
          },
        }),
      });
      
      const data = await res.json();
      
      if (data?.init_point) {
        // Limpiar carrito antes de redirigir a Mercado Pago
        localStorage.removeItem('cart');
        window.location.href = data.init_point;
      } else {
        alert("No se pudo iniciar el pago. Por favor intenta nuevamente.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error al procesar el pago. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // Mientras redirige
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light dark:bg-bg-dark">
      <Header cartCount={totalItems} />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-8">
          Finalizar Compra
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow p-6">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-6">
              Información de Envío
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name 
                      ? 'border-red-500' 
                      : 'border-border-light dark:border-border-dark'
                  } bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Juan Pérez"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  Teléfono / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone 
                      ? 'border-red-500' 
                      : 'border-border-light dark:border-border-dark'
                  } bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="3001234567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'border-border-light dark:border-border-dark'
                  } bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  Dirección Completa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.address 
                      ? 'border-red-500' 
                      : 'border-border-light dark:border-border-dark'
                  } bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Calle 123 #45-67, Apto 101"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.city 
                      ? 'border-red-500' 
                      : 'border-border-light dark:border-border-dark'
                  } bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Bogotá"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  Notas Adicionales (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Ej: Entregar después de las 2pm, portería del edificio, etc."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="flex-1 py-3 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-semibold hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                >
                  Volver a la Tienda
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-primary text-black font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Continuar al Pago'}
                </button>
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-6">
                Resumen del Pedido
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div 
                    key={item._id}
                    className="flex gap-4 pb-4 border-b border-border-light dark:border-border-dark"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-light dark:text-text-dark">
                        {item.title}
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        ${item.price?.toLocaleString("es-CO")} c/u
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-light dark:text-text-dark">
                        ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-4 space-y-2">
                <div className="flex justify-between text-text-secondary-light dark:text-text-secondary-dark">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span>${total.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-text-secondary-light dark:text-text-secondary-dark">
                  <span>Envío</span>
                  <span className="text-primary font-semibold">A calcular</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-text-light dark:text-text-dark pt-2 border-t border-border-light dark:border-border-dark">
                  <span>Total</span>
                  <span className="text-primary">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-text-light dark:text-text-dark">
                  <strong>Nota:</strong> El costo de envío se calculará y confirmará por WhatsApp según tu ubicación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
