// Approximate locations of Santiago's official MACAM-RM air quality monitoring
// stations (SINCA / Ministerio del Medio Ambiente network), placed at the
// comuna centers they represent. Coordinates are approximate — for an exact
// deployment we'd cross-check against SINCA's published station metadata.
const SANTIAGO_STATIONS = [
  { id: "independencia", name: "Independencia",      lat: -33.4186, lon: -70.6649 },
  { id: "la_florida",    name: "La Florida",         lat: -33.5230, lon: -70.5950 },
  { id: "las_condes",    name: "Las Condes",         lat: -33.4089, lon: -70.5693 },
  { id: "parque_ohiggins", name: "Parque O'Higgins", lat: -33.4640, lon: -70.6580 },
  { id: "pudahuel",      name: "Pudahuel",           lat: -33.4430, lon: -70.7560 },
  { id: "cerrillos",     name: "Cerrillos",          lat: -33.4940, lon: -70.7160 },
  { id: "el_bosque",     name: "El Bosque",          lat: -33.5630, lon: -70.6740 },
  { id: "cerro_navia",   name: "Cerro Navia",        lat: -33.4220, lon: -70.7330 },
  { id: "puente_alto",   name: "Puente Alto",        lat: -33.6110, lon: -70.5760 },
  { id: "quilicura",     name: "Quilicura",          lat: -33.3630, lon: -70.7300 },
  { id: "talagante",     name: "Talagante",          lat: -33.6630, lon: -70.9290 },
];

// Reference point used for the city-wide forecast & historical panels
// (central Santiago / Parque O'Higgins station).
const CITY_CENTER = { lat: -33.4640, lon: -70.6580, label: "Central Santiago" };
