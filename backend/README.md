# Backend Terratea

API Node/Express. Desplegada en Render (ver DEPLOY-FREE.md). Variables: DATABASE_URL, PORT.

Se redespliega automaticamente en cada push a master (webhook de GitHub a la Deploy Hook de Render).

## Migraciones

Los archivos de `migrations/` se aplican solos al arrancar (`npm start` ejecuta `migrate.js` antes de la API). Se registran en `schema_migrations`. Para una nueva: `migrations/v0.NN_descripcion.sql`, repetible y sin BEGIN/COMMIT.

