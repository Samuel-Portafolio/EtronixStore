import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>Tienda de Accesorios | Etronix Store</title>
        <meta name="description" content="Explora nuestro catálogo completo..." />
        <link rel="canonical" href="https://etronix-store.com/shop" />
      </Helmet>
      <section className="py-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Nosotros</h1>
          <p className="text-gray-600 mb-4">
            En Etronix nos especializamos en accesorios premium para celulares. Nuestro enfoque es
            ofrecer productos de alta calidad con una experiencia de compra clara, rápida y confiable.
          </p>
          <p className="text-gray-600 mb-4">
            Operamos 100% online, con envíos a toda Colombia y soporte cercano por WhatsApp.
            Trabajamos con marcas confiables y garantizamos todos nuestros productos.
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Garantías entre 3 y 12 meses según producto</li>
            <li>Pagos seguros a través de Mercado Pago</li>
            <li>Atención rápida por WhatsApp</li>
          </ul>
        </div>
      </section>
    </>
  );
}
