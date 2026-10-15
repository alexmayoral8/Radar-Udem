# Menciones de UDEM con GNews

La clave se guarda como secreto del entorno de Sites (`GNEWS_API_KEY`); no se incluye en archivos, respuestas del servidor ni recursos del navegador.

`GNEWS_ENABLED` controla la consulta en la página. Está activada para el prototipo de pruebas por indicación de la usuaria. La cuenta de prueba entrega noticias con 12 horas de retraso y hasta 30 días de historial. La configuración y clave se gestionan en Sites; no en el repositorio.

Cada recopilación activa consulta dos búsquedas en `/api/v4/search`, con `in=title,description`, fecha inicial 30 días atrás y hasta 10 artículos por consulta. Las visitas GET reutilizan el resultado en memoria durante 15 minutos; Actualizar menciones (POST) consulta otra vez. No hay actualización programada. El archivo de prensa de UDEM se consulta como complemento y cubre 90 días.

Se conservan titular, extracto, medio, fecha y URL. Cada resultado de GNews debe contener UDEM o Universidad de Monterrey explícitamente en el titular o extracto; las coincidencias solo en el contenido indexado no se muestran. Esto puede omitir menciones presentes únicamente dentro del artículo. Se excluyen referencias explícitas a otras universidades y se deduplica por titular y medio. La respuesta incluye conteos de resultados recibidos y descartados. Los recortes del archivo de prensa se conservan como una selección de cobertura de UDEM y se identifican en las tarjetas. No se calcula sentimiento.
