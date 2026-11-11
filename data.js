// Datos que mantiene el club a mano. Equipos, plantillas, partidos, clasificaciones y estadísticas
// vienen de la federación en federacion.js (lo genera actualizar.py desde futgal.es).

const CLUB = {
  nombre: "Club Deportivo Boiro",
  corto: "Boiro",
  lema: "Novos tempos, novas ilusións. Forza Boiro.",
  estadio: "Campo Municipal de Barraña",
  direccion: "Avda. de Barraña, 71 · 15930 Boiro (A Coruña)",
  email: "cdboiro@telefonica.net",
  telefono: "981 84 81 85",
  whatsapp: "34981848185",
  instagram: "https://www.instagram.com/cdboirooficial/",
  futgal: "https://www.futgal.es/pnfg/NPcd/NFG_VerClub?cod_primaria=1000118&codigo_club=1097",
};

// Orden en toda la web: primer equipo, juveniles, cadetes… y dentro de cada categoría A, B, C.
// El Juvenil A es el del C.D. Boiro (Liga Nacional); el resto de la cantera es la E.F.M. Concello de Boiro.
const CATEGORIAS = [
  { id: "senior", nombre: "Primer equipo" },
  { id: "juvenil", nombre: "Juvenil" },
  { id: "cadete", nombre: "Cadete" },
  { id: "infantil", nombre: "Infantil" },
  { id: "alevin", nombre: "Alevín" },
  { id: "benjamin", nombre: "Benjamín" },
  { id: "prebenjamin", nombre: "Prebenjamín" },
  { id: "femenino", nombre: "Femenino" },
];

// Nombre en la espalda de la camiseta. Por defecto sale el primer apellido; aquí, los apodos.
// Clave: el nombre tal como sale en la plantilla de la federación.
const DORSO = {
  "Juan Manuel Blanco Bermúdez": "Juanma",
  "Juan Pablo Barros Campos": "Juanpa",
  "Breogan Sio Asensio": "Breo",
};

// Campaña de socios 2026/27 (Instagram del club, 28-07-2026). Revisar cada temporada.
const SOCIOS = {
  temporada: "2026/27",
  precios: [
    { tipo: "Adulto", precio: 100 },
    { tipo: "Matrimonio", precio: 160 },
    { tipo: "Peña y jubilado", precio: 90 },
    { tipo: "Sub-23 (19 a 23 años)", precio: 50 },
    { tipo: "Sub-18 (15 a 18 años)", precio: 30 },
    { tipo: "Socio colaborador (2 carnés)", precio: 250 },
    { tipo: "Golden Card", precio: 200, nota: "Una por persona. Todos los partidos gratis, también pretemporada y días del club." },
  ],
  asiento: "Reserva de asiento: +10 €",
  camiseta: "Camiseta oficial 26/27: 35 €, en las oficinas del club los jueves y viernes de 18:30 a 20:00.",
};

// Noticias: las más recientes primero. url = publicación de Instagram de la que sale.
const NOTICIAS = [
  {
    fecha: "2026-11-10",
    titulo: "Mario Prol, jugador de la jornada en Tercera",
    texto: "El extremo del Boiro fue elegido el futbolista más destacado de la jornada 10 de Tercera RFEF. Marcó uno de los goles de la victoria ante el Arenteiro.",
    url: "https://www.instagram.com/cdboirooficial/p/DfjjMU2A9b7/",
  },
  {
    fecha: "2026-11-08",
    titulo: "Boiro 3-0 Arenteiro: seguimos líderes",
    texto: "Tras el 0-0 del descanso, un gol tempranero en la segunda parte y la expulsión de un jugador visitante abrieron el partido. Goles de Óscar González, Mario Prol y Landeira. El equipo sigue líder con seis puntos de ventaja.",
    url: "https://www.instagram.com/cdboirooficial/p/Dffr_SBRREQ/",
  },
  {
    fecha: "2026-11-01",
    titulo: "Empate en As Somozas",
    texto: "Un punto en el Manuel Candocia con gol de Juanma. Gracias a toda la afición que se desplazó.",
    url: "https://www.instagram.com/cdboirooficial/p/DfNZ7UmxfO_/",
  },
  {
    fecha: "2026-10-29",
    titulo: "Ya puedes comprar la camiseta 26/27",
    texto: "La camiseta de esta temporada se vende en las oficinas del club los jueves y viernes de 18:30 a 20:00. Precio: 35 €.",
    url: "https://www.instagram.com/cdboirooficial/p/DYCCyfBlTrj/",
  },
  {
    fecha: "2026-07-28",
    titulo: "En marcha la campaña de socios 2026/27",
    texto: "Reserva o renueva tu carné por WhatsApp en el 981 84 81 85 o con cualquier miembro de la Junta Directiva. Indica si lo quieres en formato físico o digital.",
    url: "https://www.instagram.com/cdboirooficial/p/DbVK3_1FVGH/",
  },
];
