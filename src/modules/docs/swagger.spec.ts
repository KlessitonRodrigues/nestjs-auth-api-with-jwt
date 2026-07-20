import axios from 'axios';

import dotenv from '../../constants/dotenv';

describe('Swagger API', () => {
  const baseURL = dotenv.BASE_URL;
  if (!baseURL) throw new Error('missing BASE_URL');

  const apiClient = axios.create({ baseURL });

  it('should return swagger docs html', async () => {
    const response = await apiClient.get('/docs');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.data).toContain('<!DOCTYPE html>');
    expect(response.data).toContain('Authentication API - Swagger UI');
    expect(response.data).toContain("url: '/docs/swagger.yaml'");
  });

  it('should return swagger yaml file', async () => {
    const response = await apiClient.get('/docs/swagger.yaml');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/yaml');
    expect(response.data).toContain("swagger: '2.0'");
    expect(response.data).toContain('title: Authentication API');
  });
});
