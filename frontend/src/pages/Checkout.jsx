import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { EmptyCart } from "../components/EmptyState";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [mpInitialized, setMpInitialized] = useState(false);
  
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
    // Inicializar MercadoPago
    try {
      const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      if (publicKey) {
        initMercadoPago(publicKey, { locale: 'es-CO' });
        setMpInitialized(true);
      } else {
        console.error('VITE_MP_PUBLIC_KEY no está configurada');
      }
    } catch (error) {
      console.error('Error inicializando MercadoPago:', error);
    }
  }, []);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    
    if (savedCart.length === 0) {
      navigate('/shop');
    }
  }, [navigate]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
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
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
    
    // Simplemente mostrar el formulario de pago sin crear orden
    setShowPayment(true);
  };

  const onSubmitPayment = async (formData) => {
    try {
      setLoading(true);
      
      console.log("Datos del pago recibidos del CardPayment:", formData);
      
      // Validar que tenemos los datos necesarios
      if (!formData.payment_method_id) {
        console.error("payment_method_id es null o undefined");
        alert("Error: No se detectó el método de pago. Por favor recarga la página e intenta nuevamente.");
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: formData.token,
          issuer_id: formData.issuer_id,
          payment_method_id: formData.payment_method_id,
          transaction_amount: total,
          installments: formData.installments || 1,
          description: `Compra en Etronix Store`,
          payer: {
            email: formData.payer?.email || formData.email || formData.buyer?.email,
            identification: formData.payer?.identification,
            first_name: formData.payer?.first_name,
            last_name: formData.payer?.last_name
          },
          buyer: {
            name: formData.payer?.first_name && formData.payer?.last_name 
              ? `${formData.payer.first_name} ${formData.payer.last_name}` 
              : formData.payer?.email?.split('@')[0] || formData.buyer?.email?.split('@')[0] || "Cliente",
            phone: "N/A",
            email: formData.payer?.email || formData.email || formData.buyer?.email,
            address: "N/A",
            city: "N/A",
            notes: ""
          },
          items: cart.map((item) => ({
            productId: item._id,
            title: item.title,
            price: item.price,
            unit_price: item.price,
            quantity: item.quantity,
          }))
        }),
      });

      const result = await response.json();
      
      console.log("Respuesta del servidor:", result);
      
      if (result.success && result.status === "approved") {
        localStorage.removeItem('cart');
        navigate(`/success?order=${result.orderId}`);
      } else {
        let errorMsg = "El pago fue rechazado.";
        
        if (result.status === "rejected") {
          errorMsg = `Pago rechazado: ${result.message || "Intenta con otra tarjeta o método de pago."}`;
        } else if (result.status === "pending" || result.status === "in_process") {
          errorMsg = "El pago está en proceso. Por favor verifica el estado más tarde.";
        } else if (result.error) {
          errorMsg = `Error: ${result.error}`;
        }
        
        alert(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error procesando pago:", error);
      alert("Error al procesar el pago. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  const onErrorPayment = (error) => {
    console.error("Error en Payment Brick:", error);
    console.error("Error type:", error?.type);
    console.error("Error cause:", error?.cause);
    console.error("Error message:", error?.message);
    
    // Mensajes de error más específicos
    let errorMessage = "Ocurrió un error al procesar el pago.";
    
    if (error?.message) {
      if (error.message.includes("Secure Fields")) {
        errorMessage = "Error de configuración del sistema de pago. Por favor, recarga la página e intenta nuevamente.";
      } else if (error.message.includes("amount")) {
        errorMessage = "Error con el monto del pago. Por favor, verifica tu carrito.";
      } else {
        errorMessage = error.message;
      }
    }
    
    // Solo mostrar alerta para errores críticos
    if (error?.type === 'critical' || error?.message?.includes("Secure Fields")) {
      alert(errorMessage);
      // Recargar la página si hay error de Secure Fields
      if (error?.message?.includes("Secure Fields")) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
          <EmptyCart />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-8">
          Finalizar Compra
        </h1>

        {!showPayment ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Información de Envío
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Juan Pérez"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Teléfono / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="3001234567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Dirección Completa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Calle 123 #45-67"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Bogotá"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Notas Adicionales (opcional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Ej: Entregar después de las 2pm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/shop')}
                    className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Volver a la Tienda
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : 'Continuar al Pago'}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Resumen del Pedido
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div 
                      key={item._id}
                      className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${item.price?.toLocaleString("es-CO")} c/u
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 dark:text-white">
                          ${(item.price * item.quantity).toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                    <span>${total.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span className="text-primary-600">${total.toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Información de Pago
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Total a pagar: <span className="text-2xl font-bold text-primary-600">${total.toLocaleString("es-CO")}</span>
              </p>
              
              {!mpInitialized ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando sistema de pago...</p>
                </div>
              ) : total > 0 ? (
                <CardPayment
                  initialization={{
                    amount: Number(total),
                    payer: {
                      email: formData.email
                    }
                  }}
                  onSubmit={onSubmitPayment}
                  onError={onErrorPayment}
                />
              ) : (
                <p className="text-red-500">Error: El total debe ser mayor a 0</p>
              )}
              
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="w-full mt-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ← Volver
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
