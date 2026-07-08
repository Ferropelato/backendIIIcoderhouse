# ShipNow API - Entrega 1 y 2

API de ShipNow refactorizada en arquitectura por capas (Controller -> Service -> Repository), con configuracion de entorno validada, constantes centralizadas para roles y estados, y un módulo de mocking para generar datos de prueba.

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
