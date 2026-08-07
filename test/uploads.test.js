const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { app, createUser, createDelivery } = require('./helpers/fixtures');

const PROJECT_ROOT = path.join(__dirname, '..');
const fakePdf = Buffer.from('%PDF-1.4 contenido de prueba');

describe('Uploads API', () => {
  describe('POST /api/users/:uid/documents', () => {
    it('sube un documento valido y lo asocia al usuario (guarda solo metadatos en la base)', async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user.id}/documents`)
        .field('documentType', 'id_card')
        .attach('document', fakePdf, { filename: 'dni.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload.documents).to.have.lengthOf(1);

      const document = res.body.payload.documents[0];
      expect(document).to.include({ originalName: 'dni.pdf', mimeType: 'application/pdf', documentType: 'id_card' });
      expect(document).to.have.property('storedName');
      expect(document).to.have.property('path');
      expect(document).to.have.property('size');
      expect(document).to.have.property('uploadedAt');

      const savedFilePath = path.join(PROJECT_ROOT, document.path);
      expect(fs.existsSync(savedFilePath)).to.be.true;
      fs.unlinkSync(savedFilePath);
    });

    it('responde 400 (VALIDATION_ERROR) si falta el archivo', async () => {
      const user = await createUser();

      const res = await request(app).post(`/api/users/${user.id}/documents`).field('documentType', 'id_card');

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });

    it('responde 400 (VALIDATION_ERROR) con un tipo de documento invalido', async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user.id}/documents`)
        .field('documentType', 'pasaporte')
        .attach('document', fakePdf, { filename: 'x.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
      expect(res.body.error.message).to.include('pasaporte');
    });

    it('responde 400 (VALIDATION_ERROR) con un tipo de archivo no permitido', async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user.id}/documents`)
        .field('documentType', 'id_card')
        .attach('document', Buffer.from('contenido'), { filename: 'virus.exe', contentType: 'application/x-msdownload' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });

    it('responde 404 (NOT_FOUND) si el usuario no existe', async () => {
      const res = await request(app)
        .post('/api/users/64b000000000000000000001/documents')
        .field('documentType', 'id_card')
        .attach('document', fakePdf, { filename: 'x.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });
  });

  describe('POST /api/deliveries/:did/voucher', () => {
    it('sube un comprobante valido y lo asocia a la entrega', async () => {
      const delivery = await createDelivery();

      const res = await request(app)
        .post(`/api/deliveries/${delivery._id}/voucher`)
        .attach('voucher', fakePdf, { filename: 'comprobante.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(201);
      expect(res.body.payload.vouchers).to.have.lengthOf(1);
      expect(res.body.payload.vouchers[0]).to.include({ documentType: 'delivery_proof' });

      const savedFilePath = path.join(PROJECT_ROOT, res.body.payload.vouchers[0].path);
      expect(fs.existsSync(savedFilePath)).to.be.true;
      fs.unlinkSync(savedFilePath);
    });

    it('responde 400 (VALIDATION_ERROR) si falta el archivo', async () => {
      const delivery = await createDelivery();

      const res = await request(app).post(`/api/deliveries/${delivery._id}/voucher`);

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });

    it('responde 404 (NOT_FOUND) si la entrega no existe', async () => {
      const res = await request(app)
        .post('/api/deliveries/64b000000000000000000001/voucher')
        .attach('voucher', fakePdf, { filename: 'comprobante.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });
  });
});
