import { useState, useEffect, useRef } from "react";

export default function Chatbot({ startOpen = false, onClose } = {}) {
  const [isOpen, setIsOpen] = useState(!!startOpen);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "¡Hola! 👋 Soy el asistente virtual de Etronix. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Base de conocimientos del chatbot
  const knowledgeBase = {
    saludos: {
      keywords: ["hola", "buenos", "buenas", "saludos", "hey", "ola"],
      response: "¡Hola! 😊 ¿En qué puedo ayudarte hoy? Puedo resolver dudas sobre:\n\n• Productos y especificaciones\n• Métodos de pago\n• Envíos y entregas\n• Garantías\n• Estado de pedidos"
    },
    productos: {
      keywords: ["producto", "artículo", "venden", "tienen", "disponible", "stock", "audífono", "cargador", "cable", "protector", "celular"],
      response: "📱 Contamos con una amplia variedad de accesorios para celulares:\n\n• Audífonos (inalámbricos y con cable)\n• Cargadores (rápidos, inalámbricos)\n• Cables USB-C, Lightning, Micro USB\n• Protectores de pantalla\n• Fundas y estuches\n• Memorias y almacenamiento\n\n¿Te gustaría ver alguna categoría específica?"
    },
    precio: {
      keywords: ["precio", "costo", "valor", "cuánto cuesta", "cuanto vale", "barato"],
      response: "💰 Nuestros precios son muy competitivos:\n\n• Los precios están publicados en cada producto\n• Realizamos envíos a toda Colombia\n• Aceptamos diversos métodos de pago\n\n¿Hay algún producto en particular que te interese?"
    },
    pago: {
      keywords: ["pago", "pagar", "tarjeta", "efectivo", "transferencia", "mercadopago", "mercado pago", "nequi", "daviplata"],
      response: "💳 Métodos de Pago Disponibles:\n\n• Mercado Pago (tarjetas de crédito/débito)\n• PSE (Pagos Seguros en Línea)\n• Efectivo (contra entrega en algunas ciudades)\n• Transferencia bancaria\n\nTodos los pagos son 100% seguros. Al finalizar tu compra, serás redirigido a Mercado Pago para completar el pago."
    },
    envio: {
      keywords: ["envío", "envio", "entrega", "domicilio", "despacho", "envían", "cuánto demora", "tiempo de entrega"],
      response: "🚚 Información de Envíos:\n\n• Realizamos envíos a toda Colombia\n• El costo varía según la ciudad y el peso del paquete\n• Tiempo estimado: 2-5 días hábiles\n• Te contactamos por WhatsApp para coordinar\n• Envío gratis en compras superiores a $100.000 (algunas ciudades)\n\nDespués de tu compra, nos comunicaremos contigo para confirmar los detalles del envío."
    },
    garantia: {
      keywords: ["garantía", "garantia", "devolución", "devolucion", "cambio", "defectuoso", "dañado"],
      response: "✅ Garantía y Devoluciones:\n\n• Todos nuestros productos tienen garantía\n• Garantía de satisfacción de 30 días\n• Si el producto llega defectuoso, hacemos cambio sin costo\n• Debes conservar el empaque original\n\nPara hacer válida la garantía, contáctanos por WhatsApp con:\n• Número de pedido\n• Foto del producto\n• Descripción del problema"
    },
    horario: {
      keywords: ["horario", "hora", "abren", "abierto", "atienden", "horarios"],
      response: "🕐 Horario de Atención:\n\n• Lunes a Viernes: 8:00 AM - 8:00 PM\n• Sábados: 9:00 AM - 6:00 PM\n• Domingos: 10:00 AM - 2:00 PM\n\nLa tienda online está disponible 24/7. Puedes hacer pedidos en cualquier momento y los procesamos en el horario indicado."
    },
    whatsapp: {
      keywords: ["whatsapp", "contacto", "teléfono", "telefono", "llamar", "número", "numero", "asesor"],
      response: "📱 Contacto Directo:\n\n¿Necesitas hablar con un asesor?\n\nContáctanos por WhatsApp:\n+57 320 7208410\n\nNuestros asesores te atenderán con gusto en el horario de atención. También puedes dejarnos un mensaje y te responderemos lo antes posible."
    },
    seguimiento: {
      keywords: ["seguimiento", "rastreo", "pedido", "orden", "compra", "estado"],
      response: "📦 Seguimiento de Pedidos:\n\nPara consultar el estado de tu pedido:\n\n1. Revisa el email de confirmación\n2. Contáctanos por WhatsApp con tu número de pedido\n3. Te enviaremos el estado actualizado\n\nEstados posibles:\n• Pendiente: Esperando pago\n• Pagado: Pago confirmado\n• Procesando: Preparando tu pedido\n• Enviado: En camino\n• Entregado: Pedido completado"
    },
    ubicacion: {
      keywords: ["ubicación", "ubicacion", "dirección", "direccion", "dónde están", "donde quedan", "tienda física"],
      response: "📍 Somos una tienda 100% online, lo que nos permite ofrecerte:\n\n• Mejores precios\n• Mayor variedad de productos\n• Envíos a toda Colombia\n• Atención personalizada por WhatsApp\n\nNo tenemos tienda física, pero puedes comprar con total confianza desde nuestra página web."
    },
    agradecimiento: {
      keywords: ["gracias", "grax", "ok", "vale", "perfecto", "entendido", "muchas gracias"],
      response: "¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?\n\nSi estás listo para comprar, puedes explorar nuestros productos en la tienda. ¡Estamos para servirte!"
    },
    despedida: {
      keywords: ["adiós", "adios", "chao", "hasta luego", "bye", "nos vemos"],
      response: "¡Hasta pronto! 👋 Gracias por visitar Etronix. Estaremos encantados de ayudarte cuando necesites. ¡Que tengas un excelente día!"
    }
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [category, data] of Object.entries(knowledgeBase)) {
      const found = data.keywords.some(keyword => lowerMessage.includes(keyword));
      if (found) {
        return data.response;
      }
    }

    return "🤔 Disculpa, no estoy seguro de entender tu pregunta.\n\nPuedo ayudarte con:\n\n• Información de productos\n• Métodos de pago\n• Envíos y entregas\n• Garantías\n• Seguimiento de pedidos\n\nTambién puedes contactar a un asesor por WhatsApp: +57 320 7208410";
  };

  const quickQuestions = [
    "¿Qué productos venden?",
    "¿Cuáles son los métodos de pago?",
    "¿Cómo funciona el envío?",
    "¿Tienen garantía?",
    "Contactar por WhatsApp"
  ];

  const handleSendMessage = (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      type: "user",
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simular "escribiendo..."
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        type: "bot",
        text: getBotResponse(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante del chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-500 rounded-full shadow-2xl shadow-cyan-500/50 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Abrir chat"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C11.45 2 11 2.45 11 3V4.07C8.69 4.38 6.92 6.15 6.61 8.46L5 8.46C4.45 8.46 4 8.91 4 9.46V12.54C4 13.09 4.45 13.54 5 13.54H6.61C6.92 15.85 8.69 17.62 11 17.93V20H9C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21C16 20.45 15.55 20 15 20H13V17.93C15.31 17.62 17.08 15.85 17.39 13.54H19C19.55 13.54 20 13.09 20 12.54V9.46C20 8.91 19.55 8.46 19 8.46H17.39C17.08 6.15 15.31 4.38 13 4.07V3C13 2.45 12.55 2 12 2M12 6C14.21 6 16 7.79 16 10V13C16 15.21 14.21 17 12 17C9.79 17 8 15.21 8 13V10C8 7.79 9.79 6 12 6M10 10C9.45 10 9 10.45 9 11C9 11.55 9.45 12 10 12C10.55 12 11 11.55 11 11C11 10.45 10.55 10 10 10M14 10C13.45 10 13 10.45 13 11C13 11.55 13.45 12 14 12C14.55 12 15 11.55 15 11C15 10.45 14.55 10 14 10Z"/>
          </svg>
          <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30"></span>
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] backdrop-blur-2xl bg-gray-900/95 rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="relative bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-4 flex items-center justify-between">
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md" />
                <div className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center p-2">
                  <svg className="w-full h-full text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C11.45 2 11 2.45 11 3V4.07C8.69 4.38 6.92 6.15 6.61 8.46L5 8.46C4.45 8.46 4 8.91 4 9.46V12.54C4 13.09 4.45 13.54 5 13.54H6.61C6.92 15.85 8.69 17.62 11 17.93V20H9C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21C16 20.45 15.55 20 15 20H13V17.93C15.31 17.62 17.08 15.85 17.39 13.54H19C19.55 13.54 20 13.09 20 12.54V9.46C20 8.91 19.55 8.46 19 8.46H17.39C17.08 6.15 15.31 4.38 13 4.07V3C13 2.45 12.55 2 12 2M12 6C14.21 6 16 7.79 16 10V13C16 15.21 14.21 17 12 17C9.79 17 8 15.21 8 13V10C8 7.79 9.79 6 12 6M10 10C9.45 10 9 10.45 9 11C9 11.55 9.45 12 10 12C10.55 12 11 11.55 11 11C11 10.45 10.55 10 10 10M14 10C13.45 10 13 10.45 13 11C13 11.55 13.45 12 14 12C14.55 12 15 11.55 15 11C15 10.45 14.55 10 14 10Z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-black text-white">Asistente Etronix</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <p className="text-xs text-white/90 font-bold">En línea</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                if (typeof onClose === 'function') onClose();
              }}
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              aria-label="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.type === "user"
                      ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-2 ${
                    msg.type === "user" ? "text-white/80" : "text-gray-400"
                  }`}>
                    {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de escribiendo */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas rápidas */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2 font-bold">
                💬 Preguntas frecuentes:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    className="text-xs px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-gray-300 hover:bg-linear-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all font-bold"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                aria-label="Enviar mensaje"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </>
  );
}