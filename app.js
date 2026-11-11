const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icono = (id, cls = "icono") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const normal = (s) => String(s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const slug = (s) => normal(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// --- Fechas -------------------------------------------------------------
const dia = (f) => new Date(`${f}T12:00`); // mediodía: sin líos de zona horaria
const fmt = (f, op) => dia(f).toLocaleDateString("es-ES", op).replace(".", "");
const fechaCorta = (f) => f ? `${fmt(f, { weekday: "short" })} ${fmt(f, { day: "numeric", month: "short" })}` : "Fecha por confirmar";
const cuando = (p) => `${fechaCorta(p.fecha)} · ${p.hora || "hora por confirmar"}`;

// --- Equipos, siempre en el orden del club ---------------------------------
const ordenCat = (id) => CATEGORIAS.findIndex((c) => c.id === id);
const EQUIPOS_ORDEN = [...EQUIPOS].sort((a, b) => ordenCat(a.categoria) - ordenCat(b.categoria) || a.letra.localeCompare(b.letra));
const equipo = (id) => EQUIPOS.find((e) => e.id === id);
const categoria = (id) => CATEGORIAS.find((c) => c.id === id);
const enCategoria = (id) => EQUIPOS_ORDEN.filter((e) => e.categoria === id);
// "Juvenil A"; la letra solo cuando hay más de un equipo en la categoría
const nombreEquipo = (e) => e.categoria === "senior" ? "Primer equipo"
  : `${categoria(e.categoria).nombre}${enCategoria(e.categoria).length > 1 ? ` ${e.letra}` : ""}`;
const rutaEquipo = (e) => e.categoria === "senior" ? "#/primer-equipo" : `#/equipo/${e.id}`;
const proximo = (e) => e.partidos.find((p) => !p.resultado);
const ultimo = (e) => e.partidos.filter((p) => p.resultado).at(-1);
const posicion = (e) => { const i = e.clasificacion.findIndex((f) => f.propio); return i < 0 ? null : { pos: i + 1, ...e.clasificacion[i] }; };

// La federación escribe los clubes en mayúsculas: "PORTONOVO S.D." → "Portonovo S.D."
const MENORES = new Set(["de", "da", "do", "das", "dos", "del", "la", "y", "e"]);
const bonito = (s) => s.toLowerCase().split(/\s+/).map((w, i) =>
  w.includes(".") || /^[a-z]{1,2}$/.test(w) && !MENORES.has(w) ? w.toUpperCase()
    : i && MENORES.has(w) ? w : w.replace(/\p{L}/u, (l) => l.toUpperCase())).join(" ").replace(/"(\w)"/, (_, l) => `"${l.toUpperCase()}"`);

const iniciales = (n) => n.replace(/[^A-ZÁÉÍÓÚÑ ]/gi, "").trim().split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const ESC_LOCALES = window.ESCUDOS || {}; // escudos sin fondo que guarda escudos.py
const escudoRival = (e, n) => e.escudos?.[n]
  ? `<img class="escudo" src="${esc(ESC_LOCALES[e.escudos[n]] || e.escudos[n])}" alt="" loading="lazy">`
  : `<span class="escudo escudo--vacio" aria-hidden="true">${esc(iniciales(n))}</span>`;
const escudoBoiro = `<img class="escudo" src="img/escudo.png" alt="">`;

function marcador(p) {
  const [l, v] = p.resultado.split("-").map(Number);
  const nos = p.local ? l : v, ellos = p.local ? v : l;
  return { l, v, res: nos > ellos ? "G" : nos < ellos ? "P" : "E" };
}
const RES = { G: "Victoria", E: "Empate", P: "Derrota" };
const lados = (p) => p.local
  ? [{ n: CLUB.corto, img: escudoBoiro, nos: true }, { n: bonito(p.rival), img: escudoRival(p.e, p.rival) }]
  : [{ n: bonito(p.rival), img: escudoRival(p.e, p.rival) }, { n: CLUB.corto, img: escudoBoiro, nos: true }];
const vacio = (t) => `<p class="vacio">${t}</p>`;

// --- Piezas ---------------------------------------------------------------
// Enfrentamiento: local, marcador u hora, visitante
function duelo(p, grande = false) {
  const [a, b] = lados(p), m = p.resultado && marcador(p);
  const lado = (x) => `<div class="duelo-equipo${x.nos ? " duelo-equipo--nos" : ""}">${x.img}<span>${esc(x.n)}</span></div>`;
  return `
    <div class="duelo${grande ? " duelo--grande" : ""}">
      ${lado(a)}
      <div class="duelo-centro">${m
        ? `<b class="marcador marcador--${m.res}" aria-label="${RES[m.res]} ${m.l} a ${m.v}">${m.l}<i>-</i>${m.v}</b>`
        : `<b class="hora">${esc(p.hora || "vs")}</b>`}</div>
      ${lado(b)}
    </div>`;
}

function cuentaAtras(p) {
  if (!p.hora || !p.fecha) return "";
  return `<div class="cuenta" data-objetivo="${p.fecha}T${p.hora}" aria-label="Cuenta atrás">
    ${["días", "horas", "min"].map((u) => `<span><b>--</b><small>${u}</small></span>`).join("")}</div>`;
}

// Tarjeta de un equipo: su próximo partido y el resultado de la jornada pasada
function tarjetaEquipo(e) {
  const pr = proximo(e), ul = ultimo(e), primer = e.categoria === "senior", pos = posicion(e);
  const prox = pr ? { ...pr, e } : null, ult = ul ? { ...ul, e } : null;
  const mu = ult && marcador(ult);
  return `
    <a class="tarjeta${primer ? " tarjeta--primer" : ""}" href="${rutaEquipo(e)}">
      <header class="tarjeta-cab">
        <span class="tarjeta-equipo">${esc(nombreEquipo(e))}</span>
        <small>${esc(e.competicion?.split(" · ")[0] || e.liga)}${pos ? ` · <b>${pos.pos}º</b>` : ""}</small>
      </header>
      ${prox ? `
        <div class="tarjeta-prox">
          <p class="tarjeta-etq">Próximo · ${esc(cuando(prox))}</p>
          ${duelo(prox, primer)}
          ${primer ? cuentaAtras(prox) : ""}
          <p class="tarjeta-campo">${icono("i-pin")}${esc(prox.campo ? bonito(prox.campo) : prox.local ? CLUB.estadio : "Campo por confirmar")}</p>
        </div>` : `<div class="tarjeta-prox">${vacio("Sin partidos pendientes")}</div>`}
      ${ult ? `
        <div class="tarjeta-ult">
          <span class="tarjeta-etq">Jornada pasada</span>
          <span class="ult-rival">${ult.local ? "vs" : "en"} ${esc(bonito(ult.rival))}</span>
          <b class="marcador marcador--mini marcador--${mu.res}">${ult.local ? mu.l : mu.v}-${ult.local ? mu.v : mu.l}</b>
        </div>` : ""}
    </a>`;
}

function cabecera(titulo, sub = "", migas = "") {
  return `
    <section class="cabecera">
      <div class="contenedor">
        ${migas ? `<p class="migas">${migas}</p>` : ""}
        <h1>${titulo}</h1>
        ${sub ? `<p class="cabecera-sub">${sub}</p>` : ""}
      </div>
    </section>`;
}

// --- Inicio ---------------------------------------------------------------
function inicio() {
  const primer = equipo("primer-equipo"), pos = primer && posicion(primer);
  return `
    <section class="portada">
      <div class="contenedor portada-dentro">
        <img class="portada-escudo" src="img/escudo.png" alt="" width="120" height="145">
        <div>
          <h1>C.D. Boiro</h1>
          <p class="portada-lema">${esc(CLUB.lema)}</p>
          ${pos ? `<p class="portada-dato"><b>${pos.pos}º</b> en ${esc(primer.competicion.split(" · ")[0])} · ${pos.pts} puntos en ${pos.pj} partidos</p>` : ""}
        </div>
      </div>
    </section>
    <section class="bloque contenedor" aria-labelledby="t-semana">
      <div class="bloque-cab">
        <h2 id="t-semana">Partidos de todos los equipos</h2>
        <div class="flechas">
          <button type="button" class="redondo" data-carrusel="-1" aria-label="Anteriores">${icono("i-izq")}</button>
          <button type="button" class="redondo" data-carrusel="1" aria-label="Siguientes">${icono("i-der")}</button>
        </div>
      </div>
      <div class="carrusel" tabindex="0" aria-label="Próximo partido y último resultado de cada equipo">
        ${EQUIPOS_ORDEN.map(tarjetaEquipo).join("")}
      </div>
    </section>
    <div class="contenedor dos">
      ${primer?.clasificacion.length ? `
      <section class="bloque" aria-labelledby="t-clasif">
        <div class="bloque-cab"><h2 id="t-clasif">Clasificación</h2><a href="#/primer-equipo/clasificacion">Completa</a></div>
        ${tablaClasificacion(primer, true)}
      </section>` : ""}
      <section class="bloque" aria-labelledby="t-not">
        <div class="bloque-cab"><h2 id="t-not">Noticias</h2><a href="#/noticias">Todas</a></div>
        ${listaNoticias(NOTICIAS.slice(0, 3))}
        <a class="banner-socio" href="#/noticias#socios">
          <span><b>Hazte socio ${esc(SOCIOS.temporada)}</b><small>Desde ${Math.min(...SOCIOS.precios.map((p) => p.precio))} € · O CD Boiro somos todos</small></span>
          ${icono("i-der")}
        </a>
      </section>
    </div>`;
}

// --- Clasificación y partidos ---------------------------------------------------
// compacta: los 5 primeros y el Boiro si no está entre ellos
function tablaClasificacion(e, compacta = false) {
  const filas = e.clasificacion.map((f, i) => ({ ...f, pos: i + 1 }));
  const mias = compacta ? filas.filter((f) => f.pos <= 5 || f.propio) : filas;
  return `
    <div class="tabla-marco"><table class="tabla">
      <thead><tr><th scope="col">#</th><th scope="col" class="izq">Equipo</th><th scope="col"><abbr title="Partidos jugados">PJ</abbr></th>
        ${compacta ? "" : `<th scope="col" class="opc"><abbr title="Ganados">G</abbr></th><th scope="col" class="opc"><abbr title="Empatados">E</abbr></th><th scope="col" class="opc"><abbr title="Perdidos">P</abbr></th><th scope="col" class="opc"><abbr title="Goles a favor">GF</abbr></th><th scope="col" class="opc"><abbr title="Goles en contra">GC</abbr></th>`}
        <th scope="col"><abbr title="Diferencia de goles">DG</abbr></th><th scope="col"><abbr title="Puntos">Pts</abbr></th></tr></thead>
      <tbody>${mias.map((f) => `
        <tr${f.propio ? ' class="propio"' : ""}>
          <td class="tabla-pos">${f.pos}</td>
          <th scope="row" class="izq"><span class="tabla-equipo">${f.propio ? escudoBoiro : escudoRival(e, f.equipo)}${esc(f.propio ? CLUB.corto : bonito(f.equipo))}</span></th>
          <td>${f.pj}</td>
          ${compacta ? "" : `<td class="opc">${f.g}</td><td class="opc">${f.e}</td><td class="opc">${f.p}</td><td class="opc">${f.gf}</td><td class="opc">${f.gc}</td>`}
          <td>${f.gf - f.gc > 0 ? "+" : ""}${f.gf - f.gc}</td><td class="tabla-pts">${f.pts}</td>
        </tr>`).join("")}
      </tbody>
    </table></div>`;
}

const filaPartido = (p) => `
  <li class="fila-partido${p.resultado ? "" : " fila-partido--pendiente"}">
    <span class="fila-j">J${p.jornada}</span>
    <span class="fila-fecha">${esc(fechaCorta(p.fecha))}${p.resultado || p.hora ? "" : "<small>hora por confirmar</small>"}</span>
    ${duelo(p)}
  </li>`;

function listaPartidos(e) {
  const ps = e.partidos.map((p) => ({ ...p, e }));
  const pend = ps.filter((p) => !p.resultado), jug = ps.filter((p) => p.resultado).reverse();
  return `
    <section class="bloque"><div class="bloque-cab"><h2>Próximos partidos</h2></div>
      ${pend.length ? `<ol class="lista-partidos">${pend.map(filaPartido).join("")}</ol>` : vacio("No hay partidos pendientes.")}</section>
    <section class="bloque"><div class="bloque-cab"><h2>Resultados</h2></div>
      ${jug.length ? `<ol class="lista-partidos">${jug.map(filaPartido).join("")}</ol>` : vacio("Aún no se ha jugado ningún partido.")}</section>`;
}

// --- Primer equipo ------------------------------------------------------------
// Plantilla de la federación + quien sale convocado en al menos 2 actas (p. ej. un juvenil que sube)
const jugadoresDe = (e) => e._jugadores ??= (() => {
  const ya = new Set(e.plantilla.map(normal)), veces = {};
  for (const a of Object.values(e.actas || {})) for (const n of new Set([...a.t, ...a.s])) if (!ya.has(normal(n))) veces[n] = (veces[n] || 0) + 1;
  return [...e.plantilla, ...Object.keys(veces).filter((n) => veces[n] >= 2)];
})();
const dorsal = (e, n) => Object.entries(e.dorsales || {}).find(([k]) => normal(k) === normal(n))?.[1];

// Posición y edad: de lapreferente.com (la federación no las publica)
function perfil(e, n) {
  const lista = Object.entries(e.perfiles?.jugadores || {}), k = normal(n), trozos = new Set(k.split(/\s+/));
  return (lista.find(([x]) => normal(x) === k) || lista.find(([x]) => normal(x).split(/\s+/).every((t) => trozos.has(t))) || [])[1] || {};
}
const LINEAS = [
  { id: "por", nombre: "Porteros", re: /portero/i },
  { id: "def", nombre: "Defensas", re: /central|lateral|defensa|carrilero|libero/i },
  { id: "med", nombre: "Centrocampistas", re: /medi|pivote|interior|volante/i },
  { id: "del", nombre: "Delanteros", re: /delantero|extremo|punta/i },
];
const linea = (e, n) => { const p = perfil(e, n).posicion || ""; return LINEAS.find((l) => l.re.test(p) && !(l.id === "del" && /media punta/i.test(p)))?.id || "otros"; };
const dorso = (n) => DORSO[n] || (() => { const w = n.split(/\s+/); return w.length >= 3 ? w.at(-2) : w.at(-1); })();

// Minutos: 90 por partido, menos cambios y expulsiones que trae el acta
function estadisticas(e, n) {
  const es = (x) => normal(x) === normal(n);
  const r = { convocado: 0, titular: 0, jugados: 0, minutos: 0, goles: 0, amarillas: 0, rojas: 0 };
  for (const a of Object.values(e.actas || {})) {
    const t = a.t.some(es), s = a.s.some(es), entra = a.e.some(es);
    r.convocado += t || s; r.titular += t; r.jugados += t || entra;
    r.goles += Object.entries(a.g).filter(([x]) => es(x)).reduce((sum, [, v]) => sum + v, 0);
    r.amarillas += a.a.filter(es).length; r.rojas += a.r.filter(es).length;
    const desde = t ? 0 : a.c?.find(([x]) => es(x))?.[2];
    if (desde != null) {
      const hasta = Math.min(90, a.c?.find(([, x]) => es(x))?.[2] ?? 90, Object.entries(a.rm || {}).find(([x]) => es(x))?.[1] ?? 90);
      r.minutos += Math.max(0, hasta - Math.min(desde, 90));
    }
  }
  return r;
}

// Camiseta 26/27 vista de espaldas: blanca con trama celeste (portero: negra y verde), nombre y dorsal
const FORMA = "M62 8 30 20 4 52l22 30 18-12v130h112V70l18 12 22-30-26-32-32-12c-6 6-20 9-38 9S68 14 62 8z";
function camiseta(num, nombre, portero = false) {
  const largo = nombre.length > 9 ? 13 : nombre.length > 7 ? 15 : 17;
  return `
    <svg class="camiseta${portero ? " camiseta--portero" : ""}" viewBox="0 0 200 210" aria-hidden="true">
      <g clip-path="url(#corte-camiseta)">
        <path d="${FORMA}" class="camiseta-tela"/>
        <rect y="132" width="200" height="80" fill="url(#${portero ? "trama-portero" : "trama"})"/>
        <path d="${FORMA}" fill="url(#pliegue)"/>
      </g>
      <path d="${FORMA}" class="camiseta-borde"/>
      <path d="M62 8c6 6 20 9 38 9s32-3 38-9" class="camiseta-cuello"/>
      <text x="100" y="62" class="camiseta-nombre" style="font-size:${largo}px">${esc(nombre.toUpperCase())}</text>
      <text x="100" y="158" class="camiseta-num">${num ?? ""}</text>
    </svg>`;
}
const DEFS_CAMISETA = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <clipPath id="corte-camiseta"><path d="${FORMA}"/></clipPath>
    <pattern id="trama" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect y="0" width="14" height="5" fill="#5bb2e6"/></pattern>
    <pattern id="trama-portero" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect y="0" width="14" height="4" fill="#3fbf5a"/></pattern>
    <linearGradient id="pliegue" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
  </defs></svg>`;

let orden = { col: "dorsal", asc: true };
const COLUMNAS = [
  { id: "dorsal", t: "#", titulo: "Dorsal" }, { id: "nombre", t: "Jugador", titulo: "Jugador" },
  { id: "jugados", t: "PJ", titulo: "Partidos jugados" }, { id: "convocado", t: "Conv.", titulo: "Convocado" },
  { id: "titular", t: "Tit.", titulo: "Titular" }, { id: "minutos", t: "Min.", titulo: "Minutos" },
  { id: "goles", t: "Goles", titulo: "Goles" }, { id: "amarillas", t: "TA", titulo: "Tarjetas amarillas" }, { id: "rojas", t: "TR", titulo: "Tarjetas rojas" },
];

function tablaEstadisticas(e) {
  const filas = jugadoresDe(e).map((n) => ({ n, nombre: n, dorsal: dorsal(e, n) ?? 99, ...estadisticas(e, n) }));
  filas.sort((a, b) => (typeof a[orden.col] === "string" ? a[orden.col].localeCompare(b[orden.col]) : a[orden.col] - b[orden.col]) * (orden.asc ? 1 : -1) || a.dorsal - b.dorsal);
  return `
    <div class="tabla-marco"><table class="tabla tabla--stats">
      <thead><tr>${COLUMNAS.map((c) => `<th scope="col"${c.id === "nombre" ? ' class="izq"' : ""} aria-sort="${orden.col === c.id ? (orden.asc ? "ascending" : "descending") : "none"}">
        <button type="button" data-orden="${c.id}" title="Ordenar por ${c.titulo.toLowerCase()}">${c.t}</button></th>`).join("")}</tr></thead>
      <tbody>${filas.map((f) => `
        <tr><td class="tabla-pos">${f.dorsal === 99 ? "–" : f.dorsal}</td>
          <th scope="row" class="izq"><button type="button" class="enlace" data-jugador="${esc(f.n)}">${esc(f.n)}</button></th>
          <td>${f.jugados}</td><td>${f.convocado}</td><td>${f.titular}</td><td>${f.minutos}</td><td class="tabla-pts">${f.goles}</td><td>${f.amarillas}</td><td>${f.rojas}</td></tr>`).join("")}
      </tbody>
    </table></div>
    <p class="nota">Datos de las actas de la federación (${Object.keys(e.actas || {}).length} partidos). Minutos calculados con los cambios del acta.</p>`;
}

function plantilla(e) {
  const jugadores = [...jugadoresDe(e)].sort((a, b) => (dorsal(e, a) ?? 99) - (dorsal(e, b) ?? 99));
  const grupos = [...LINEAS, { id: "otros", nombre: "Jugadores" }].map((l) => ({ ...l, js: jugadores.filter((n) => linea(e, n) === l.id) })).filter((l) => l.js.length);
  return `
    ${DEFS_CAMISETA}
    ${grupos.map((g) => `
      <section class="bloque">
        <div class="bloque-cab"><h2>${g.nombre}</h2></div>
        <div class="plantilla">${g.js.map((n) => `
          <button type="button" class="carta" data-jugador="${esc(n)}">
            ${camiseta(dorsal(e, n), dorso(n), g.id === "por")}
            <span class="carta-nombre">${esc(n)}</span>
            <small>${esc(perfil(e, n).posicion || "")}</small>
          </button>`).join("")}
        </div>
      </section>`).join("")}
    <section class="bloque">
      <div class="bloque-cab"><h2>Estadísticas</h2></div>
      <div id="stats">${tablaEstadisticas(e)}</div>
    </section>
    <section class="bloque">
      <div class="bloque-cab"><h2>Cuerpo técnico</h2></div>
      <ul class="tecnicos">${e.entrenadores.map((n) => `<li>${esc(n)}</li>`).join("")}${e.delegados.map((n) => `<li>${esc(n)} <small>Delegado</small></li>`).join("")}</ul>
    </section>
    <dialog class="ficha" id="ficha"></dialog>`;
}

function ficha(e, n) {
  const s = estadisticas(e, n), p = perfil(e, n), portero = linea(e, n) === "por";
  const dato = (v, t) => `<div><b>${v}</b><small>${t}</small></div>`;
  return `
    <button type="button" class="redondo ficha-cerrar" data-cerrar aria-label="Cerrar">${icono("i-cerrar")}</button>
    <div class="ficha-cab">
      ${camiseta(dorsal(e, n), dorso(n), portero)}
      <div>
        <p class="ficha-dorsal">${dorsal(e, n) != null ? `Dorsal ${dorsal(e, n)}` : ""}</p>
        <h2>${esc(n)}</h2>
        <p>${[p.posicion, p.edad && `${p.edad} años`].filter(Boolean).map(esc).join(" · ")}</p>
      </div>
    </div>
    <div class="ficha-datos">
      ${dato(s.jugados, "Partidos")}${dato(s.convocado, "Convocado")}${dato(s.titular, "Titular")}
      ${dato(s.minutos, "Minutos")}${dato(s.goles, "Goles")}
      ${dato(`<i class="tarjeta-a"></i>${s.amarillas}`, "Amarillas")}${dato(`<i class="tarjeta-r"></i>${s.rojas}`, "Rojas")}
    </div>`;
}

const PESTANAS = [["plantilla", "Plantilla"], ["clasificacion", "Clasificación"], ["partidos", "Partidos"]];
function primerEquipo(sub = "plantilla") {
  const e = equipo("primer-equipo");
  if (!e) return noEncontrado();
  if (!PESTANAS.some(([id]) => id === sub)) sub = "plantilla";
  const pr = proximo(e), pos = posicion(e);
  return `
    <section class="cabecera cabecera--primer">
      <div class="contenedor cabecera-primer">
        <div>
          <h1>Primer equipo</h1>
          <p class="cabecera-sub">${esc(e.competicion)}${pos ? ` · <b>${pos.pos}º</b> · ${pos.pts} pts` : ""}</p>
        </div>
        ${pr ? `<div class="mini-proximo"><p class="tarjeta-etq">Próximo · ${esc(cuando(pr))}</p>${duelo({ ...pr, e })}</div>` : ""}
      </div>
      <nav class="contenedor pestanas" aria-label="Primer equipo">
        ${PESTANAS.map(([id, t]) => `<a href="#/primer-equipo/${id}"${id === sub ? ' aria-current="page"' : ""}>${t}</a>`).join("")}
      </nav>
    </section>
    <div class="contenedor">
      ${sub === "plantilla" ? plantilla(e)
        : sub === "clasificacion" ? `<section class="bloque">${e.clasificacion.length ? tablaClasificacion(e) : vacio("La federación aún no ha publicado la clasificación.")}
            <a class="enlace-ext" href="${esc(e.urlClasificacion)}" target="_blank" rel="noopener">Ver en futgal.es ${icono("i-externo")}</a></section>`
        : listaPartidos(e)}
    </div>`;
}

// --- Cantera ---------------------------------------------------------------------
function cantera() {
  const cats = CATEGORIAS.filter((c) => c.id !== "senior" && enCategoria(c.id).length);
  return `
    ${cabecera("Cantera", `${cats.reduce((n, c) => n + enCategoria(c.id).length, 0)} equipos esta temporada · C.D. Boiro y E.F.M. Concello de Boiro`)}
    <nav class="contenedor saltos" aria-label="Categorías">${cats.map((c) => `<a href="#/cantera#${c.id}">${c.nombre}</a>`).join("")}</nav>
    <div class="contenedor">
      ${cats.map((c) => `
        <section class="bloque" id="${c.id}">
          <div class="bloque-cab"><h2>${c.nombre}</h2></div>
          <div class="rejilla">${enCategoria(c.id).map(tarjetaEquipo).join("")}</div>
        </section>`).join("")}
    </div>`;
}

function vistaEquipo(id) {
  const e = equipo(id);
  if (!e || e.categoria === "senior") return e ? primerEquipo() : noEncontrado();
  return `
    ${cabecera(esc(nombreEquipo(e)), esc(e.competicion || e.liga), `<a href="#/cantera">Cantera</a> / <a href="#/cantera#${e.categoria}">${esc(categoria(e.categoria).nombre)}</a>`)}
    <div class="contenedor">
      ${e.clasificacion.length ? `<section class="bloque"><div class="bloque-cab"><h2>Clasificación</h2></div>${tablaClasificacion(e)}</section>` : ""}
      ${listaPartidos(e)}
      ${e.entrenadores.length ? `<section class="bloque"><div class="bloque-cab"><h2>Entrenadores</h2></div>
        <ul class="tecnicos">${e.entrenadores.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></section>` : ""}
      <a class="enlace-ext" href="${esc(e.urlFederacion)}" target="_blank" rel="noopener">Ficha del equipo en futgal.es ${icono("i-externo")}</a>
    </div>`;
}

// --- Noticias y socios -----------------------------------------------------------
const listaNoticias = (lista) => `
  <div class="noticias">${lista.map((n) => `
    <a class="noticia" href="${esc(n.url)}" target="_blank" rel="noopener">
      <time datetime="${n.fecha}">${esc(fmt(n.fecha, { day: "numeric", month: "long" }))}</time>
      <strong>${esc(n.titulo)}</strong>
      <p>${esc(n.texto)}</p>
    </a>`).join("")}
  </div>`;

const noticias = () => `
  ${cabecera("Noticias y socios")}
  <div class="contenedor dos">
    <section class="bloque">
      <div class="bloque-cab"><h2>Noticias</h2><a href="${CLUB.instagram}" target="_blank" rel="noopener">Instagram ${icono("i-externo")}</a></div>
      ${listaNoticias(NOTICIAS)}
    </section>
    <section class="bloque socios" id="socios">
      <div class="bloque-cab"><h2>Hazte socio ${esc(SOCIOS.temporada)}</h2></div>
      <p class="socios-lema">O CD Boiro somos todos. Con tu carné ves todos los partidos en Barraña y ayudas al club a crecer.</p>
      <ul class="precios">${SOCIOS.precios.map((p) => `
        <li${p.nota ? ' class="precios-golden"' : ""}><span>${esc(p.tipo)}${p.nota ? `<small>${esc(p.nota)}</small>` : ""}</span><b>${p.precio} €</b></li>`).join("")}
      </ul>
      <p class="nota">${esc(SOCIOS.asiento)}. Carné en formato físico o digital.</p>
      <a class="boton boton--socio boton--ancho" href="https://wa.me/${CLUB.whatsapp}?text=${encodeURIComponent("Hola, quiero hacerme socio del CD Boiro esta temporada")}" target="_blank" rel="noopener">Reservar por WhatsApp · ${esc(CLUB.telefono)}</a>
      <p class="nota">También con cualquier miembro de la Junta Directiva o en <a href="mailto:${CLUB.email}">${CLUB.email}</a>.</p>
      <p class="socios-camiseta">${esc(SOCIOS.camiseta)}</p>
    </section>
  </div>`;

const noEncontrado = () => `${cabecera("Página no encontrada")}<div class="contenedor bloque"><a class="boton" href="#/">Volver al inicio</a></div>`;

// --- Navegación ------------------------------------------------------------------
function render() {
  const [ruta, ancla] = location.hash.replace(/^#\/?/, "").split("#");
  const [seccion, sub] = ruta.split("/");
  app.innerHTML = seccion === "" ? inicio()
    : seccion === "primer-equipo" ? primerEquipo(sub)
    : seccion === "cantera" ? cantera()
    : seccion === "equipo" ? vistaEquipo(sub)
    : seccion === "noticias" ? noticias()
    : noEncontrado();
  const actual = seccion === "equipo" ? "cantera" : seccion;
  document.querySelectorAll("[data-seccion]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.seccion === actual));
  document.title = seccion ? `${document.querySelector(`[data-seccion="${actual}"]`)?.textContent.trim() || "C.D. Boiro"} · C.D. Boiro` : "C.D. Boiro · Web oficial";
  if (ancla) document.getElementById(ancla)?.scrollIntoView();
  else window.scrollTo(0, 0);
  tictac();
  autoCarrusel();
}

// Cuenta atrás del próximo partido del primer equipo
function tictac() {
  for (const c of document.querySelectorAll(".cuenta")) {
    const ms = new Date(c.dataset.objetivo) - Date.now();
    if (ms <= 0) { c.remove(); continue; }
    const [d, h, m] = [ms / 864e5, (ms / 36e5) % 24, (ms / 6e4) % 60].map(Math.floor);
    c.querySelectorAll("b").forEach((b, i) => { b.textContent = String([d, h, m][i]).padStart(2, "0"); });
  }
}
setInterval(tictac, 30000);

// El carrusel avanza solo cada 5 s; se para mientras el usuario lo toca o lo mira con el ratón
let reloj;
function moverCarrusel(paso) {
  const c = document.querySelector(".carrusel");
  if (!c) return;
  const ancho = c.querySelector(".tarjeta:not(.tarjeta--primer)")?.offsetWidth + 16 || 300;
  const alFinal = c.scrollLeft + c.clientWidth >= c.scrollWidth - 8;
  c.scrollBy({ left: paso > 0 && alFinal ? -c.scrollWidth : paso * ancho, behavior: "smooth" });
}
function autoCarrusel() {
  clearInterval(reloj);
  const c = document.querySelector(".carrusel");
  if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let quieto = false;
  const parar = () => { quieto = true; }, seguir = () => { quieto = false; };
  c.addEventListener("pointerenter", parar); c.addEventListener("pointerleave", seguir);
  c.addEventListener("focusin", parar); c.addEventListener("focusout", seguir);
  c.addEventListener("touchstart", () => { quieto = true; clearTimeout(c._t); c._t = setTimeout(seguir, 8000); }, { passive: true });
  reloj = setInterval(() => { if (!quieto && !document.hidden) moverCarrusel(1); }, 5000);
}

app.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-carrusel], [data-orden], [data-jugador], [data-cerrar]");
  if (!t) return;
  const e = equipo("primer-equipo");
  if (t.dataset.carrusel) moverCarrusel(Number(t.dataset.carrusel));
  else if (t.dataset.orden) {
    orden = { col: t.dataset.orden, asc: orden.col === t.dataset.orden ? !orden.asc : ["dorsal", "nombre"].includes(t.dataset.orden) };
    document.getElementById("stats").innerHTML = tablaEstadisticas(e);
    document.querySelector(`[data-orden="${orden.col}"]`)?.focus();
  } else if (t.dataset.jugador) {
    const d = document.getElementById("ficha");
    d.innerHTML = ficha(e, t.dataset.jugador);
    d.showModal();
  } else document.getElementById("ficha").close();
});
// Cerrar la ficha pulsando fuera de ella
app.addEventListener("click", (ev) => { if (ev.target.id === "ficha") ev.target.close(); });

document.getElementById("pie-datos").innerHTML = `${esc(CLUB.estadio)} · ${esc(CLUB.direccion)}<br>
  <a href="tel:+34${CLUB.telefono.replace(/\s/g, "")}">${esc(CLUB.telefono)}</a> · <a href="mailto:${CLUB.email}">${CLUB.email}</a> · <a href="${CLUB.instagram}" target="_blank" rel="noopener">@cdboirooficial</a>`;
document.getElementById("pie-fuente").innerHTML = `Partidos, clasificaciones y estadísticas de la <a href="${CLUB.futgal}" target="_blank" rel="noopener">Real Federación Galega de Fútbol</a>${typeof ACTUALIZADO === "string" ? `, actualizados el ${esc(new Date(ACTUALIZADO).toLocaleString("es-ES", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }))}` : ""}.`;

addEventListener("hashchange", render);
render();
