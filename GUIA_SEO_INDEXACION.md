# 🔍 Guía SEO e Indexación en Google - Etronix Store

## ✅ Mejoras SEO Implementadas

### 1. Meta Tags Mejorados (index.html)
- ✅ Open Graph completos con URLs absolutas
- ✅ Twitter Cards optimizadas
- ✅ Canonical URL definida
- ✅ Geo tags para Colombia (geo.region, geo.placename)
- ✅ og:locale es_CO

### 2. Schema.org (JSON-LD) Implementados
- ✅ **Organization**: Información de la empresa
- ✅ **WebSite**: Para Google Search Box
- ✅ **Store**: Información de tienda física/online
- ✅ **Product**: Schema dinámico en cada página de producto
- ✅ **FAQPage**: Para productos con preguntas frecuentes
- ✅ **CollectionPage**: En la página de catálogo

### 3. Sitemap Actualizado
- ✅ Fecha actualizada (2025-02-26)
- ✅ URLs de categorías agregadas
- ✅ Prioridades correctas

### 4. SEO Dinámico por Página
- ✅ ProductDetail: Meta tags únicos por producto
- ✅ Shop: Título dinámico según categoría
- ✅ Canonical URLs dinámicas

---

## 📋 PASOS PARA INDEXAR EN GOOGLE

### Paso 1: Crear cuenta en Google Search Console
1. Ve a: https://search.google.com/search-console
2. Inicia sesión con tu cuenta de Google
3. Click en "Agregar propiedad"

### Paso 2: Verificar el dominio    
**Opción A - Verificación DNS (Recomendada):**
1. Selecciona "Dominio" y escribe: `etronix-store.com`
2. Google te dará un registro TXT para agregar
3. Ve a Namecheap → Domain List → etronix-store.com → Advanced DNS
4. Agrega un registro TXT:
   - Host: `@`
   - Value: (el código que Google te dio)
   - TTL: Automatic
5. Espera 5-10 minutos y verifica en Google

**Opción B - Archivo HTML:**
1. Selecciona "Prefijo de URL": `https://etronix-store.com`
2. Descarga el archivo HTML de verificación
3. Súbelo a la carpeta `frontend/public/`
4. Haz deploy en Vercel
5. Verifica en Google

### Paso 3: Enviar el Sitemap
1. En Search Console, ve a "Sitemaps" (menú izquierdo)
2. Escribe: `sitemap.xml`
3. Click en "Enviar"
4. Debería mostrar "Correcto" después de unos minutos

### Paso 4: Solicitar Indexación
1. Ve a "Inspección de URL" (arriba)
2. Escribe la URL principal: `https://etronix-store.com/`
3. Click en "Solicitar indexación"
4. Repite para las URLs importantes:
   - `https://etronix-store.com/shop`
   - `https://etronix-store.com/about`
   - `https://etronix-store.com/faq`

---

## 🖼️ IMAGEN OG (Importante para redes sociales)

Necesitas crear una imagen para compartir en redes sociales:

1. **Dimensiones**: 1200 x 630 píxeles
2. **Formato**: JPG o PNG
3. **Nombre**: `og-image.jpg`
4. **Ubicación**: `frontend/public/og-image.jpg`

**Contenido sugerido:**
- Logo de Etronix grande
- Texto: "Accesorios para celulares"
- Fondo con colores de la marca (gradiente cyan/azul)

**Herramientas gratuitas para crearla:**
- Canva: https://www.canva.com
- Figma: https://www.figma.com

---

## 📊 Herramientas para Verificar SEO

### 1. Google Rich Results Test
- URL: https://search.google.com/test/rich-results
- Verifica que tus schemas estén correctos

### 2. Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- Verifica cómo se ve al compartir en Facebook

### 3. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Verifica cómo se ve al compartir en Twitter

### 4. PageSpeed Insights
- URL: https://pagespeed.web.dev/
- Verifica la velocidad y rendimiento

---

## ⏱️ Tiempos de Indexación

- **Verificación DNS**: 5-10 minutos
- **Proceso de sitemap**: 24-48 horas
- **Indexación inicial**: 3-7 días
- **Posicionamiento visible**: 2-4 semanas

**Nota**: Google indexa gradualmente. Primero aparecerá la página principal, luego las demás.

---

## 🔧 Bing Webmaster Tools (Opcional)

1. Ve a: https://www.bing.com/webmasters
2. Inicia sesión y puedes importar desde Google Search Console
3. Esto cubre Bing, Yahoo y DuckDuckGo

---

## 📱 Checklist Final

- [ ] Crear cuenta Google Search Console
- [ ] Verificar dominio (DNS TXT record)
- [ ] Enviar sitemap.xml
- [ ] Crear og-image.jpg (1200x630)
- [ ] Solicitar indexación de páginas principales
- [ ] Verificar en Rich Results Test
- [ ] Esperar 3-7 días para indexación inicial
- [ ] (Opcional) Registrar en Bing Webmaster Tools
