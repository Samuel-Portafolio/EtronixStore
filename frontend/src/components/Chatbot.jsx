import { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "¡Hola! 👋 Soy el asistente virtual de Etronix. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
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
      response: "📱 Contacto Directo:\n\n¿Necesitas hablar con un asesor?\n\nContáctanos por WhatsApp:\n+57 300 123 4567\n\nNuestros asesores te atenderán con gusto en el horario de atención. También puedes dejarnos un mensaje y te responderemos lo antes posible."
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
    
    // Buscar en la base de conocimientos
    for (const [category, data] of Object.entries(knowledgeBase)) {
      const found = data.keywords.some(keyword => lowerMessage.includes(keyword));
      if (found) {
        return data.response;
      }
    }

    // Si no encuentra una coincidencia específica
    return "🤔 Disculpa, no estoy seguro de entender tu pregunta.\n\nPuedo ayudarte con:\n\n• Información de productos\n• Métodos de pago\n• Envíos y entregas\n• Garantías\n• Seguimiento de pedidos\n\nTambién puedes contactar a un asesor por WhatsApp: +57 300 123 4567";
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

    // Agregar mensaje del usuario
    const userMessage = {
      type: "user",
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simular "escribiendo..." y luego responder
    setTimeout(() => {
      const botResponse = {
        type: "bot",
        text: getBotResponse(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
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
          className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Abrir chat"
        >
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          {/* Pulso animado */}
          <span className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20"></span>
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Asistente Etronix</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-white/90">En línea</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
              aria-label="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-light">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === "user"
                      ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.type === "user" ? "text-white/70" : "text-gray-500"
                  }`}>
                    {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas rápidas */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Preguntas frecuentes:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-3 rounded-full border border-border-light bg-background-light text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-12 h-12 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
