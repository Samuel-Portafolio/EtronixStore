import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyCart } from "../components/EmptyState";
import { Helmet } from "react-helmet-async";

// ✅ Solo el componente necesario, cargado de forma lazy
const CardPayment = lazy(() =>
  import("@mercadopago/sdk-react").then((m) => ({ default: m.CardPayment }))
);

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
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Cargar carrito
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    if (savedCart.length === 0) {
      navigate("/shop");
    }
  }, [navigate]);

  // Inicializar MercadoPago sólo cuando el usuario continúa al pago
  useEffect(() => {
    if (!showPayment) return;

    (async () => {
      try {
        const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
        if (!publicKey) {
          console.error("VITE_MP_PUBLIC_KEY no está configurada");
          return;
        }

        const { initMercadoPago } = await import("@mercadopago/sdk-react");
        initMercadoPago(publicKey, { locale: "es-CO" });
        setMpInitialized(true);
      } catch (error) {
        console.error("Error inicializando MercadoPago:", error);
      }
    })();
  }, [showPayment]);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Ingresa un teléfono válido (10 dígitos)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (
      !formData.address.trim() ||
      formData.address.trim().toLowerCase() === "n/a"
    ) {
      newErrors.address = "La dirección es obligatoria y no puede ser 'N/A'";
    }

    if (
      !formData.city.trim() ||
      formData.city.trim().toLowerCase() === "n/a"
    ) {
      newErrors.city = "La ciudad es obligatoria y no puede ser 'N/A'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setShowPayment(true);
  };

  const onSubmitPayment = async (mpData) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/process`,
        {
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
              last_name: mpData.payer?.last_name,
            },
            buyer: {
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              notes: formData.notes,
            },
            items: cart.map((item) => ({
              productId: item._id,
              title: item.title,
              price: item.price,
              unit_price: item.price,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.status === "approved") {
        localStorage.removeItem("cart");
        navigate(`/success?order=${result.orderId}`);
      } else {
        let errorMsg = "El pago fue rechazado.";
        if (result.status === "rejected") {
          errorMsg = `Pago rechazado: ${
            result.message || "Intenta con otra tarjeta."
          }`;
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
        errorMessage =
          "Error de configuración del sistema de pago. Por favor, recarga la página e intenta nuevamente.";
      } else if (error.message.includes("amount")) {
        errorMessage =
          "Error con el monto del pago. Por favor, verifica tu carrito.";
      } else {
        errorMessage = error.message;
      }
    }

    if (error?.type === "critical" || error?.message?.includes("Secure Fields")) {
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
        <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-r from-gray-900 via-slate-900 to-black" />
        <div className="relative min-h-screen flex flex-col z-10">
          <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
            <EmptyCart />
          </main>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Helmet>
        <title>Finalizar Compra | Etronix Store</title>
        <meta
          name="description"
          content="Completa tu compra de forma segura con Mercado Pago"
        />
        <link
          rel="canonical"
          href="https://etronix-store.com/checkout"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Fondo */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-r from-gray-900 via-slate-900 to-black" />

      <div className="relative min-h-screen flex flex-col z-10">
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full">
          <h1 className="text-4xl font-black text-white mb-8">
            Finalizar Compra
          </h1>

          {!showPayment ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
  {/* Formulario */}
  <div className="w-full max-w-2xl mx-auto lg:max-w-none">
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Campos en grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="name" className="..." />
        <input name="phone" className="..." />
        <input name="email" className="..." />
        <input name="city" className="..." />
      </div>
      {/* Resto del formulario */}
    </form>
  </div>

  {/* Resumen */}
  <div className="w-full max-w-2xl mx-auto lg:max-w-none">
    <div className="lg:sticky lg:top-24">
      {/* Resumen del carrito */}
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
                  Total a pagar:{" "}
                  <span className="text-3xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    ${total.toLocaleString("es-CO")}
                  </span>
                </p>

                {!mpInitialized ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-300">
                      Cargando sistema de pago...
                    </p>
                  </div>
                ) : total > 0 ? (
                  <Suspense
                    fallback={
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4" />
                        <p className="text-gray-300">
                          Cargando formulario de pago...
                        </p>
                      </div>
                    }
                  >
                    <CardPayment
                      initialization={{
                        amount: Number(total),
                        payer: { email: formData.email },
                      }}
                      onSubmit={onSubmitPayment}
                      onError={onErrorPayment}
                    />
                  </Suspense>
                ) : (
                  <p className="text-red-400 font-bold">
                    Error: El total debe ser mayor a 0
                  </p>
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
    </div>
  );
}
