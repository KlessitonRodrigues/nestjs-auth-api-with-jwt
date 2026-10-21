# NestJS Auth API with JWT

A REST authentication API built with [NestJS](https://nestjs.com/), TypeORM, and PostgreSQL. It provides email/password authentication with JWT access tokens, password recovery via verification codes, Google and GitHub OAuth sign-in, and CRUD endpoints for users.

## Features

- Email/password sign-up and sign-in
- JWT access tokens (1 hour expiry)
- Token refresh
- Password recovery flow (code generation, verification, and password reset)
- Google sign-in using an OAuth access token
- GitHub sign-in using an OAuth authorization code
- User CRUD endpoints
- Request validation with Zod (`nestjs-zod`)
- Swagger UI served by the API
- Unit tests with Jest

## Tech Stack

- [NestJS 11](https://nestjs.com/)
- [TypeORM](https://typeorm.io/) + PostgreSQL (`pg`)
- [nestjs-zod](https://github.com/risen228/nestjs-zod) for DTO validation
- `bcryptjs` for password hashing
- `jsonwebtoken` for JWT handling
- TypeScript, ESLint, Prettier, Jest

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
BASE_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
JWT_SECRET=your-secret-key
PORT=3000
```

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `password` |
| `DB_NAME` | PostgreSQL database | `postgres` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | `secret` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | – |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | – |

> `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are required only for GitHub sign-in.

### Database

Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

TypeORM is configured with `synchronize: true`, so the `users` table is created automatically on startup.

### Run the Application

```bash
# development
npm run dev

# production build
npm run build
npm run start:prod
```

The API is available at `http://localhost:3000` by default.

## API Documentation

Interactive Swagger UI:

```
http://localhost:3000/docs
```

Raw OpenAPI fixture (Swagger 2.0):

```
http://localhost:3000/docs/swagger.yaml
```

The source specification is [`swagger-2.0.yaml`](./swagger-2.0.yaml). A GitHub Actions workflow deploys it to GitHub Pages on pushes to `main`.

## Endpoints

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create a new account |
| `POST` | `/auth/signin` | Sign in and receive a JWT |
| `POST` | `/auth/signout` | Sign out |
| `POST` | `/auth/refresh-token` | Refresh an access token |
| `POST` | `/auth/send-recovery-code` | Generate a password recovery code |
| `POST` | `/auth/verify-recovery-code` | Verify a recovery code and receive a reset token |
| `POST` | `/auth/reset-password` | Reset the password with a reset token |
| `POST` | `/auth/google` | Sign in with a Google OAuth access token |

### Users

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user |
| `PUT` | `/users/:id` | Replace a user |
| `PATCH` | `/users/:id` | Partially update a user |
| `DELETE` | `/users/:id` | Delete a user |

### Examples

Sign up:

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

Sign in:

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

Response:

```json
{
  "accessToken": "<jwt>",
  "email": "jane@example.com",
  "name": "Jane Doe"
}
```

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── constants/
│   └── dotenv.ts
├── database/
│   └── database.module.ts
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   └── dto/auth.dto.ts
    ├── common/
    │   └── dto/apiResponse.ts
    ├── docs/
    │   ├── swagger.controller.ts
    │   ├── swagger.service.ts
    │   └── swegger.module.ts
    └── users/
        ├── dto/user.dto.ts
        ├── entity/user.entity.ts
        ├── user.controller.ts
        ├── user.module.ts
        └── user.service.ts
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start in watch mode |
| `npm start` | Start the API |
| `npm run start:debug` | Start in watch + debug mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm run lint` | Lint and auto-fix |
| `npm run format` | Format with Prettier |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |

## Docker

`docker-compose.yml` defines a PostgreSQL service along with `auth-api`, `task-api`, and `web` services. The `auth-api` target expects the monorepo layout referenced by the `Dockerfile`; when working from this standalone repository, use the compose file to run PostgreSQL only.

## Notes

- JWTs are signed with `JWT_SECRET` and expire after 1 hour. Recovery tokens expire after 15 minutes.
- The `users` table includes a unique email column and password hashes generated with bcrypt.
- Response payloads use the shared `SuccessDto` / `ErrorDto` shape from `src/modules/common/dto/apiResponse.ts`.
