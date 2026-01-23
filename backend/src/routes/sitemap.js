const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// Dynamic Sitemap Generation
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Use SITE_URL (if provided) or FRONTEND_URL, fallback to localhost
    const baseUrl = (process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Fetch all public properties
    const properties = await Property.getAll({ publicOnly: true });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add Property Pages
    properties.forEach(prop => {
      const lastMod = prop.created_at ? new Date(prop.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${baseUrl}/property/${prop.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
