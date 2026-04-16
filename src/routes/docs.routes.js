const express = require("express");
const openApiSpec = require("../docs/openapi");
const env = require("../config/env");

const router = express.Router();

router.get("/", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${env.appName} API Docs</title>
        <style>
          body { font-family: Georgia, serif; margin: 40px; background: #f4f1e8; color: #283618; }
          main { max-width: 900px; margin: 0 auto; background: #fefae0; padding: 32px; border-radius: 18px; box-shadow: 0 10px 30px rgba(40, 54, 24, 0.08); }
          h1, h2 { margin-bottom: 8px; }
          code { background: #dde5b6; padding: 2px 6px; border-radius: 6px; }
          a { color: #606c38; }
          ul { line-height: 1.7; }
        </style>
      </head>
      <body>
        <main>
          <h1>${env.appName} API</h1>
          <p>Interactive backend for urban farming rentals, produce commerce, certifications, community, and live plant tracking.</p>
          <h2>Documentation Links</h2>
          <ul>
            <li><a href="/api/docs/openapi.json">OpenAPI JSON</a></li>
            <li><a href="/health">Health Check</a></li>
            <li><a href="/api/v1/metrics/benchmark">Benchmark Report</a></li>
          </ul>
          <h2>Core Areas</h2>
          <ul>
            <li><code>/api/v1/auth</code> for registration, login, and identity</li>
            <li><code>/api/v1/vendors</code> for vendor profiles and certifications</li>
            <li><code>/api/v1/produce</code> and <code>/api/v1/orders</code> for marketplace flows</li>
            <li><code>/api/v1/rentals</code> for garden space discovery and bookings</li>
            <li><code>/api/v1/plants</code> for plant tracking and SSE updates</li>
            <li><code>/api/v1/community</code> for forum posts</li>
            <li><code>/api/v1/admin</code> for approvals and moderation</li>
          </ul>
        </main>
      </body>
    </html>
  `);
});

router.get("/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

module.exports = router;
