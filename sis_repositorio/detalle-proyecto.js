/* Pantalla demostrativa: reemplazar estos datos por la respuesta de la API cuando exista conexión con PostgreSQL. */
const proyectosDemo = {
  "1": {
    titulo: "Sistema web para la gestión académica",
    resumenCorto: "Plataforma web orientada a optimizar los procesos académicos y facilitar la consulta de información institucional.",
    resumen: "Este proyecto propone el desarrollo de una plataforma web para apoyar la gestión de procesos académicos. La solución centraliza información relevante, facilita las consultas y ofrece una interfaz organizada para mejorar el acceso a los datos de la comunidad universitaria. La descripción presentada es ilustrativa y deberá sustituirse por el resumen registrado en el repositorio.",
    autores: ["María López"], anio: "2025", carrera: "Ingeniería de Sistemas Informáticos", tipo: "Proyecto de graduación", tematica: "Desarrollo web",
    etiquetas: ["Aplicación web", "Gestión académica", "Base de datos", "Automatización"]
  },
  "2": {
    titulo: "Análisis de datos para la toma de decisiones",
    resumenCorto: "Estudio de técnicas de análisis de datos para apoyar la interpretación de información y la toma de decisiones.",
    resumen: "Este trabajo aborda el uso de herramientas de análisis de datos para transformar información en indicadores útiles para la toma de decisiones. El texto es demostrativo y debe reemplazarse por el resumen oficial registrado en el repositorio.",
    autores: ["Carlos Méndez"], anio: "2026", carrera: "Ingeniería de Sistemas Informáticos", tipo: "Investigación", tematica: "Bases de datos",
    etiquetas: ["Análisis de datos", "Inteligencia empresarial", "Bases de datos"]
  },
  "3": {
    titulo: "Plataforma de monitoreo de redes",
    resumenCorto: "Sistema de monitoreo para visualizar el estado de una red y apoyar la detección temprana de fallas.",
    resumen: "La propuesta describe una plataforma para consultar indicadores del estado de una infraestructura de red y facilitar la identificación de posibles interrupciones. Este resumen es de ejemplo y debe sustituirse por el contenido oficial.",
    autores: ["Ana Torres"], anio: "2024", carrera: "Ingeniería de Sistemas Informáticos", tipo: "Tesis", tematica: "Redes y comunicación",
    etiquetas: ["Monitoreo", "Redes", "Infraestructura", "Disponibilidad"]
  },
  "4": {
    titulo: "Asistente virtual para consultas universitarias",
    resumenCorto: "Propuesta de asistente conversacional para orientar a estudiantes sobre trámites y servicios universitarios.",
    resumen: "Este proyecto plantea un asistente conversacional para apoyar la consulta de información universitaria y orientar a estudiantes hacia trámites y servicios institucionales. El contenido es demostrativo.",
    autores: ["José Rivera"], anio: "2023", carrera: "Ingeniería de Sistemas Informáticos", tipo: "Proyecto de graduación", tematica: "Inteligencia artificial",
    etiquetas: ["Asistente virtual", "Chatbot", "Inteligencia artificial", "Servicios universitarios"]
  },
  "5": {
    titulo: "Buenas prácticas de seguridad informática",
    resumenCorto: "Revisión de prácticas para reducir riesgos y fortalecer la protección de información en organizaciones.",
    resumen: "El trabajo reúne recomendaciones de seguridad informática orientadas a reducir riesgos y fortalecer la protección de información en una organización. El texto se incluye únicamente como ejemplo visual.",
    autores: ["Karla Cruz"], anio: "2021", carrera: "Ingeniería de Sistemas Informáticos", tipo: "Tesis", tematica: "Seguridad informática",
    etiquetas: ["Ciberseguridad", "Gestión de riesgos", "Protección de datos"]
  },
  "6": {
    titulo: "Sistema de inventario para recursos tecnológicos",
    resumenCorto: "Herramienta para registrar, organizar y consultar los recursos tecnológicos de una institución.",
    resumen: "La propuesta presenta un sistema de información para registrar y consultar los recursos tecnológicos de una institución, con el propósito de mantener información organizada y facilitar el control del inventario. El resumen es ficticio.",
    autores: ["Daniela Pérez"], anio: "2019", carrera: "Ingeniería de Sistemas Informáticos", tipo: "Investigación", tematica: "Sistemas de información",
    etiquetas: ["Inventario", "Activos tecnológicos", "Sistemas de información"]
  }
};

const params = new URLSearchParams(window.location.search);
const projectId = params.get('id') || '1';
const proyecto = proyectosDemo[projectId] || proyectosDemo['1'];
const byId = (id) => document.getElementById(id);

byId('project-title').textContent = proyecto.titulo;
byId('breadcrumb-title').textContent = proyecto.titulo;
byId('project-short-summary').textContent = proyecto.resumenCorto;
byId('project-summary').textContent = proyecto.resumen;
byId('project-year').textContent = proyecto.anio;
byId('project-career').textContent = proyecto.carrera;
byId('project-type').textContent = proyecto.tipo;
byId('project-type-badge').textContent = proyecto.tipo;
byId('project-topic').textContent = proyecto.tematica;
byId('author-count').textContent = `${proyecto.autores.length} ${proyecto.autores.length === 1 ? 'autor' : 'autores'}`;
byId('author-list').replaceChildren(...proyecto.autores.map((nombre, index) => {
  const item = document.createElement('article'); item.className = 'author-item';
  const initials = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  const avatar = document.createElement('span'); avatar.className = 'author-avatar-large'; avatar.textContent = initials;
  const info = document.createElement('div'); const name = document.createElement('h3'); name.textContent = nombre;
  const role = document.createElement('p'); role.textContent = 'Autor/a del proyecto'; info.append(name, role);
  const order = document.createElement('span'); order.className = 'author-order'; order.textContent = `Autor/a ${index + 1}`;
  item.append(avatar, info, order); return item;
}));
byId('project-tags').replaceChildren(...proyecto.etiquetas.map(etiqueta => { const tag = document.createElement('span'); tag.textContent = etiqueta; return tag; }));
document.title = `${proyecto.titulo} | SIS Repositorio Digital`;

const favoriteButton = byId('detail-favorite');
const favoriteKey = `sis-favorite-${projectId}`;
function setFavorite(active) {
  favoriteButton.setAttribute('aria-pressed', String(active));
  favoriteButton.innerHTML = active ? '♥ <span>Guardado en favoritos</span>' : '♡ <span>Guardar en favoritos</span>';
}
setFavorite(localStorage.getItem(favoriteKey) === 'true');
favoriteButton.addEventListener('click', () => {
  const active = favoriteButton.getAttribute('aria-pressed') !== 'true';
  localStorage.setItem(favoriteKey, String(active)); setFavorite(active);
});

document.querySelectorAll('[data-file-action]').forEach(button => button.addEventListener('click', () => {
  alert('Este es un archivo de demostración. Cuando conectemos el repositorio, este botón abrirá o descargará el recurso real según los permisos configurados.');
}));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (menuToggle && nav) menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded)); nav.classList.toggle('open', !expanded);
});
