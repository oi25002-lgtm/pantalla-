# Repositorio Digital UES FMO

Prototipo de interfaz hecho con Angular, TypeScript y CSS para el **Repositorio Digital de Proyectos y Trabajos de Grado** de Ingeniería de Sistemas Informáticos, Facultad Multidisciplinaria Oriental, Universidad de El Salvador. Mantiene el estilo azul con tarjetas translúcidas elegido por el equipo.

## Ejecutar en Windows PowerShell

Abre una terminal en esta carpeta y ejecuta:

```powershell
npm install
npm start
```

Abre la dirección que muestre Angular CLI, normalmente `http://localhost:4200`. Para detener el servidor, vuelve a la terminal y presiona `Ctrl+C`.

## Vistas incluidas

- Catálogo público con búsqueda por título, autor, resumen y palabras clave; combinación de filtros por año, área, tipo, carrera, asignatura y autor; orden y páginas de hasta diez trabajos.
- Ficha con metadatos, docente cuando está autorizado, favoritos, enlace compartible y materiales según el permiso de difusión.
- Mi espacio de usuario con envío opcional de proyecto, validación de materiales, seguimiento de estado e historial, avisos internos y envío de versiones corregidas.
- Área de supervisor con cola de entregas ordenada por fecha de recepción, revisión de materiales, permiso general y por recurso, decisiones con observaciones, control de publicaciones, retiro con motivo, destacados e informe por año y área.
- Registro de cuenta para cualquier persona. Enviar un proyecto es opcional y no requiere un rol especial ni aprobación previa del administrador.
- Área de administrador para gestionar cuentas de muestra, asignar roles internos y habilitar o deshabilitar usuarios. La interfaz no permite modificar el rol de la cuenta administradora de muestra.

## Correspondencia con el Avance 5

Las pantallas representan RF-01 a RF-21 y RNF-08 como flujos de interfaz: consulta y filtros, ficha y permisos, entregas/versiones, decisiones e historial, notificaciones internas, cuentas/roles, reporte, favoritos y enlaces compartibles. Los trabajos y cuentas incluidos son datos de demostración claramente identificados.

La interfaz no puede aplicar por sí sola las reglas que deben protegerse en el servidor. La autenticación, permisos por rol, acceso directo a archivos, almacenamiento persistente de entregas e historial, notificaciones reales, reportes sobre datos oficiales y copias de seguridad se completarán al desarrollar la API y la base de datos. No se han fijado correo, WhatsApp ni otro canal externo para comunicar observaciones.

## Archivos principales

- `src/app/app.ts`: datos de muestra, filtros, estados y acciones de los paneles.
- `src/app/app.html`: pantallas y formularios.
- `src/app/app.css`: estilo visual, componentes y adaptación a móvil.
- `src/styles.css`: estilos generales.
- `public/ues-escudo.png`: escudo usado en la interfaz.
- `public/ejemplo-material.pdf`: material ficticio de muestra para demostrar la apertura de un PDF.

La página `vista-previa.html` es una maqueta estática anterior. Para ver la aplicación Angular en ejecución usa el servidor iniciado con `npm start`.
