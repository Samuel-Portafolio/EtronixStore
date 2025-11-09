import FAQ from "../components/FAQ";
import { Helmet } from "react-helmet-async";

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>Tienda de Accesorios | Etronix Store</title>
        <meta name="description" content="Explora nuestro catálogo completo..." />
        <link rel="canonical" href="https://etronix-store.com/shop" />
      </Helmet>
      <div id="faq">
        <FAQ />
      </div>
    </>
  );
}
