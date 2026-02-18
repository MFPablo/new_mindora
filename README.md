# Mindora 🌿

Mindora es una plataforma integral para la gestión de clínicas de salud y psicoterapia, diseñada para conectar terapeutas y pacientes en un entorno privado y organizado.

## Características

- **Monorepo TypeScript**: Seguridad de tipos completa entre cliente y servidor.
- **Backend (Hono + Prisma)**: API rápida y ligera utilizando Bun, con PostgreSQL como base de datos.
- **Frontend (React + Vite)**: Interfaz moderna y responsiva construida con Tailwind CSS v4 y TanStack Router.
- **Autenticación**: Flujo de autenticación completo (Signup/Login) con soporte para Credenciales y Google OAuth.
- **Gestión de Perfil**: Perfil de paciente completo con subida de fotos a Cloudinary y gestión de seguridad.
- **Testing E2E**: Suite de pruebas automatizadas con Playwright.

## Estructura del Proyecto

```
.
├── client/               # Frontend React (Vite)
├── server/               # Backend Hono (Bun)
├── shared/               # Esquemas Zod y tipos compartidos
├── e2e/                  # Tests E2E con Playwright
├── docker-compose.yml    # Configuración de base de datos local
└── playwright.config.ts  # Configuración de Playwright
```

## Requisitos Previos

- [Bun](https://bun.sh) (v1.2.4 o superior)
- [Docker](https://www.docker.com/) (para la base de datos local)

## Configuración Local

### 1. Clonar e instalar dependencias

```bash
bun install
```

### 2. Base de Datos y Variables de Entorno

Levanta la base de datos localmente:

```bash
docker-compose up -d
```

Configura las variables de entorno para el servidor en `server/.env`:

```env
DATABASE_URL="postgresql://mindora_user:mindora_password@localhost:5433/mindora_db?schema=public"
AUTH_SECRET="tu_secreto_para_auth_js"
AUTH_URL="http://localhost:3000/"
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
GOOGLE_ID="tu_google_client_id"
GOOGLE_SECRET="tu_google_client_secret"
```

### 3. Migraciones de Base de Datos

```bash
cd server
bun prisma migrate dev
```

### 4. Ejecutar en Desarrollo

Desde la raíz del proyecto:

```bash
bun dev
```

Esto ejecutará tanto el cliente (`http://localhost:5173`) como el servidor (`http://localhost:3000`) utilizando Turbo.

## Testing

### Ejecutar Tests E2E (Playwright)

Asegúrate de que los servidores de desarrollo estén corriendo antes de ejecutar los tests.

```bash
# Instalar navegadores de Playwright (solo la primera vez)
bunx playwright install chromium

# Ejecutar todos los tests
bunx playwright test

# Ejecutar tests con UI interactiva
bunx playwright test --ui
```

Los tests cubren:
- Navegación al Home y Navbar.
- Registro de nuevo usuario (Signup).
- Inicio de sesión (Login).
- Actualización de perfil y cambio de contraseña.

## Tecnologías Utilizadas

- **Bun**: Runtime y gestor de paquetes.
- **Hono**: Framework de backend.
- **Prisma**: ORM para PostgreSQL.
- **React**: Biblioteca de UI.
- **TanStack Router & Query**: Enrutamiento y gestión de estado asíncrono.
- **Tailwind CSS v4**: Motor de estilos.
- **Playwright**: Pruebas end-to-end.
- **Cloudinary**: Almacenamiento de imágenes de perfil.

