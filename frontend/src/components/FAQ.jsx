export default function FAQ() {
  const faqs = [
    {
      q: "¿Cuál es el tiempo de entrega?",
      a: "Los envíos a Bogotá toman de 1-3 días hábiles. Para otras ciudades principales, de 3-5 días hábiles. Te enviaremos el número de guía para que rastrees tu pedido.",
    },
    {
      q: "¿Qué métodos de pago aceptan?",
      a: "Aceptamos Mercado Pago, PSE, tarjetas de crédito/débito (Visa, Mastercard), y transferencias bancarias. Todos los pagos son 100% seguros y encriptados.",
    },
    {
      q: "¿Tienen garantía los productos?",
      a: "Sí, todos nuestros productos cuentan con garantía de 12 meses por defectos de fabricación. Además, tienes 15 días para devolución si el producto no cumple tus expectativas.",
    },
    {
      q: "¿Hacen envíos a toda Colombia?",
      a: "Sí, realizamos envíos a todas las ciudades y municipios de Colombia mediante Servientrega, Coordinadora e Interrapidísimo. El costo de envío se calcula según la ciudad de destino.",
    },
    {
      q: "¿Cómo puedo rastrear mi pedido?",
      a: "Una vez procesado tu pedido, recibirás un correo electrónico con el número de guía. Podrás rastrear tu envío directamente en la página de la transportadora o contactarnos por WhatsApp.",
    },
    {
      q: "¿Tienen tienda física?",
      a: "Por el momento operamos solo en línea, lo que nos permite ofrecer mejores precios. Sin embargo, brindamos soporte por WhatsApp, email y redes sociales de lunes a sábado de 8 AM a 6 PM.",
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.25em] font-bold text-cyan-300 uppercase mb-3">
            ❓ Soporte
          </p>
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-gray-300 text-lg">
            Encuentra respuestas rápidas a las dudas más comunes
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 border border-white/20 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden"
            >
              <summary className="cursor-pointer list-none p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <h3 className="text-base lg:text-lg font-bold text-white pr-4">
                  {faq.q}
                </h3>
                <svg
                  className="w-6 h-6 text-cyan-400 transition-transform duration-300 group-open:rotate-180 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-6 pt-0">
                <div className="pt-4 border-t border-white/10">
                  <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* CTA de contacto */}
        <div className="mt-12 text-center backdrop-blur-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-2xl p-8">
          <p className="text-white font-bold text-lg mb-4">
            ¿No encuentras lo que buscas?
          </p>
          <p className="text-gray-300 mb-6">
            Nuestro equipo está listo para ayudarte por WhatsApp
          </p>
          <a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-gray-900 font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-cyan-500/50bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
