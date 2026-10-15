# Síntesis semanal con Gemini

- Clave exclusivamente en el secreto de Sites `GEMINI_API_KEY`; modelo configurable con `GEMINI_MODEL` (Gemini 3.1 Flash-Lite por defecto).
- `/api/news` persiste la última recopilación en D1 (`DB`). GET reutiliza una recopilación de menos de 15 minutos; Actualizar noticias vuelve a consultar las fuentes.
- `/api/weekly-summary` solo utiliza esa recopilación del servidor. No acepta prompts ni noticias enviadas por visitantes.
- Por tema, SHA-256 del conjunto ordenado y deduplicado de URL, título original, resumen original, fecha y fuente, además del modelo y versión del prompt. No incluye hora de captura, orden, traducciones del navegador ni estado temporal de la fuente.
- D1 conserva cada síntesis, sus referencias y fecha de generación. Abrir de nuevo la página reutiliza lo guardado; noticias nuevas, modificadas o que salen del periodo de siete días actualizan solo los temas afectados.
- Una solicitud a Gemini reúne todos los temas pendientes. Una concesión atómica en D1 impide llamadas simultáneas entre pestañas o instancias. Errores activan una pausa de cinco minutos, o quince para cuotas (HTTP 429). No hay reintento automático continuo.
- La interfaz solicita la síntesis al entrar en Panorama semanal, después de cargar las noticias. El resumen diario conserva su comportamiento actual.
- Gemini recibe solo títulos y resúmenes públicos recuperados. Se exige JSON con párrafos completos y referencias numéricas que el servidor convierte en enlaces originales. Una respuesta incompleta o con referencias inválidas no se guarda. La validación estructural no sustituye la revisión editorial de la fidelidad del texto.
- Migración inicial: `drizzle/0000_weekly_summaries.sql`, aplicada por Sites al publicar. No hay DDL en las peticiones.

Validación: `node --test tests/weekly-cache.test.mjs`; construcción: `node build-worker.mjs`.
