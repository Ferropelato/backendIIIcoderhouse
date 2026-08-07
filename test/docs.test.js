const { expect } = require('chai');
const request = require('supertest');
const { app } = require('./helpers/fixtures');

describe('Swagger docs', () => {
  it('GET /api/docs sirve la interfaz de Swagger UI', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('text/html');
    expect(res.text).to.include('swagger-ui');
  });
});
