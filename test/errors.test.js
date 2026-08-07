const { expect } = require('chai');
const request = require('supertest');
const { app } = require('./helpers/fixtures');

describe('Manejo global de errores', () => {
  it('responde 404 (NOT_FOUND) con el formato uniforme ante una ruta inexistente', async () => {
    const res = await request(app).get('/api/esta-ruta-no-existe');

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body.error).to.include({ code: 'NOT_FOUND' });
    expect(res.body.error.message).to.be.a('string');
  });

  it('responde 400 (VALIDATION_ERROR) ante un id con formato invalido', async () => {
    const res = await request(app).get('/api/products/id-no-valido');

    expect(res.status).to.equal(400);
    expect(res.body.status).to.equal('error');
    expect(res.body.error.code).to.equal('VALIDATION_ERROR');
  });
});
