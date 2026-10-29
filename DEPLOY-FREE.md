# Prueba gratuita durante el fin de semana

Esta configuración usa Render para la web estática y la API, y Neon para PostgreSQL. No requiere dejar el PC encendido.

Para desarrollo local, copia `backend/.env.example` a `backend/.env` y pon la contraseña de tu PostgreSQL local en `PGPASSWORD`. No subas `.env` a GitHub.

## 1. Crear la base de datos gratuita

1. Crea un proyecto en [Neon](https://neon.tech/) con el plan Free.
2. Copia la cadena de conexión PostgreSQL del panel. No la publiques ni la guardes en el repositorio.
3. Restaura el backup base `db_backups/v0.02.sql` en la base de Neon. Aunque termina en `.sql`, es un archivo binario de `pg_dump`; no lo pegues en el editor SQL de Neon. Desde PowerShell, con PostgreSQL Command Line Tools instaladas:

   ```powershell
   $env:DATABASE_URL = "PEGA_AQUI_LA_URL_DE_NEON"
   pg_restore --no-owner --no-acl --dbname="$env:DATABASE_URL" ".\db_backups\v0.02.sql"
   ```

4. Aplica con `psql` las migraciones de texto en este orden: `v0.03_migration.sql`, `v0.03a_class_experience.sql`, `v0.04_class_cazador.sql`, `v0.05_race_elfo_oscuro.sql`, `v0.06_race_humano.sql`, `v0.07_reglas_creacion.sql`, `v0.08_columnas_fisicas.sql`, `v0.09_character_images.sql` y `v0.10_razas_clases_completas.sql`. Por ejemplo:

   ```powershell
   psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f ".\db_backups\v0.03_migration.sql"
   ```

   Repite el comando para cada archivo posterior, en ese orden. `v0.01.sql` es un backup anterior; no lo restaures encima de `v0.02.sql`.

## 2. Crear los servicios en Render

1. En Render, elige **New > Blueprint** y conecta el repositorio de GitHub que contiene este archivo `render.yaml`.
2. Revisa que ambos servicios, `terratea-api` y `terratea-web`, tengan el plan **Free**. No selecciones planes de pago ni añadas discos.
3. En `terratea-api`, configura `DATABASE_URL` con la cadena de Neon.
4. Copia el dominio público de `terratea-api` (por ejemplo, `https://terratea-api.onrender.com`) y configúralo en `terratea-web` como `VITE_API_URL`, sin barra final.
5. Guarda los cambios y espera a que ambos despliegues terminen. Comparte con tus compañeros solo el dominio de `terratea-web`.

## Límites del plan gratuito

- Los servicios web gratuitos de Render se suspenden tras 15 minutos sin actividad y pueden tardar alrededor de un minuto en volver a responder.
- Render ofrece 750 horas gratuitas de instancia por espacio de trabajo al mes; si se agotan, suspende los servicios gratuitos.
- La base de datos gratuita de Neon se suspende por inactividad y tiene límites de uso. Revisa el panel antes de compartir el sitio.
- Usa datos de prueba. La API actual no restringe el acceso por usuario; cualquiera que tenga la URL puede llamar a sus rutas públicas.

No habilites pagos automáticos para esta prueba. Si un límite gratuito se agota, deja que el servicio se suspenda en lugar de cambiarlo a un plan de pago.


