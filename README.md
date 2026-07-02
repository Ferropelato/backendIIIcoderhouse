# ShipNow API - Entrega 1

API de ShipNow refactorizada en arquitectura por capas (Controller -> Service -> Repository), con configuracion de entorno validada y constantes centralizadas para roles y estados.

## Estructura del proyecto

```
src/
  config/         # Configuracion de entorno (dotenv + validacion)
  constants/      # Roles y estados del dominio (Object.freeze)
  models/         # Esquemas de Mongoose (sin logica de negocio)
  repositories/    # Unico lugar que conoce Mongoose/MongoDB
  services/       # Logica de negocio
  controllers/    # Manejo de req/res, puerta de entrada HTTP
  routes/         # Conectan cada path con su Controller
  app.js          # Configuracion de Express
  server.js       # Punto de entrada
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

## Por qué separar la lógica entre Service y Repository

El **Repository** es el único módulo que conoce Mongoose: se limita a construir queries, aplicar filtros/proyecciones por defecto (por ejemplo, excluir el password en `UserRepository` o excluir campos internos como `__v`) y persistir datos. No toma decisiones de negocio.

El **Service** concentra las reglas de negocio: decidir el `status` de un producto según su stock, evitar códigos de producto duplicados, hashear contraseñas, validar roles antes de aplicarlos, o verificar permisos antes de modificar el rol de un usuario. Esta separación permite:

- Cambiar el motor de base de datos (o migrar de Mongoose a otro ODM) sin tocar la lógica de negocio.
- Testear las reglas de negocio de forma aislada, sin depender de una base de datos real.
- Mantener a los Controllers simples: solo traducen HTTP a llamadas de Service y devuelven la respuesta.
