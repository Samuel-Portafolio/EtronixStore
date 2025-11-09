import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to import DB connector and Product model
let connectDB;
let Product;
try {
  // On Windows import() requires file:// URLs for absolute paths
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
    return `  <url>\n    <loc>${e.loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI environment variable. Define it in .env before running.');
    process.exit(1);
  }

  try {
    await connectDB(mongoUri);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }

  let products = [];
  try {
    products = await Product.find({}, '_id title updatedAt createdAt').lean();
  } catch (err) {
    console.error('Error fetching products:', err.message);
    process.exit(1);
  }

  const baseUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://etronix-store.com';
  const entries = [];

  // Add homepage and shop
  entries.push({ loc: `${baseUrl.replace(/\/$/, '')}/`, lastmod: new Date().toISOString() });
  entries.push({ loc: `${baseUrl.replace(/\/$/, '')}/shop`, lastmod: new Date().toISOString() });

  for (const p of products) {
    entries.push({ loc: `${baseUrl.replace(/\/$/, '')}/products/${p._id}`, lastmod: p.updatedAt || p.createdAt });
  }

  const sitemapXml = await buildSitemap(entries);

  // Write to frontend public folder if exists, else write to backend/public
  const frontendSitemapPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'sitemap.xml');
  const backendPublicPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  try {
    await fs.mkdir(path.dirname(frontendSitemapPath), { recursive: true });
    await fs.writeFile(frontendSitemapPath, sitemapXml, 'utf8');
    console.log(`Sitemap written to ${frontendSitemapPath}`);
  } catch (err) {
    console.warn('Could not write to frontend public folder, attempting backend/public instead.');
    try {
      await fs.mkdir(path.dirname(backendPublicPath), { recursive: true });
      await fs.writeFile(backendPublicPath, sitemapXml, 'utf8');
      console.log(`Sitemap written to ${backendPublicPath}`);
    } catch (err2) {
      console.error('Failed to write sitemap:', err2.message);
      process.exit(1);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
