import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SwaggerService {
  getSwaggerHtml(): string {
    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Authentication API - Swagger UI</title>
                    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
                </head>
                <body>
                    <div id="swagger-ui"></div>
                    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
                    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
                    <script>
                    window.onload = function () {
                        SwaggerUIBundle({
                        url: '/docs/swagger.yaml',
                        dom_id: '#swagger-ui',
                        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                        layout: 'StandaloneLayout',
                        });
                    };
                    </script>
                </body>
            </html>`;
  }

  getSwaggerYaml(): string {
    const yamlPath = join(process.cwd(), 'swagger-2.0.yaml');
    return readFileSync(yamlPath, 'utf8');
  }
}
