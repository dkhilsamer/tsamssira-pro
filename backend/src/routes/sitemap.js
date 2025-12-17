const express = require('express');
const router = express.Router();

// Simple sitemap placeholder – returns a basic XML sitemap
router.get('/sitemap.xml', (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.SITE_URL || 'http://localhost:3000'}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

module.exports = router;
