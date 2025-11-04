// Componente de sección FAQ para la página Home
import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "🛍️ Compras y Pagos",
      questions: [
        {
          q: "¿Qué métodos de pago aceptan?",
          a: "Aceptamos pagos a través de Mercado Pago (tarjetas de crédito/débito), PSE, y efectivo contra entrega en algunas ciudades. Todos los pagos son 100% seguros."
        },
        {
          q: "¿Es seguro comprar en Etronix?",
          a: "Sí, totalmente seguro. Procesamos todos los pagos a través de Mercado Pago, una plataforma certificada y segura. Además, protegemos tus datos personales y nunca almacenamos información sensible de pago."
        },
        {
          q: "¿Puedo cancelar mi pedido?",
          a: "Sí, puedes cancelar tu pedido mientras esté en estado 'Pendiente' o 'Procesando'. Una vez enviado, ya no es posible cancelarlo, pero puedes hacer devolución cuando lo recibas."
        }
      ]
    },
    {
      category: "📦 Envíos y Entregas",
      questions: [
        {
          q: "¿Cuánto tiempo tarda el envío?",
          a: "Los envíos dentro de la ciudad se entregan en 1-3 días hábiles. Para otras ciudades, el tiempo estimado es de 3-5 días hábiles. Te mantendremos informado por WhatsApp sobre el estado de tu pedido."
        },
        {
          q: "¿Cuánto cuesta el envío?",
          a: "El costo de envío varía según la ciudad y el peso del paquete. Después de realizar tu pedido, nos comunicaremos contigo por WhatsApp para confirmar el costo exacto. ¡Envíos gratis en compras superiores a $100.000 en ciudades principales!"
        },
        {
          q: "¿Realizan envíos a toda Colombia?",
          a: "Sí, realizamos envíos a todas las ciudades y municipios de Colombia a través de empresas de mensajería confiables."
        },
        {
          q: "¿Cómo puedo rastrear mi pedido?",
          a: "Una vez procesemos tu pedido, te enviaremos un número de seguimiento por WhatsApp. También puedes contactarnos en cualquier momento con tu número de pedido para conocer el estado."
        }
      ]
    },
    {
      category: "✅ Garantías y Devoluciones",
      questions: [
        {
          q: "¿Los productos tienen garantía?",
          a: "Sí, todos nuestros productos cuentan con garantía. La duración varía según el producto (generalmente 3-12 meses). Además, ofrecemos garantía de satisfacción de 30 días."
        },
        {
          q: "¿Qué hago si el producto llega defectuoso?",
          a: "Si tu producto llega con algún defecto, contáctanos inmediatamente por WhatsApp con fotos del producto y descripción del problema. Haremos el cambio sin costo adicional."
        },
        {
          q: "¿Puedo devolver un producto si no me gusta?",
          a: "Sí, tienes 30 días para devolver un producto que no te satisfaga. El producto debe estar en su empaque original y sin usar. El costo del envío de devolución corre por cuenta del comprador, excepto si el producto llegó defectuoso."
        },
        {
          q: "¿Cómo hago válida la garantía?",
          a: "Para hacer válida la garantía, contacta por WhatsApp con:\n• Tu número de pedido\n• Fotos del producto\n• Descripción detallada del problema\nNuestro equipo te indicará los pasos a seguir."
        }
      ]
    },
    {
      category: "📱 Productos y Stock",
      questions: [
        {
          q: "¿Todos los productos mostrados están en stock?",
          a: "Actualizamos nuestro inventario constantemente. Si un producto muestra disponibilidad en la página, lo tenemos en stock. Si algo se agota, lo marcamos inmediatamente."
        },
        {
          q: "¿Los productos son originales?",
          a: "Sí, todos nuestros productos son 100% originales y vienen con garantía del fabricante. No vendemos réplicas ni imitaciones."
        },
        {
          q: "¿Puedo pedir un producto que no está en la página?",
          a: "¡Sí! Si buscas un producto específico que no encuentras en nuestra tienda, contáctanos por WhatsApp. Haremos lo posible por conseguirlo para ti."
        }
      ]
    },
    {
      category: "📞 Contacto y Soporte",
      questions: [
        {
          q: "¿Cómo puedo contactarlos?",
          a: "Puedes contactarnos por WhatsApp al +57 300 123 4567. También puedes usar nuestro chatbot en la esquina inferior derecha para preguntas rápidas."
        },
        {
          q: "¿Cuál es el horario de atención?",
          a: "Lunes a Viernes: 8:00 AM - 8:00 PM\nSábados: 9:00 AM - 6:00 PM\nDomingos: 10:00 AM - 2:00 PM\n\nLa tienda online está disponible 24/7. Puedes hacer pedidos en cualquier momento."
        },
        {
          q: "¿Tienen tienda física?",
          a: "Somos una tienda 100% online, lo que nos permite ofrecerte mejores precios, mayor variedad y envíos a toda Colombia. No tenemos tienda física, pero nuestro servicio de atención por WhatsApp es muy personalizado."
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
  <section className="py-16 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 bg-background-light dark:bg-background-dark">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-4">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={questionIndex}
                      className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                      >
                        <span className="font-semibold text-text-light dark:text-text-dark pr-4">
                          {faq.q}
                        </span>
                        <svg
                          className={`w-5 h-5 text-primary shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-line">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA de contacto */}
        <div className="mt-12 p-8 bg-primary/5 rounded-xl border-2 border-primary/20 text-center">
          <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-3">
            ¿Aún tienes dudas?
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            Nuestro equipo está listo para ayudarte. Contáctanos por WhatsApp y resolveremos todas tus inquietudes.
          </p>
          <a
            href="https://wa.me/573001234567?text=Hola,%20tengo%20una%20pregunta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
