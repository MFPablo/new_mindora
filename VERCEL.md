# Despliegue en Vercel - Mindora

Este repositorio está configurado para desplegarse automáticamente en Vercel.

## Requisitos Previos

1.  **Cuenta de Vercel**: Asegúrate de tener una cuenta en [vercel.com](https://vercel.com).
2.  **Base de Datos**: Necesitas una base de Datos PostgreSQL (ej. Supabase, Neon).

## Pasos para el Despliegue

1.  **Conecta tu repositorio** en el panel de Vercel.
2.  **Configura el Framework Preset**: Selecciona `Other` o deja que Vercel detecte Turborepo.
3.  **Configura las Variables de Entorno**:
    *   `DATABASE_URL`: URL de tu base de datos.
    *   `DIRECT_URL`: URL directa a la base de datos (requerida por Prisma).
    *   `AUTH_SECRET`: Una cadena aleatoria para las sesiones.
    *   `GOOGLE_ID` y `GOOGLE_SECRET`: Si usas autenticación con Google.
    *   `CLOUDINARY_URL`: Para la subida de avatares.
    *   `VITE_SERVER_URL`: En producción, esto puede ser relativo (`/api`) o tu dominio de Vercel.
    *   `VITE_CLIENT_URL`: Tu dominio de producción (ej. `https://tu-app.vercel.app`).

## Detalles Técnicos

- **Frontend**: El cliente Vite se sirve desde el root.
- **Backend**: El servidor Hono se ejecuta como una Vercel Function en `/api`.
- **Monorepo**: Turborepo gestiona el build de `client`, `server` y `shared`.

---
> [!IMPORTANT]
> Hemos reemplazado `Bun.password` por `bcryptjs` para asegurar compatibilidad con el entorno de ejecución de Vercel (Node.js).
