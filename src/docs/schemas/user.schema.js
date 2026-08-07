module.exports = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1c8' },
      firstName: { type: 'string', example: 'Fernando' },
      lastName: { type: 'string', example: 'Palto' },
      email: { type: 'string', format: 'email', example: 'fernando@shipnow.com' },
      role: { type: 'string', enum: ['admin', 'user', 'delivery'], example: 'user' },
      documents: { type: 'array', items: { $ref: '#/components/schemas/FileMetadata' } },
    },
  },
  RegisterUserInput: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password'],
    properties: {
      firstName: { type: 'string', example: 'Fernando' },
      lastName: { type: 'string', example: 'Palto' },
      email: { type: 'string', format: 'email', example: 'fernando@shipnow.com' },
      password: { type: 'string', format: 'password', example: '123456' },
      role: {
        type: 'string',
        enum: ['admin', 'user', 'delivery'],
        description: 'Opcional. Si no se envia, se asigna "user" por defecto.',
        example: 'user',
      },
    },
  },
  LoginUserInput: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'fernando@shipnow.com' },
      password: { type: 'string', format: 'password', example: '123456' },
    },
  },
  UpdateUserRoleInput: {
    type: 'object',
    required: ['role', 'requesterRole'],
    properties: {
      role: {
        type: 'string',
        enum: ['admin', 'user', 'delivery'],
        description: 'Nuevo rol a asignar.',
        example: 'delivery',
      },
      requesterRole: {
        type: 'string',
        enum: ['admin', 'user', 'delivery'],
        description: 'Rol de quien realiza el cambio. Debe ser "admin".',
        example: 'admin',
      },
    },
  },
};
