# Automatización del Radar UDEM Health

Esta versión mantiene el Worker, las rutas de noticias, el módulo de conversación UDEM y la base de datos **Cloudflare D1**. GitHub Actions **solo dispara** el procesamiento en el servidor; no ejecuta Gemini en GitHub ni reemplaza el almacenamiento existente.

## Configuración necesaria

1. Publicar esta versión actualizada en un Worker con la vinculación D1 `DB` y aplicar la migración `drizzle/0000_weekly_summaries.sql` (si aún no se aplicó).
2. Configurar **secretos del Worker**, no del navegador: `GEMINI_API_KEY` y `AUTOMATION_TOKEN` (un token largo, generado aleatoriamente). Mantener `GNEWS_API_KEY`, `YOUTUBE_API_KEY` y `NEWSDATA_API_KEY` solo si se utilizan sus respectivos módulos.
3. En GitHub → repositorio → Settings → Secrets and variables → Actions crear **dos secretos**:
   - `RADAR_URL`: URL base HTTPS del Worker desplegado, sin ruta (ej. `https://mi-radar.example.com`).
   - `AUTOMATION_TOKEN`: el mismo token que configuraste en el Worker.
4. Subir el proyecto a GitHub. Activar Actions y ejecutar manualmente **Actualizar Radar UDEM Health** con **Run workflow** para probar.
5. Revisar el resultado y los logs de ejecución. El workflow está programado de lunes a viernes a las 07:00 en Monterrey, aunque GitHub puede retrasar ejecuciones programadas.

## Funcionamiento

- La ruta `POST /api/automation/run` exige `Authorization: Bearer <token>`. Nunca llamarla desde el navegador ni incrustar ese token en `dist/app.js`.
- Cada ejecución recolecta noticias, conserva información previa de fuentes que no respondan y guarda el resultado en D1.
- Los viernes, el mismo proceso solicita `weeklySummaryResponse`, que reutiliza el caché por contenido y llama a Gemini únicamente para categorías modificadas.
- El panorama semanal del código actual utiliza **ventana móvil de 7 días**; no es todavía un archivo fijo de lunes a viernes. En la versión actual el resumen diario usa la presentación existente y no se genera con Gemini.
- El módulo Conversación UDEM conserva su funcionamiento actual, pero no se refresca mediante esta ruta automática.
- Si todas las fuentes fallan, la ruta responde 503 y **no sobrescribe** el último conjunto guardado.

## Seguridad y costes

- No subir archivos `.env` ni secretos a GitHub, ni compartir claves en ChatGPT.
- El repositorio puede ser privado. GitHub Actions y Gemini tienen cuotas sujetas al plan y a su política vigente.
- Para el despliegue independiente del sitio de ChatGPT hace falta una configuración de hosting de Cloudflare Worker + D1; el ZIP original no exporta la base D1 de producción ni los secretos de Sites.
