# Product

## Stack

HTML, CSS y JavaScript estáticos, sin frameworks (base: monta-web). Los datos de la federación los genera `actualizar.py` en `federacion.js`; `escudos.py` guarda los escudos de los rivales sin fondo. GitHub Actions lo ejecuta cada hora y Vercel vuelve a publicar.

## Club

- Club Deportivo Boiro. Primer equipo en Tercera Federación, Grupo 1. Estadio: Campo Municipal de Barraña.
- futgal: C.D. Boiro = club 1097 (primer equipo + Juvenil Liga Nacional). Cantera = E.F.M. Concello de Boiro, club 3530101 (el C.D. Boiro figura en futgal como su patrocinador).
- Colores: azul y blanco (camiseta 26/27 blanca con trama celeste; portero negro y verde). Acento: rojo del escudo.
- Tipografías: Bricolage Grotesque (títulos) y Nunito (texto), servidas desde /fonts.

## Secciones

1. Inicio: carrusel horizontal con una tarjeta por equipo (próximo partido + resultado de la jornada pasada); la del primer equipo, más grande y con cuenta atrás.
2. Primer equipo: plantilla (camisetas de espaldas con nombre y dorsal, ficha con estadísticas), estadísticas, clasificación y partidos.
3. Cantera: equipos por categoría.
4. Noticias y socios.

## Reglas

- Orden de equipos en toda la web: Primer equipo, Juvenil A (C.D. Boiro), Juvenil B, C…, Cadete, Infantil, Alevín, Benjamín, Prebenjamín, Femenino (`CATEGORIAS` en data.js).
- Sin fotos ni plantillas de menores: en la cantera solo partidos, clasificación y entrenadores.
- No inventar datos: noticias y precios salen del Instagram @cdboirooficial.
- Pendiente del club: escudo en alta calidad (el actual es el de futgal, 100×121 px ampliado).
