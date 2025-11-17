import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let connectDB, Product;
try {
  const dbFile = path.join(__dirname, '..', 'src', 'db.js');
  const prodFile = path.join(__dirname, '..', 'src', 'models', 'Product.js');
  const dbMod = await import(pathToFileURL(dbFile).href);
  connectDB = dbMod.connectDB;
  const prodMod = await import(pathToFileURL(prodFile).href);
  Product = prodMod.default;
} catch (err) {
  console.error('Error importing backend modules:', err.message);
  process.exit(1);
}

async function buildSitemap(entries) {
  const urls = entries.map(e => {
    const lastmod = e.lastmod ? new Date(e.lastmod).toISOString() : '';
    const priority = e.priority || '0.7';
    const changefreq = e.changefreq || 'weekly';
    
    return `  <url>
    <loc>${e.loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ Missing MONGODB_URI environment variable');
    process.exit(1);
  }

  try {
    await connectDB(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  }

  let products = [];
  try {
    products = await Product.find({}, '_id title updatedAt createdAt').lean();
    console.log(`📦 Found ${products.length} products`);
  } catch (err) {
    console.error('❌ Error fetching products:', err.message);
    process.exit(1);
  }

  // ✅ USA VARIABLE DE ENTORNO (no localhost)
  const baseUrl = (process.env.FRONTEND_URL || 'https://etronix-store.com').replace(/\/$/, '');
  const entries = [];

  // Homepage (prioridad máxima)
  entries.push({ 
    loc: `${baseUrl}/`, 
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  });

  // Shop
  entries.push({ 
    loc: `${baseUrl}/shop`, 
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '0.9'
  });

  // Páginas estáticas
  const staticPages = [
    { path: '/about', priority: '0.6' },
    { path: '/faq', priority: '0.7' }
  ];

  staticPages.forEach(page => {
    entries.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: page.priority
    });
  });

  // Productos individuales
  for (const p of products) {
    entries.push({ 
      loc: `${baseUrl}/products/${p._id}`, 
      lastmod: p.updatedAt || p.createdAt,
      changefreq: 'weekly',
      priority: '0.8'
    });
  }

  const sitemapXml = await buildSitemap(entries);

  const frontendSitemapPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'sitemap.xml');
  
  try {
    await fs.mkdir(path.dirname(frontendSitemapPath), { recursive: true });
    await fs.writeFile(frontendSitemapPath, sitemapXml, 'utf8');
    console.log(`✅ Sitemap written to ${frontendSitemapPath}`);
    console.log(`📍 Base URL: ${baseUrl}`);
    console.log(`📊 Total entries: ${entries.length}`);
  } catch (err) {
    console.error('❌ Failed to write sitemap:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});