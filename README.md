# ShipNow API - Entrega 1, 2, 3, 4, 5, 6 y 7

API de ShipNow refactorizada en arquitectura por capas (Controller -> Service -> Repository), con configuracion de entorno validada, constantes centralizadas para roles y estados, modulo de mocking, manejo centralizado de errores, logging profesional con Winston, documentacion interactiva con Swagger/OpenAPI, una suite de tests funcionales con Mocha/Chai/Supertest y carga de archivos (documentos y comprobantes) con Multer.

## Estructura del proyecto

```
src/
  config/         # Configuracion de entorno (dotenv + validacion)
  constants/      # Roles y estados del dominio (Object.freeze)
  docs/           # Configuracion y contenido de Swagger/OpenAPI (separado de las rutas)
  errors/         # Errores personalizados del dominio + diccionario de errores
  logger/         # Configuracion centralizada de Winston (niveles, formato, transports)
  middlewares/    # Middleware global de manejo de errores (integrado con el logger y Multer)
  models/         # Esquemas de Mongoose (sin logica de negocio)
  repositories/    # Unico lugar que conoce Mongoose/MongoDB
  services/       # Logica de negocio (aca se lanzan los errores de dominio)
  controllers/    # Manejo de req/res, puerta de entrada HTTP (sin try/catch propios)
  routes/         # Conectan cada path con su Controller
  uploads/        # Configuracion centralizada de Multer (separada de los routers)
  utils/          # catchAsync, removeFileIfExists, etc.
  app.js          # Configuracion de Express (sin app.listen, para poder testearla)
  server.js       # Punto de entrada: conecta Mongo y recien ahi levanta el puerto
logs/             # Archivos de log generados en runtime (ignorados por git, salvo .gitkeep)
uploads/          # Archivos subidos por los usuarios (ignorados por git, salvo .gitkeep)
test/             # Suite de tests funcionales (Mocha + Chai + Supertest)
```

## Instrucciones para correr el proyecto localmente

1. Cloná el repositorio e instalá las dependencias:
   ```
   npm install
   ```
2. Copiá `.env.example` a `.env` y completá los valores reales:
   ```
   cp .env.example .env
   ```
   Variables requeridas:
   - `PORT`: puerto donde corre el servidor.
   - `MONGODB_URI`: cadena de conexion a MongoDB.
   - `NODE_ENV`: entorno de ejecucion (`development` / `production`).

   Si falta alguna de estas variables, la aplicacion no arranca y muestra un error descriptivo indicando cual falta.

3. Corré el servidor:
   ```
   npm start
   ```
   o en modo desarrollo (con recarga automática):
   ```
   npm run dev
   ```

## Endpoints principales

> La documentación interactiva y siempre actualizada está en Swagger: ver la sección [Documentación con Swagger](#documentación-con-swagger-openapi) más abajo.

- `GET /api/products` (?available=true filtra solo productos con stock disponible)
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`
- `GET /api/users`
- `GET /api/users/:uid`
- `POST /api/users/register`
- `POST /api/users/login`
- `PUT /api/users/:uid/role`
- `GET /api/orders`
- `GET /api/orders/:oid`
- `POST /api/orders`
- `PATCH /api/orders/:oid/status`
- `GET /api/deliveries`
- `GET /api/deliveries/:did`
- `POST /api/deliveries`
- `PATCH /api/deliveries/:did/status`
- `POST /api/users/:uid/documents` (multipart/form-data)
- `POST /api/deliveries/:did/voucher` (multipart/form-data)

Los pedidos (`orders`) y las entregas (`deliveries`) se agregaron como endpoints reales en esta entrega: hasta el módulo anterior, `Order` y `Delivery` solo se usaban internamente para el módulo de mocks. Un pedido requiere un `user` ya existente; una entrega requiere un `order` existente y un `deliveryAgent` que sea un usuario con rol `delivery`. Los dos últimos endpoints (carga de archivos) se explican en detalle en la sección [Carga de archivos](#carga-de-archivos-documentos-y-comprobantes-multer) más abajo.

## Módulo de mocking (`/api/mocks`)

Genera datos simulados de usuarios, repartidores, pedidos y entregas respetando la arquitectura por capas (`mock.routes` -> `mock.controller` -> `mock.service` -> repositories). Los roles, estados y prioridades siempre se toman de `src/constants/index.js`, nunca como strings sueltos.

### Endpoints que devuelven datos simulados (no se guardan en la base)

- `GET /api/mocks/users?count=5` — usuarios falsos con rol `user`.
- `GET /api/mocks/delivery-agents?count=3` — repartidores falsos con rol `delivery`.
- `GET /api/mocks/orders?count=5&users=3` — genera `users` usuarios falsos internamente y `count` pedidos asociados a ellos, con `status` y `priority` válidos.
- `GET /api/mocks/deliveries?count=3&orders=3&agents=2` — genera pedidos y repartidores falsos internamente, y `count` entregas asociadas correctamente a un pedido y a un repartidor.
- `GET /api/mocks/preview?users=5&deliveryAgents=3&orders=5&deliveries=5` — devuelve las 4 entidades juntas, ya relacionadas entre sí (mismo lote), ideal para ver el modelo completo de un saque.

Todos los parámetros son opcionales (tienen valores por defecto) y se validan: deben ser enteros `>= 0` y no superan un máximo de 100 por entidad. Si se pide generar pedidos sin usuarios, o entregas sin pedidos/repartidores, el endpoint responde `400` con un mensaje explicando la relación faltante.

### Endpoint que inserta datos de prueba en MongoDB

- `POST /api/mocks/generate`
  ```json
  {
    "users": 10,
    "deliveryAgents": 5,
    "orders": 10,
    "deliveries": 10
  }
  ```
  Inserta usuarios (con password hasheada, igual que en un registro real), repartidores, pedidos (ligados a los usuarios recién creados) y entregas (ligadas a esos pedidos y repartidores) directamente en la base configurada por `MONGODB_URI`. Devuelve un resumen con la cantidad insertada de cada entidad. Es una carga controlada: mismos límites y validaciones que los endpoints de preview.

### Cómo probarlo rápido

```
curl "http://localhost:8080/api/mocks/preview?users=3&deliveryAgents=2&orders=3&deliveries=2"
curl -X POST http://localhost:8080/api/mocks/generate -H "Content-Type: application/json" -d "{\"users\":5,\"deliveryAgents\":2,\"orders\":5,\"deliveries\":4}"
```

## Por qué separar la lógica entre Service y Repository

El **Repository** es el único módulo que conoce Mongoose: se limita a construir queries, aplicar filtros/proyecciones por defecto (por ejemplo, excluir el password en `UserRepository` o excluir campos internos como `__v`) y persistir datos. No toma decisiones de negocio.

El **Service** concentra las reglas de negocio: decidir el `status` de un producto según su stock, evitar códigos de producto duplicados, hashear contraseñas, validar roles antes de aplicarlos, o verificar permisos antes de modificar el rol de un usuario. Esta separación permite:

- Cambiar el motor de base de datos (o migrar de Mongoose a otro ODM) sin tocar la lógica de negocio.
- Testear las reglas de negocio de forma aislada, sin depender de una base de datos real.
- Mantener a los Controllers simples: solo traducen HTTP a llamadas de Service y devuelven la respuesta.

`MockService` sigue el mismo principio: arma los objetos falsos y decide las relaciones entre entidades (a qué usuario pertenece un pedido, a qué pedido y repartidor pertenece una entrega), pero delega toda la escritura en MongoDB a `UserRepository`, `OrderRepository` y `DeliveryRepository`. Así, generar datos de prueba no abre una segunda puerta de acceso a la base por fuera de los Repositories ya existentes.

## Manejo centralizado de errores

Ningún controller ni ninguna ruta arma respuestas de error a mano. El flujo es siempre el mismo:

1. **Los Services detectan el problema** (usuario inexistente, código de producto duplicado, cantidad de mocks inválida, etc.) y lanzan un **error de dominio** (`src/errors/domainErrors.js`), que extiende la clase base `AppError` (`src/errors/AppError.js`). Cada error ya trae su `code` y su `statusCode` HTTP, tomados del **diccionario de errores** (`src/errors/errorDictionary.js`).
2. **Los Controllers** están envueltos con `catchAsync` (`src/utils/catchAsync.js`), que captura cualquier error —sync o async— y lo reenvía con `next(error)`. Ningún controller tiene `try/catch` propio.
3. **El middleware global** (`src/middlewares/errorHandler.middleware.js`), registrado al final de `app.js`, es el único lugar que arma la respuesta HTTP final:
   - Si el error es un `AppError` (o una subclase), responde con su `statusCode` y su `code`.
   - Si es un error de validación/cast de Mongoose (por ejemplo, un `id` con formato inválido), responde `400` con `code: "VALIDATION_ERROR"`.
   - Cualquier otro error no esperado responde `500` con `code: "INTERNAL_SERVER_ERROR"`, sin exponer detalles internos.
4. Las rutas que no existen también pasan por el middleware global: se lanza un `RouteNotFoundError` (404) en vez de responder directamente.

### Estructura de respuesta de error

Toda respuesta de error tiene siempre esta forma:

```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Producto con id 64f... no encontrado",
    "details": { "id": "64f..." }
  }
}
```

`details` es opcional (solo aparece si el error lo define). Los `code` disponibles son: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `CONFLICT` (409), `UNAUTHORIZED` (401), `FORBIDDEN` (403) e `INTERNAL_SERVER_ERROR` (500).

### Errores de dominio implementados

- `UserNotFoundError`, `ProductNotFoundError`, `OrderNotFoundError`, `RouteNotFoundError` → 404
- `DuplicateResourceError` (email o código de producto repetido) → 409
- `InvalidRoleError` (rol fuera de `ROLES`) → 400
- `InvalidCredentialsError` (login fallido) → 401
- `ForbiddenRoleActionError` (un usuario sin permisos intenta cambiar roles) → 403
- `InvalidMockQuantityError` (cantidad de mocks negativa, no numérica o mayor al máximo permitido) → 400
- `MockRelationError` (por ejemplo, pedir pedidos sin usuarios, o entregas sin pedidos/repartidores) → 400
- `MockGenerationError` (falla real al insertar los datos de prueba en MongoDB) → 500

### Cómo probar los casos inválidos

```
# Ruta inexistente -> 404
curl http://localhost:8080/api/no-existe

# Producto no encontrado -> 404
curl http://localhost:8080/api/products/64b000000000000000000001

# Id con formato invalido -> 400
curl http://localhost:8080/api/products/no-es-un-id

# Login con credenciales invalidas -> 401
curl -X POST http://localhost:8080/api/users/login -H "Content-Type: application/json" -d "{\"email\":\"no@existe.com\",\"password\":\"x\"}"

# Cambiar rol sin permisos -> 403
curl -X PUT http://localhost:8080/api/users/<id>/role -H "Content-Type: application/json" -d "{\"role\":\"admin\",\"requesterRole\":\"user\"}"

# Mocks: cantidad invalida (negativa) -> 400
curl "http://localhost:8080/api/mocks/users?count=-3"

# Mocks: cantidad por encima del maximo permitido (100) -> 400
curl "http://localhost:8080/api/mocks/users?count=500"

# Mocks: relacion invalida (pedidos sin usuarios) -> 400
curl "http://localhost:8080/api/mocks/orders?count=2&users=0"
```

Para probar `MockGenerationError` (falla real de MongoDB) alcanza con apagar la base de datos o usar una `MONGODB_URI` que apunte a un servidor caído y llamar a `POST /api/mocks/generate`: la app responde `500` con la estructura uniforme en vez de crashear.

## Logging (Winston)

Toda la aplicación usa un logger centralizado con **Winston** (`src/logger/logger.js`), en vez de `console.log` sueltos. El middleware de errores, el arranque del servidor, la conexión a MongoDB y el módulo de mocks usan este mismo logger.

### Niveles de log

De más a menos crítico:

| Nivel     | Uso                                                                 |
|-----------|----------------------------------------------------------------------|
| `fatal`   | Fallas críticas al arrancar: configuración inválida o Mongo no conecta (el proceso termina con `process.exit(1)`). |
| `error`   | Errores inesperados del servidor o fallas reales de la base de datos (respuestas `5xx`). |
| `warning` | Errores esperados/de negocio (respuestas `4xx`): recurso no encontrado, credenciales inválidas, cantidad de mocks inválida, ruta inexistente, etc. |
| `info`    | Eventos normales relevantes: servidor iniciado, conexión a MongoDB exitosa, datos de prueba generados. |
| `http`    | Una línea por cada request entrante (`METHOD /ruta`), logueada por un middleware en `app.js`. |
| `debug`   | Detalle fino, solo visible en desarrollo. |

### Comportamiento según el entorno (`NODE_ENV`)

- **`development`**: se loguean todos los niveles, incluido `debug` y `http`, tanto en consola como en archivo.
- **`production`**: solo se loguean `info`, `warning`, `error` y `fatal` (se descartan `debug` y `http`), para no ensuciar los logs con ruido de bajo nivel.

### Dónde se guardan los logs

En la carpeta `logs/` (se crea sola en runtime), con rotación diaria vía `winston-daily-rotate-file`:

- `logs/combined-YYYY-MM-DD.log`: todos los niveles habilitados para el entorno actual (se conservan 14 días).
- `logs/error-YYYY-MM-DD.log`: **solo** `error` y `fatal` (se conservan 30 días), para poder revisar rápidamente qué falló sin ruido de `info`/`debug`.

Ambos transports rotan automáticamente por día y por tamaño (máximo 20 MB por archivo), así que los archivos no crecen sin control.

### Qué se ignora en Git

`.gitignore` excluye `logs/*` (todos los archivos generados por la app), pero mantiene trackeado `logs/.gitkeep` para que la carpeta quede documentada en el repositorio aunque esté vacía.

### Endpoint de prueba del logger

`GET /api/logs/test` dispara un log de cada nivel (`debug`, `http`, `info`, `warning`, `error`, `fatal`) y devuelve un `200` con la lista de niveles generados. Es una herramienta interna, no representa una funcionalidad de negocio.

```
curl http://localhost:8080/api/logs/test
```

Después de llamarlo, se puede revisar la consola y los archivos en `logs/` para confirmar que cada nivel apareció donde corresponde (por ejemplo, que `error.log` solo tiene las líneas de `error` y `fatal`, sin `debug` ni `info`).

## Documentación con Swagger (OpenAPI)

La API expone documentación interactiva en **`GET /api/docs`**. Ahí se puede ver cada endpoint, probarlo directamente desde el navegador ("Try it out"), y revisar los schemas de request/response.

```
npm start
# abrir en el navegador:
http://localhost:8080/api/docs
```

### Cómo está armada (separada de las rutas)

Toda la configuración de Swagger vive en `src/docs/`, sin tocar `src/routes/`:

```
src/docs/
  swagger.config.js   # arma el spec OpenAPI (info, servers, tags) y monta swagger-ui-express
  responses.js         # helpers para no repetir la forma de las respuestas success/error
  schemas/              # schemas reutilizables (uno por entidad)
  paths/                 # documentación de cada endpoint, agrupada por módulo
```

`app.js` solo llama a `setupSwagger(app, config.port)`; no conoce el detalle de la configuración de Swagger, y las rutas (`src/routes/*.js`) no tienen ninguna anotación de Swagger mezclada.

### Qué está documentado

Agrupado por tags, igual que en la UI:

- **Users**: registro, login, listado, detalle y cambio de rol.
- **Products**: catálogo (listado con filtro de disponibilidad, detalle, alta, edición, baja).
- **Orders**: pedidos (listado, detalle, creación, cambio de estado).
- **Deliveries**: entregas (listado, detalle, creación, cambio de estado).
- **Mocks**: los 5 endpoints de preview (`users`, `delivery-agents`, `orders`, `deliveries`, `preview`) y el de inserción real (`generate`), con sus query params/body y los errores de cantidad inválida o relación inválida.
- **Logger**: `GET /api/logs/test`, aclarando explícitamente que es una herramienta de validación interna y no una funcionalidad de negocio.

Cada endpoint documenta método, ruta, parámetros de path/query (si aplica), body esperado (si aplica), la respuesta exitosa y **únicamente** los códigos de error que ese endpoint realmente puede devolver (por ejemplo, `POST /api/orders` documenta `404` porque el usuario referenciado puede no existir, pero no documenta `409` porque ese endpoint nunca lo devuelve).

### Schemas reutilizables

En `src/docs/schemas/`: `User`, `Product`, `Order`, `OrderItem`, `Delivery`, más las variantes `Mock*` (que sí exponen el password en texto plano, a diferencia del `User` real) y los genéricos `SuccessResponse`/`ErrorResponse`, que reflejan exactamente la forma de respuesta del [middleware de errores](#manejo-centralizado-de-errores) y de los controllers.

### Aclaraciones para probar los endpoints

- Los endpoints que devuelven objetos con `_id` (pedidos, entregas) requieren primero crear los datos relacionados: para crear una entrega hace falta un `order` y un `deliveryAgent` (un usuario con rol `delivery`) ya existentes; se pueden crear a mano con `Users`/`Orders`, o generarlos rápido con `POST /api/mocks/generate`.
- Todos los `id` de ejemplo en la documentación son ilustrativos; hay que reemplazarlos por ids reales devueltos por la propia API al probar desde Swagger UI.

## Testing (Mocha, Chai y Supertest)

### Herramientas

- **Mocha**: organiza y ejecuta los tests (`describe`/`it`).
- **Chai**: aserciones (`expect(...)`), para validar status HTTP y la forma exacta del body, no solo que "responda".
- **Supertest**: hace las peticiones HTTP directamente sobre la app de Express (`src/app.js`), **sin** levantar un puerto real (`server.js` es el único que hace `app.listen`, y los tests nunca lo importan).

### Cómo correr los tests

```
npm test
```

Esto ejecuta `mocha`, que carga automáticamente `test/setup.js` (configurado en `.mocharc.json`) antes de cualquier test.

> `mocha`, `chai`, `supertest` y `mongodb-memory-server` están en `dependencies` (no en `devDependencies`), a propósito: así el binario de `mocha` queda disponible siempre, incluso en entornos que instalan con `npm ci --omit=dev` o con `NODE_ENV=production`, y `npm test` no falla por falta del ejecutable.
>
> La primera vez que se corren los tests en una máquina nueva, `mongodb-memory-server` descarga el binario de MongoDB (una sola vez; después queda cacheado en `~/.cache/mongodb-binaries` y las corridas siguientes son rápidas). Por eso el hook de arranque tiene un timeout generoso (180s).

### Entorno de testing (separado del de desarrollo)

- `NODE_ENV` se fuerza a `test` desde `test/setup.js`, independientemente de lo que haya en `.env`.
- **Base de datos separada y descartable**: los tests no usan la MongoDB de desarrollo. `test/setup.js` levanta una instancia de **MongoDB en memoria** (`mongodb-memory-server`) antes de correr la suite (`beforeAll`) y la apaga al terminar (`afterAll`) — no hace falta tener Mongo corriendo ni configurar una base de test a mano, y nunca se tocan datos reales.
- **Limpieza entre tests**: un hook `afterEach` global vacía todas las colecciones después de cada test individual, así ningún test depende del estado que dejó otro ni del orden en que corren.
- Variables de entorno propias: hay un `.env.test.example` (análogo a `.env.example`) con `NODE_ENV`, `PORT` y `MONGODB_URI` de referencia. En la práctica `MONGODB_URI` no se usa para conectar (la conexión real la arma `test/setup.js` contra la base en memoria), pero la variable debe existir igual porque la [validación de entorno](#instrucciones-para-correr-el-proyecto-localmente) del módulo 1 la exige para poder cargar la app. Si querés customizar `PORT` para los tests, copiá el archivo: `cp .env.test.example .env.test` (este archivo no se sube al repo).

### Qué está cubierto

- `test/users.test.js`: registro (éxito, email duplicado, rol inválido), login (éxito, credenciales inválidas), listado y detalle de usuarios (incluye 404), cambio de rol (éxito y sin permisos).
- `test/orders.test.js`: creación de pedidos (éxito con cálculo de total, usuario inexistente, sin items), listado, detalle por id (incluye 404), cambio de estado (éxito, estado inválido, pedido inexistente).
- `test/deliveries.test.js`: creación de entregas (éxito, pedido inexistente, repartidor sin rol `delivery`), detalle por id (incluye 404), cambio de estado (éxito e inválido).
- `test/mocks.test.js`: preview de usuarios simulados (verifica que **no** persisten en la base), cantidades inválidas (negativa y por encima del máximo), relación inválida (pedidos sin usuarios), preview combinado (verifica las relaciones entre entidades), y `POST /generate` (inserción real en MongoDB + cantidad inválida).
- `test/logs.test.js`: `GET /api/logs/test` dispara y devuelve los 6 niveles esperados.
- `test/docs.test.js`: `GET /api/docs` sirve la interfaz de Swagger UI (coherencia con el módulo anterior).
- `test/errors.test.js`: ruta inexistente (404) e id con formato inválido (400), verificando el formato uniforme `{ status: "error", error: { code, message } }` del [middleware central de errores](#manejo-centralizado-de-errores).
- `test/uploads.test.js`: carga de un documento de usuario válido (verifica que el archivo quede en disco y que la base solo tenga los metadatos), archivo faltante, tipo de documento inválido, tipo de archivo no permitido, usuario inexistente; y lo mismo para el comprobante de una entrega (carga válida, archivo faltante, entrega inexistente).

Cada test valida el `status` HTTP **y** la estructura/propiedades relevantes del body (no solo que la request no falle) — por ejemplo, que un usuario recién creado tenga `role: "user"` por defecto y nunca exponga el `password`, o que el código de error (`error.code`) sea exactamente el esperado (`NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, etc.).

### Datos de prueba

Todos los datos se generan dentro de cada test (usuarios con emails únicos vía `test/helpers/fixtures.js`, pedidos, repartidores), nunca se depende de datos cargados manualmente. Gracias a la base en memoria + la limpieza en `afterEach`, la suite completa es repetible: correr `npm test` muchas veces seguidas da siempre el mismo resultado.

## Carga de archivos: documentos y comprobantes (Multer)

ShipNow permite subir documentos de usuario (ej. DNI, licencia) y comprobantes de entrega, usando **Multer**. Solo se guardan los **metadatos** en MongoDB; el archivo en si vive en el disco del servidor, bajo `uploads/`.

### Configuración centralizada (separada de los routers)

Toda la configuración de Multer vive en `src/uploads/`, no en las rutas:

```
src/uploads/
  paths.js            # define y crea las carpetas de destino (uploads/user-documents, uploads/delivery-vouchers)
  multer.config.js     # storage, nombre de archivo, tipos permitidos, tamaño maximo y fileFilter
```

Las rutas (`src/routes/user.routes.js`, `src/routes/delivery.routes.js`) solo importan las instancias de Multer ya configuradas y las usan como middleware (`userDocumentsUpload.single('document')`); no definen ninguna opción de Multer por su cuenta.

- **Carpetas**: `uploads/user-documents/` (documentos de usuario) y `uploads/delivery-vouchers/` (comprobantes de entrega). Ambas se crean solas al arrancar la app y están en `.gitignore` (solo se trackea un `.gitkeep` en cada una).
- **Nombres de archivo**: se generan (`timestamp-random.ext`), nunca se usa el nombre original para guardar en disco — evita colisiones y problemas de seguridad con nombres de archivo maliciosos.
- **Tipos permitidos**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Tamaño máximo**: 5MB.

### Endpoints

- **`POST /api/users/:uid/documents`** (`multipart/form-data`): campo de archivo `document` (requerido) + campo `documentType` (requerido: `id_card`, `driver_license` o `proof_of_address`). Verifica que el usuario exista, valida el archivo y el tipo de documento, y agrega el documento al array `documents` del usuario.
- **`POST /api/deliveries/:did/voucher`** (`multipart/form-data`): campo de archivo `voucher` (requerido) + campo opcional `voucherType` (`delivery_proof` por defecto, o `signature`/`invoice`). Verifica que la entrega exista, valida el archivo, y agrega el comprobante al array `vouchers` de la entrega. Devuelve la entrega actualizada completa.

Ambos endpoints están documentados en Swagger (`/api/docs`, tags **Users** y **Deliveries**) como `multipart/form-data`, con el nombre del campo de archivo, los campos adicionales y sus valores permitidos, y los errores posibles.

### Metadatos guardados en la base

Por cada archivo, en el array `documents` (usuario) o `vouchers` (entrega), se guarda: `originalName`, `storedName`, `path` (relativa al proyecto), `mimeType`, `size`, `documentType` y `uploadedAt`. El archivo nunca se guarda en MongoDB.

### Errores específicos de archivos

Todos responden con el mismo formato uniforme del [middleware central de errores](#manejo-centralizado-de-errores):

| Error | Código | Cuándo ocurre |
|---|---|---|
| `FileRequiredError` | 400 `VALIDATION_ERROR` | No se envió ningún archivo en el campo esperado. |
| `InvalidFileTypeError` | 400 `VALIDATION_ERROR` | El `mimetype` del archivo no está en la lista permitida. |
| `FileTooLargeError` | 400 `VALIDATION_ERROR` | El archivo supera los 5MB (mapeado desde el `MulterError` nativo). |
| `UnexpectedFileFieldError` | 400 `VALIDATION_ERROR` | El archivo llegó en un campo distinto al esperado (`document`/`voucher`). |
| `InvalidDocumentTypeError` | 400 `VALIDATION_ERROR` | `documentType`/`voucherType` no es uno de los valores permitidos. |
| `UserNotFoundError` / `DeliveryNotFoundError` | 404 `NOT_FOUND` | La entidad a la que se quiere asociar el archivo no existe. |
| `FileUploadError` | 500 `INTERNAL_SERVER_ERROR` | Falla real al guardar los metadatos en MongoDB (después de que el archivo ya se subió). |

Si la validación falla **después** de que Multer ya guardó el archivo en disco (tipo de documento inválido, entidad inexistente, o falla al guardar en la base), el servicio correspondiente (`user.service.js` / `delivery.service.js`) borra ese archivo automáticamente (`removeFileIfExists`) para no dejar archivos huérfanos sin asociar a ninguna entidad.

### Logging

El logger registra: carga exitosa de un documento/comprobante (`info`, con el id de la entidad y el tipo de documento), y cualquier error de carga —tipo no permitido, archivo faltante, tamaño excedido, entidad no encontrada— como `warning` o `error` automáticamente a través del middleware central de errores (igual que el resto de la API).

### Cómo probarlo

```
curl -X POST http://localhost:8080/api/users/<uid>/documents \
  -F "documentType=id_card" \
  -F "document=@/ruta/a/mi-dni.pdf"

curl -X POST http://localhost:8080/api/deliveries/<did>/voucher \
  -F "voucherType=delivery_proof" \
  -F "voucher=@/ruta/a/comprobante.jpg"
```
