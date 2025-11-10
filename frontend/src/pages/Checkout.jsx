import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { EmptyCart } from "../components/EmptyState";
import { Helmet } from "react-helmet-async";
import LightRays from "../components/LightRays";

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
    
    setShowPayment(true);
  };

  const onSubmitPayment = async (mpData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: mpData.token,
          issuer_id: mpData.issuer_id,
          payment_method_id: mpData.payment_method_id,
          transaction_amount: total,
          installments: mpData.installments || 1,
          description: `Compra en Etronix Store`,
          payer: {
            email: mpData.payer?.email || formData.email,
            identification: mpData.payer?.identification,
            first_name: mpData.payer?.first_name,
            last_name: mpData.payer?.last_name
          },
          buyer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            notes: formData.notes
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
      
      if (result.success && result.status === "approved") {
        localStorage.removeItem('cart');
        navigate(`/success?order=${result.orderId}`);
      } else {
        let errorMsg = "El pago fue rechazado.";
        if (result.status === "rejected") {
          errorMsg = `Pago rechazado: ${result.message || "Intenta con otra tarjeta."}`;
        } else if (result.status === "pending") {
          errorMsg = "El pago está en proceso.";
        }
        alert(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar el pago. Intenta nuevamente.");
      setLoading(false);
    }
  };

  const onErrorPayment = (error) => {
    console.error("Error en Payment Brick:", error);
    
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
    
    if (error?.type === 'critical' || error?.message?.includes("Secure Fields")) {
      alert(errorMessage);
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
      <>
        <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-r from-gray-900 via-slate-900 to-black">
          <LightRays
            raysOrigin="top-center"
            raysColor="#00d4ff"
            raysSpeed={1.5}
            lightSpread={0.9}
            rayLength={1.2}
            followMouse
            mouseInfluence={0.12}
            noiseAmount={0.06}
            distortion={0.03}
            className="w-full h-full pointer-events-none opacity-70"
          />
        </div>
        <div className="relative min-h-screen flex flex-col z-10">
          <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
            <EmptyCart />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Finalizar Compra | Etronix Store</title>
        <meta name="description" content="Completa tu compra de forma segura con Mercado Pago" />
        <link rel="canonical" href="https://etronix-store.com/checkout" />
      </Helmet>

      {/* Fondo LightRays */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-r from-gray-900 via-slate-900 to-black">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00d4ff"
          raysSpeed={1.5}
          lightSpread={0.9}
          rayLength={1.2}
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.06}
          distortion={0.03}
          className="w-full h-full pointer-events-none opacity-70"
        />
      </div>

      <div className="relative min-h-screen flex flex-col z-10">
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
          <h1 className="text-4xl font-black text-white mb-8">
            Finalizar Compra
          </h1>

          {!showPayment ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulario */}
              <div className="backdrop-blur-xl bg-linear-to-r from-white/15 to-white/5 rounded-2xl border border-white/20 shadow-xl p-6">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Información de Envío
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-200 mb-2">
                      Nombre Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border-2 ${
                        errors.name ? 'border-red-500' : 'border-white/20 focus:border-cyan-400/50'
                      } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all`}
                      placeholder="Juan Pérez"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1 font-bold">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-200 mb-2">
                      Teléfono / WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border-2 ${
                        errors.phone ? 'border-red-500' : 'border-white/20 focus:border-cyan-400/50'
                      } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all`}
                      placeholder="3001234567"
                    />
                    {errors.phone && <p className="text-red-400 text-sm mt-1 font-bold">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-200 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border-2 ${
                        errors.email ? 'border-red-500' : 'border-white/20 focus:border-cyan-400/50'
                      } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all`}
                      placeholder="correo@ejemplo.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1 font-bold">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-200 mb-2">
                      Dirección Completa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border-2 ${
                        errors.address ? 'border-red-500' : 'border-white/20 focus:border-cyan-400/50'
                      } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all`}
                      placeholder="Calle 123 #45-67"
                    />
                    {errors.address && <p className="text-red-400 text-sm mt-1 font-bold">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-200 mb-2">
                      Ciudad <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border-2 ${
                        errors.city ? 'border-red-500' : 'border-white/20 focus:border-cyan-400/50'
                      } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all`}
                      placeholder="Bogotá"
                    />
                    {errors.city && <p className="text-red-400 text-sm mt-1 font-bold">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-200 mb-2">
                      Notas Adicionales (opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border-2 border-white/20 focus:border-cyan-400/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                      placeholder="Ej: Entregar después de las 2pm"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/shop')}
                      className="flex-1 py-3.5 rounded-xl border-2 border-white/30 text-white font-black hover:bg-white/10 hover:border-cyan-400/50 transition-all"
                    >
                      Volver a la Tienda
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white font-black hover:from-cyan-400 hover:to-blue-400 shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Procesando...' : 'Continuar al Pago'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Resumen */}
              <div>
                <div className="backdrop-blur-xl bg-linear-to-r from-white/15 to-white/5 rounded-2xl border border-white/20 shadow-xl p-6 sticky top-24">
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Resumen del Pedido
                  </h2>

                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex gap-4 pb-4 border-b border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="font-black text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-300 mt-1">
                            Cantidad: <span className="font-bold">{item.quantity}</span>
                          </p>
                          <p className="text-sm text-gray-300">
                            ${item.price?.toLocaleString("es-CO")} c/u
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white text-lg">
                            ${(item.price * item.quantity).toLocaleString("es-CO")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-300 text-sm">
                      <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                      <span className="font-bold">${total.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-white pt-3 border-t border-white/20">
                      <span>Total</span>
                      <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        ${total.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="backdrop-blur-xl bg-linear-to-r from-white/15 to-white/5 rounded-2xl border border-white/20 shadow-xl p-6 mb-6">
                <h2 className="text-3xl font-black text-white mb-4">
                  Información de Pago
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                  Total a pagar: <span className="text-3xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">${total.toLocaleString("es-CO")}</span>
                </p>

                {!mpInitialized ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-300">Cargando sistema de pago...</p>
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
                  <p className="text-red-400 font-bold">Error: El total debe ser mayor a 0</p>
                )}

                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="w-full mt-6 py-3.5 rounded-xl border-2 border-white/30 text-white font-black hover:bg-white/10 hover:border-cyan-400/50 transition-all"
                >
                  ← Volver
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
