// Configuración centralizada para SEO
export const SEO_CONFIG = {
  siteName: 'Etronix Store',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://etronix-store.com',
  defaultTitle: 'Etronix Store – Accesorios para celulares y tecnología',
  defaultDescription: 'Accesorios para celulares en Colombia: audífonos, cargadores, cables y más. Envío gratis desde $100.000. Garantía extendida y pago seguro.',
  twitterHandle: '@etronixstore',
  fbAppId: '', // Agregar si tienes
  
  // Imágenes por defecto
  defaultImage: '/og-image.jpg',
  defaultImageAlt: 'Etronix Store - Accesorios tecnológicos',
  
  // Organización
  organization: {
    name: 'Etronix Store',
    logo: '/logo.png',
    phone: '+57-320-720-8410',
    email: 'info@etronix.com',
    address: {
      addressCountry: 'CO',
      addressLocality: 'Medellín',
      addressRegion: 'Antioquia'
    }
  }
};

// Función helper para construir URLs
export const buildUrl = (path = '') => {
  const base = SEO_CONFIG.siteUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}`;
};

// Función helper para generar meta tags
export const generateMetaTags = ({
  title,
  description = SEO_CONFIG.defaultDescription,
  image = SEO_CONFIG.defaultImage,
  type = 'website',
  path = ''
}) => {
  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaultTitle;
  
  const url = buildUrl(path);
  const imageUrl = image.startsWith('http') ? image : buildUrl(image);
  
  return {
    title: fullTitle,
    description,
    canonical: url,
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      image: imageUrl,
      siteName: SEO_CONFIG.siteName
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      image: imageUrl
    }
  };
};