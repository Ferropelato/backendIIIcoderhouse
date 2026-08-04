const { errorResponse, successResponse } = require('../responses');

const userArraySchema = { type: 'array', items: { $ref: '#/components/schemas/User' } };
const userSchema = { $ref: '#/components/schemas/User' };

module.exports = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Listar usuarios',
      description: 'Devuelve todos los usuarios registrados (sin exponer la contraseña).',
      responses: {
        200: successResponse('Lista de usuarios', userArraySchema),
        500: errorResponse('Error inesperado del servidor'),
      },
    },
  },
  '/users/{uid}': {
    get: {
      tags: ['Users'],
      summary: 'Obtener un usuario por id',
      parameters: [
        { name: 'uid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del usuario' },
      ],
      responses: {
        200: successResponse('Usuario encontrado', userSchema),
        400: errorResponse('El id no tiene un formato valido'),
        404: errorResponse('No existe un usuario con ese id'),
      },
    },
  },
  '/users/register': {
    post: {
      tags: ['Users'],
      summary: 'Registrar un nuevo usuario',
      description: 'Crea un usuario. La contraseña se guarda hasheada. El rol es opcional (por defecto "user").',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterUserInput' } } },
      },
      responses: {
        201: successResponse('Usuario creado', userSchema),
        400: errorResponse('Rol invalido'),
        409: errorResponse('Ya existe un usuario registrado con ese email'),
      },
    },
  },
  '/users/login': {
    post: {
      tags: ['Users'],
      summary: 'Iniciar sesion',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginUserInput' } } },
      },
      responses: {
        200: successResponse('Login exitoso', userSchema),
        401: errorResponse('Email o password incorrectos'),
      },
    },
  },
  '/users/{uid}/role': {
    put: {
      tags: ['Users'],
      summary: 'Cambiar el rol de un usuario',
      description: 'Solo un usuario con rol "admin" (enviado en requesterRole) puede cambiar roles.',
      parameters: [
        { name: 'uid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del usuario a modificar' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRoleInput' } } },
      },
      responses: {
        200: successResponse('Rol actualizado', userSchema),
        400: errorResponse('Rol invalido'),
        403: errorResponse('El requesterRole no tiene permisos de administrador'),
        404: errorResponse('No existe un usuario con ese id'),
      },
    },
  },
};
