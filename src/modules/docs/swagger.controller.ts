import { Controller, Get, Header } from '@nestjs/common';

import { SwaggerService } from './swagger.service';

@Controller('docs')
export class SwaggerController {
  constructor(private readonly swaggerService: SwaggerService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getDocs(): string {
    return this.swaggerService.getSwaggerHtml();
  }

  @Get('swagger.yaml')
  @Header('Content-Type', 'application/yaml')
  getSwaggerYaml(): string {
    return this.swaggerService.getSwaggerYaml();
  }
}
