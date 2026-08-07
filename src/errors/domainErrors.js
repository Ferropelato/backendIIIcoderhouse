const AppError = require('./AppError');
const ERROR_DICTIONARY = require('./errorDictionary');

class ValidationError extends AppError {
  constructor(message, details) {
    super({ ...ERROR_DICTIONARY.VALIDATION_ERROR, message, details });
  }
}

class NotFoundError extends AppError {
  constructor(message, details) {
    super({ ...ERROR_DICTIONARY.NOT_FOUND, message, details });
  }
}

class ConflictError extends AppError {
  constructor(message, details) {
    super({ ...ERROR_DICTIONARY.CONFLICT, message, details });
  }
}

class UnauthorizedError extends AppError {
  constructor(message, details) {
    super({ ...ERROR_DICTIONARY.UNAUTHORIZED, message, details });
  }
}

class ForbiddenError extends AppError {
  constructor(message, details) {
    super({ ...ERROR_DICTIONARY.FORBIDDEN, message, details });
  }
}

class InternalServerError extends AppError {
  constructor(message, details) {
    super({ ...ERROR_DICTIONARY.INTERNAL_SERVER_ERROR, message, details });
  }
}

// --- Errores especificos del dominio de ShipNow ---

class UserNotFoundError extends NotFoundError {
  constructor(id) {
    super(`Usuario con id ${id} no encontrado`, { id });
  }
}

class ProductNotFoundError extends NotFoundError {
  constructor(id) {
    super(`Producto con id ${id} no encontrado`, { id });
  }
}

class OrderNotFoundError extends NotFoundError {
  constructor(id) {
    super(`Pedido con id ${id} no encontrado`, { id });
  }
}

class DeliveryNotFoundError extends NotFoundError {
  constructor(id) {
    super(`Entrega con id ${id} no encontrada`, { id });
  }
}

class RouteNotFoundError extends NotFoundError {
  constructor(method, path) {
    super(`Ruta ${method} ${path} no encontrada`, { method, path });
  }
}

class DuplicateResourceError extends ConflictError {
  constructor(message, details) {
    super(message, details);
  }
}

class InvalidRoleError extends ValidationError {
  constructor(role) {
    super(`Rol invalido: ${role}`, { role });
  }
}

class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Credenciales invalidas');
  }
}

class ForbiddenRoleActionError extends ForbiddenError {
  constructor(message = 'No tenes permisos para realizar esta accion') {
    super(message);
  }
}

class InvalidMockQuantityError extends ValidationError {
  constructor(field, value, max) {
    super(
      `El parametro "${field}" debe ser un numero entero entre 0 y ${max} (recibido: ${value})`,
      { field, value }
    );
  }
}

class MockRelationError extends ValidationError {
  constructor(message) {
    super(message);
  }
}

class MockGenerationError extends InternalServerError {
  constructor(originalError) {
    super('Ocurrio un error al insertar los datos de prueba en la base de datos', {
      reason: originalError.message,
    });
  }
}

class InvalidStatusError extends ValidationError {
  constructor(entity, status, allowedValues) {
    super(`Estado invalido para ${entity}: "${status}". Valores permitidos: ${allowedValues.join(', ')}`, {
      entity,
      status,
      allowedValues,
    });
  }
}

class InvalidDeliveryAgentError extends ValidationError {
  constructor(userId) {
    super(`El usuario ${userId} no existe o no tiene rol de repartidor`, { userId });
  }
}

// --- Errores especificos de carga de archivos ---

class FileRequiredError extends ValidationError {
  constructor(fieldName) {
    super(`Debes adjuntar un archivo en el campo "${fieldName}"`, { fieldName });
  }
}

class InvalidFileTypeError extends ValidationError {
  constructor(mimeType, allowedTypes) {
    super(`Tipo de archivo no permitido: "${mimeType}". Tipos permitidos: ${allowedTypes.join(', ')}`, {
      mimeType,
      allowedTypes,
    });
  }
}

class FileTooLargeError extends ValidationError {
  constructor(maxSizeMb) {
    super(`El archivo supera el tamaño maximo permitido (${maxSizeMb}MB)`, { maxSizeMb });
  }
}

class UnexpectedFileFieldError extends ValidationError {
  constructor(receivedField) {
    super(`El campo del archivo recibido ("${receivedField}") no coincide con el esperado`, { receivedField });
  }
}

class InvalidDocumentTypeError extends ValidationError {
  constructor(documentType, allowedValues) {
    super(`Tipo de documento invalido: "${documentType}". Valores permitidos: ${allowedValues.join(', ')}`, {
      documentType,
      allowedValues,
    });
  }
}

class FileUploadError extends InternalServerError {
  constructor(originalError) {
    super('Ocurrio un error al guardar el archivo', { reason: originalError.message });
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  UserNotFoundError,
  ProductNotFoundError,
  OrderNotFoundError,
  DeliveryNotFoundError,
  RouteNotFoundError,
  DuplicateResourceError,
  InvalidRoleError,
  InvalidCredentialsError,
  ForbiddenRoleActionError,
  InvalidMockQuantityError,
  MockRelationError,
  MockGenerationError,
  InvalidStatusError,
  InvalidDeliveryAgentError,
  FileRequiredError,
  InvalidFileTypeError,
  FileTooLargeError,
  UnexpectedFileFieldError,
  InvalidDocumentTypeError,
  FileUploadError,
};
