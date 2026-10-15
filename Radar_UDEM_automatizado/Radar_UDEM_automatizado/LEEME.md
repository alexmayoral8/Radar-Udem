# Radar de Salud UDEM — código fuente

Esta descarga contiene la versión funcional actual, con noticias, menciones de UDEM y síntesis semanal con Gemini y caché persistente.

## Archivos principales
- dist/index.html: estructura de la página.
- dist/style.css: diseño y colores.
- dist/app.js: interacciones y presentación de las noticias.
- dist/translation.js: traducción del portugués al español.
- news-engine.mjs: recopilación y clasificación de noticias.
- mentions-engine.mjs: menciones de UDEM.
- weekly-engine.mjs: Gemini y almacenamiento de las síntesis.
- drizzle/: esquema inicial de la base de datos D1.
- build-worker.mjs: construye el servidor completo en dist/server/index.js.
- tests/: pruebas de caché.

## Editar y construir
Abre esta carpeta en un editor como Visual Studio Code. Con Node.js instalado:

    node build-worker.mjs
    node --test tests/weekly-cache.test.mjs

El código se ejecuta en un entorno Worker compatible con Cloudflare y una base D1 vinculada como DB. Las migraciones de drizzle deben aplicarse antes de usar el servidor. Abrir index.html directamente permite inspeccionar la interfaz, pero las funciones de noticias, menciones y Gemini necesitan las rutas del servidor /api/.

## Configuración
Las claves de API se configuran como secretos del servidor. No se incluyen en esta descarga. Consulta GEMINI.md, GNEWS.md y .env.example para los nombres de configuración. .env.example es una plantilla: el servidor obtiene sus variables de env y el despliegue debe proporcionarlas.

.openai/hosting.json conserva la referencia al proyecto existente en Sites. Si importas el código como un proyecto independiente, adapta esa configuración al nuevo alojamiento.

La descarga incluye los datos iniciales públicos de ejemplo, pero no exporta el contenido actual de la base de datos ni los resúmenes guardados en producción.
