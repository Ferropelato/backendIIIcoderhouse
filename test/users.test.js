const { expect } = require('chai');
const request = require('supertest');
const { app, createUser, uniqueEmail } = require('./helpers/fixtures');

describe('Users API', () => {
  describe('POST /api/users/register', () => {
    it('crea un usuario valido, con rol por defecto "user" y sin exponer el password', async () => {
      const res = await request(app).post('/api/users/register').send({
        firstName: 'Ana',
        lastName: 'Gomez',
        email: uniqueEmail('ana'),
        password: '123456',
      });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.include.all.keys('id', 'firstName', 'lastName', 'email', 'role');
      expect(res.body.payload).to.not.have.property('password');
      expect(res.body.payload.role).to.equal('user');
    });

    it('responde 409 (CONFLICT) si el email ya esta registrado', async () => {
      const email = uniqueEmail('dup');
      const userData = { firstName: 'Ana', lastName: 'Gomez', email, password: '123456' };

      await request(app).post('/api/users/register').send(userData);
      const res = await request(app).post('/api/users/register').send(userData);

      expect(res.status).to.equal(409);
      expect(res.body.status).to.equal('error');
      expect(res.body.error).to.include({ code: 'CONFLICT' });
      expect(res.body.error.message).to.be.a('string');
    });

    it('responde 400 (VALIDATION_ERROR) con un rol invalido', async () => {
      const res = await request(app).post('/api/users/register').send({
        firstName: 'Ana',
        lastName: 'Gomez',
        email: uniqueEmail('rol'),
        password: '123456',
        role: 'superadmin',
      });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('POST /api/users/login', () => {
    it('permite iniciar sesion con credenciales correctas', async () => {
      const email = uniqueEmail('luz');
      await request(app).post('/api/users/register').send({
        firstName: 'Luz', lastName: 'Diaz', email, password: 'secreta1',
      });

      const res = await request(app).post('/api/users/login').send({ email, password: 'secreta1' });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload.email).to.equal(email);
    });

    it('responde 401 (UNAUTHORIZED) con credenciales invalidas', async () => {
      const res = await request(app).post('/api/users/login').send({ email: 'no@existe.com', password: 'x' });

      expect(res.status).to.equal(401);
      expect(res.body.error.code).to.equal('UNAUTHORIZED');
    });
  });

  describe('GET /api/users', () => {
    it('devuelve un array de usuarios sin exponer el password', async () => {
      await createUser();
      await createUser();

      const res = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').with.lengthOf(2);
      res.body.payload.forEach((user) => {
        expect(user).to.not.have.property('password');
      });
    });
  });

  describe('GET /api/users/:uid', () => {
    it('devuelve el usuario solicitado', async () => {
      const user = await createUser();

      const res = await request(app).get(`/api/users/${user.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload.email).to.equal(user.email);
    });

    it('responde 404 (NOT_FOUND) si el usuario no existe', async () => {
      const res = await request(app).get('/api/users/64b000000000000000000001');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });
  });

  describe('PUT /api/users/:uid/role', () => {
    it('responde 403 (FORBIDDEN) si quien pide el cambio no es admin', async () => {
      const user = await createUser();

      const res = await request(app)
        .put(`/api/users/${user.id}/role`)
        .send({ role: 'admin', requesterRole: 'user' });

      expect(res.status).to.equal(403);
      expect(res.body.error.code).to.equal('FORBIDDEN');
    });

    it('actualiza el rol cuando quien lo pide es admin', async () => {
      const user = await createUser();

      const res = await request(app)
        .put(`/api/users/${user.id}/role`)
        .send({ role: 'delivery', requesterRole: 'admin' });

      expect(res.status).to.equal(200);
      expect(res.body.payload.role).to.equal('delivery');
    });
  });
});
