/**
 * API Documentation Routes
 * Serves OpenAPI spec and Swagger UI
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { openapiSpec } from '../lib/openapiSpec';

const app = new Hono<{ Bindings: Env }>();

// Serve OpenAPI specification as YAML
app.get('/openapi.yaml', (c) => {
  return c.text(openapiSpec, 200, {
    'Content-Type': 'application/x-yaml',
  });
});

// Serve OpenAPI specification as JSON
app.get('/openapi.json', (c) => {
  // For simplicity, point to the GitHub raw file or serve converted JSON
  // In production, you'd parse the YAML and convert to JSON
  return c.json({
    message: 'OpenAPI spec available in YAML format at /api/docs/openapi.yaml',
    spec_url: '/api/docs/openapi.yaml',
    swagger_ui: '/api/docs',
  });
});

// Serve Swagger UI HTML
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUMMBL API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        persistAuthorization: true,
      })
    }
  </script>
</body>
</html>`;
  
  return c.html(html);
});

export default app;
