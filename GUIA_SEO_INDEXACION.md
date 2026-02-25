# Guía de Indexación y SEO para Etronix Store

Esta guía te ayudará a que tu tienda (https://etronix-store.vercel.app) aparezca en Google, Bing, y sea más visible para inteligencias artificiales (como ChatGPT, Gemini, Perplexity).

## 1. Google Search Console (El paso más importante)

Esta es la herramienta oficial de Google para gestionar tu presencia en su buscador.

1.  Ve a [Google Search Console](https://search.google.com/search-console).
2.  Inicia sesión con tu cuenta de Google.
3.  Haz clic en **"Añadir propiedad"**.
4.  Elige la opción **"Prefijo de la URL"** (es más fácil de verificar en Vercel si no tienes dominio propio).
5.  Ingresa tu URL exacta: `https://etronix-store.vercel.app`.
6.  **Verificación**:
    *   Elige el método **"Etiqueta HTML"**.
    *   Copia la etiqueta meta que te dan (ej. `<meta name="google-site-verification" content="..." />`).
    *   Ve a tu código, archivo `frontend/index.html` y pega esa línea dentro del `<head>`, antes de cerrar `</head>`.
    *   Haz un nuevo deploy en Vercel.
    *   Vuelve a Search Console y dale a **"Verificar"**.

## 2. Enviar el Sitemap

El Sitemap es el mapa de tu sitio que le dice a Google qué páginas existen.

1.  **Asegúrate de que tu sitemap esté actualizado con la URL de producción**:
    *   Antes de hacer el build para producción, asegúrate de generar el sitemap usando la URL correcta.
    *   Puedes ejecutar en tu local:
        ```bash
        # En la carpeta backend
        $env:FRONTEND_URL="https://etronix-store.vercel.app"
        npm run generate:sitemap
        ```
    *   Esto actualizará el archivo `frontend/public/sitemap.xml`.
    *   Sube estos cambios (git push) y deja que Vercel despliegue.
2.  Verifica que puedes ver el sitemap entrando a: `https://etronix-store.vercel.app/sitemap.xml`.
3.  En **Google Search Console**:
    *   Ve a la sección **"Sitemaps"** en el menú lateral.
    *   Escribe `sitemap.xml` y dale a **"Enviar"**.
    *   Google lo procesará y empezará a descubrir tus páginas (puede tardar desde unas horas hasta días).

## 3. Bing Webmaster Tools

No olvides a Bing, ya que también alimenta a Yahoo y a DuckDuckGo, y a veces a ChatGPT.

1.  Ve a [Bing Webmaster Tools](https://www.bing.com/webmasters).
2.  Puedes iniciar sesión e **importar tus sitios desde Google Search Console** (es lo más rápido, no tienes que verificar nada de nuevo).
3.  Si no, regístrate y sigue pasos similares a los de Google.

## 4. Robots.txt

Ya configuramos un archivo `robots.txt` en tu proyecto. Este archivo le da permiso a los buscadores para entrar.
Verifica que en `https://etronix-store.vercel.app/robots.txt` veas algo como:

```txt
User-agent: *
Allow: /
Sitemap: https://etronix-store.vercel.app/sitemap.xml
```

Si ves `Disallow: /`, significa que estás bloqueando a los buscadores. ¡Asegúrate de que diga `Allow: /`!

## 5. Optimización para IAs (ChatGPT, Gemini, Claude)

Las IAs leen el contenido de forma semántica. Ya hemos mejorado esto en tu código:

*   **Metaetiquetas descriptivas**: Ya agregamos títulos y descripciones claros en `Home`, `About`, `FAQ` y `ProductDetail`.
*   **Datos Estructurados (Schema.org)**: Tu sitio ya tiene código JSON-LD que le dice a las máquinas "Esto es un Producto", "Esto es una Pregunta Frecuente", "Esto es una Organización". Esto ayuda muchísimo a que las IAs entiendan tu contenido.

## 6. Consejos Adicionales

*   **Redes Sociales**: Crea perfiles en Instagram, Facebook o TikTok para "Etronix Store" y pon el enlace a tu web en la biografía. Los buscadores siguen esos enlaces.
*   **Rendimiento**: Google penaliza sitios lentos. Tu sitio está hecho con Vite y React, lo cual es muy rápido, pero asegúrate de que las imágenes no sean gigantescas (ya tienes un componente `OptimizedImage`, ¡úsalo!).
*   **Paciencia**: Google puede tardar entre **4 días y 4 semanas** en indexar un sitio nuevo. No te desesperes si no apareces mañana.

## Resumen de pasos inmediatos:

1.  [ ] Generar el sitemap con la URL de Vercel (`https://etronix-store.vercel.app`).
2.  [ ] Hacer deploy de ese cambio.
3.  [ ] Dar de alta la propiedad en Google Search Console.
4.  [ ] Enviar el sitemap en Google Search Console.
