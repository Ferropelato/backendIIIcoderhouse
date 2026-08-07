const { expect } = require('chai');
const request = require('supertest');
const { app } = require('./helpers/fixtures');

describe('Logger API', () => {
  describe('GET /api/logs/test', () => {
    it('dispara un log de cada nivel y devuelve la lista de niveles generados', async () => {
      const res = await request(app).get('/api/logs/test');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload.levels).to.have.members([
        'debug', 'http', 'info', 'warning', 'error', 'fatal',
      ]);
    });
  });
});
