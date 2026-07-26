# User Address

CRUD de usuarios y sus direcciones. Backend Spring Boot, frontend React +
TypeScript, todo levantado con Docker.

**Demo:** https://user-address-frontend-bdsl.onrender.com
**Repo:** https://github.com/kypa95/user-address

> Está en el plan gratuito de Render, así que los servicios se duermen sin
> tráfico: la primera carga puede tardar unos segundos mientras despiertan.

## Qué resuelve

- CRUD de usuarios (nombre, apellidos, CURP, RFC, correo, teléfono) y de sus
  direcciones (0..N por usuario).
- Alta de usuario con direcciones en una sola transacción: o entra todo, o
  hace rollback. Nunca queda un usuario a medio crear.
- Listados paginados y filtrados **en el servidor**, no en el navegador.
- Export a `.xlsx` de usuarios y direcciones, respetando el filtro activo
  (exporta el resultado completo, no la página en pantalla).
- Dashboard con agregados resueltos en una sola query.
- Tema claro/oscuro, validaciones espejo front/back.

## Stack

| Capa      | Tecnologías |
|-----------|-------------|
| Backend   | Java 21, Spring Boot 4.1, Spring Data JPA, PostgreSQL 17, Apache POI (Excel), springdoc-openapi |
| Frontend  | React 19, TypeScript, Vite, Material UI 9, Material React Table, Redux Toolkit, React Router 7, Chart.js |
| Infra     | Docker Compose — Postgres + backend (Tomcat) + frontend (nginx) |

## Levantarlo

Docker Desktop corriendo, y un solo comando levanta los **tres** servicios
(Postgres + backend + frontend):

```bash
docker compose up -d --build
```

Compose se encarga del orden: espera a que Postgres esté `healthy` antes de
arrancar el backend, y el frontend detrás. No hay que levantar nada por
separado.

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:8080/api |
| Swagger  | http://localhost:8080/swagger-ui.html |
| OpenAPI  | http://localhost:8080/v3/api-docs |
| Postgres | localhost:5432 |

Bajar: `docker compose down` (`-v` también borra el volumen de la base).

> Las credenciales de Postgres solo se aplican en la **primera** inicialización
> del volumen. Si las cambias en el `.env`, hay que `down -v` para que agarren.

## Desarrollo con HMR

El `Dockerfile` del front es de producción (build estático servido por nginx),
así que rebuildear en cada cambio es lento. Para desarrollar dejo la base y el
backend en Docker y corro Vite aparte:

```bash
docker compose up -d backend db
docker compose stop frontend

cd user-address-frontend
npm install
npm run dev        # http://localhost:5173, hot reload
```

Vite hace proxy de `/api` → `localhost:8080` (ver `vite.config.ts`), así que el
navegador no cruza orígenes y CORS ni entra en juego. En producción nginx hace
ese mismo proxy.

Scripts: `npm run lint`, `npm run typecheck` (`tsc --noEmit`), `npm run build`.

## Tests

**Backend** — JUnit 5 + Mockito + AssertJ. Los tests de servicio son unitarios
(mocks de repositorio), no tocan la base:

```bash
cd user-address-backend
./mvnw test                                   # todo
./mvnw test -Dtest=UserServiceImplTest        # una clase
./mvnw test -Dtest='UserServiceImplTest#*Export*'   # un método
```

**Frontend** — Vitest + Testing Library, entorno `jsdom`:

```bash
cd user-address-frontend
npm test                # una pasada
npm run test:watch      # watch mode
npm run test:coverage   # cobertura (v8)
```

## API

Todo cuelga de `/api`. Respuesta uniforme (envelope):

```jsonc
{
  "timestamp": "...",
  "message": "...",
  "success": true,
  "status": 200,
  "code": 0,          // en error: código de negocio del catálogo ErrorCode, no el HTTP
  "data": { ... }
}
```

Las excepciones las centraliza un `@ControllerAdvice` (`ErrorHandler`) que las
mapea a ese sobre con su `ErrorCode` y su HTTP. Los duplicados de CURP/RFC/email
salen como 409; validaciones como 400.

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET    | `/api/users` | Listado paginado (`page`, `size`, `search`, filtros por columna) |
| POST   | `/api/users` | Crea usuario (+ direcciones opcionales, transaccional) |
| GET    | `/api/users/{id}` | Un usuario |
| PUT    | `/api/users/{id}` | Actualiza |
| DELETE | `/api/users/{id}` | Borra usuario y sus direcciones (cascada) |
| GET    | `/api/users/export` | `.xlsx` de usuarios según filtro |
| GET    | `/api/users/{userId}/addresses` | Direcciones del usuario, paginado + búsqueda |
| POST   | `/api/users/{userId}/addresses` | Crea dirección |
| GET    | `/api/users/{userId}/addresses/export` | `.xlsx` de direcciones según filtro |
| PUT    | `/api/addresses/{id}` | Actualiza dirección |
| DELETE | `/api/addresses/{id}` | Borra dirección |
| GET    | `/api/dashboard/summary` | Totales + últimos + top estados |

Las exportaciones son la única excepción al envelope: devuelven el binario
directo con su `Content-Disposition`.

## Estructura

```
user-address/
├── docker-compose.yml
├── user-address-backend/
│   └── src/main/java/.../user_address/
│       ├── user/        address/        dashboard/     # controller · service · repo · dto · entity
│       ├── helper/      # ResponseWrapper + ErrorHandler
│       └── util/        # ErrorCode, Message, ValidationPatterns
└── user-address-frontend/
    └── src/
        ├── api/         components/     pages/         store/
        ├── constants/   data/   types/   utils/   theme/   css/
```