import FAQ from "../components/FAQ";
import { Helmet } from "react-helmet-async";

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>Preguntas Frecuentes - Etronix Store | Ayuda y Soporte</title>
        <meta name="description" content="Encuentra respuestas sobre envíos, pagos, garantías y más. Resolvemos todas tus dudas sobre compras en Etronix Store." />
        <meta name="keywords" content="preguntas frecuentes, ayuda etronix, envíos colombia, garantías productos, métodos de pago" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Preguntas Frecuentes - Etronix Store" />
        <meta property="og:description" content="Resuelve todas tus dudas sobre nuestros productos y servicios" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://etronix-store.com/faq" />
        
        {/* Schema.org FAQPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "¿Qué métodos de pago aceptan?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Aceptamos pagos a través de Mercado Pago (tarjetas de crédito/débito), PSE, y efectivo contra entrega en algunas ciudades. Todos los pagos son 100% seguros."
                }
              },
              {
                "@type": "Question",
                "name": "¿Cuánto tiempo tarda el envío?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Los envíos dentro de la ciudad se entregan en 1-3 días hábiles. Para otras ciudades, el tiempo estimado es de 3-5 días hábiles."
                }
              },
              {
                "@type": "Question",
                "name": "¿Los productos tienen garantía?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, todos nuestros productos cuentan con garantía. La duración varía según el producto (generalmente 3-12 meses). Además, ofrecemos garantía de satisfacción de 30 días."
                }
              },
              {
                "@type": "Question",
                "name": "¿Realizan envíos a toda Colombia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, realizamos envíos a todas las ciudades y municipios de Colombia a través de empresas de mensajería confiables."
                }
              }
            ]
          })}
        </script>
        
        <link rel="canonical" href="https://etronix-store.com/faq" />
      </Helmet>
      <div id="faq">
        <FAQ />
      </div>
    </>
  );
}