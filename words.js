// A small starter set of common Spanish nouns for the "Word of the Day" panel.
// Each entry: the word, its article (for gender), an English translation,
// and an example sentence with translation. Feel free to expand this list —
// the picker below will automatically include any new entries.
const SPANISH_NOUNS = [
  { word: "el aire",     translation: "the air",       example: "El aire de Santiago está limpio hoy.",        exampleTranslation: "The air in Santiago is clean today." },
  { word: "la montaña",  translation: "the mountain",  example: "Se puede ver la montaña desde mi ventana.",   exampleTranslation: "You can see the mountain from my window." },
  { word: "el cielo",    translation: "the sky",       example: "El cielo está despejado esta mañana.",        exampleTranslation: "The sky is clear this morning." },
  { word: "la ciudad",   translation: "the city",      example: "Santiago es una ciudad muy grande.",          exampleTranslation: "Santiago is a very big city." },
  { word: "el árbol",    translation: "the tree",      example: "Plantaron un árbol nuevo en la plaza.",       exampleTranslation: "They planted a new tree in the square." },
  { word: "la lluvia",   translation: "the rain",      example: "La lluvia ayuda a limpiar el aire.",          exampleTranslation: "The rain helps clean the air." },
  { word: "el viento",   translation: "the wind",      example: "El viento dispersa la contaminación.",       exampleTranslation: "The wind disperses the pollution." },
  { word: "la salud",    translation: "the health",    example: "Cuidar el aire es cuidar la salud.",          exampleTranslation: "Taking care of the air is taking care of health." },
  { word: "el parque",   translation: "the park",      example: "Caminamos por el parque por la tarde.",       exampleTranslation: "We walked through the park in the afternoon." },
  { word: "la mañana",   translation: "the morning",   example: "El aire suele estar mejor en la mañana.",     exampleTranslation: "The air is usually better in the morning." },
  { word: "el invierno", translation: "the winter",    example: "El invierno trae más smog a la ciudad.",      exampleTranslation: "Winter brings more smog to the city." },
  { word: "la bicicleta",translation: "the bicycle",   example: "Ir en bicicleta es bueno para el aire.",      exampleTranslation: "Riding a bicycle is good for the air." },
  { word: "el sol",      translation: "the sun",       example: "El sol brilla sobre la cordillera.",          exampleTranslation: "The sun shines over the mountain range." },
  { word: "la nube",     translation: "the cloud",     example: "Una nube gris cubre el centro hoy.",          exampleTranslation: "A gray cloud covers downtown today." },
  { word: "el río",      translation: "the river",     example: "El río Mapocho cruza la ciudad.",             exampleTranslation: "The Mapocho River crosses the city." },
  { word: "el cóndor",   translation: "the condor",    example: "El cóndor es un símbolo de Chile.",           exampleTranslation: "The condor is a symbol of Chile." },
];

// Picks the same word for everyone on a given calendar day (in Santiago's
// timezone), and a different one each day — no server or storage needed.
function wordOfTheDay(date = new Date()) {
  const santiagoDateStr = date.toLocaleDateString("en-CA", { timeZone: "America/Santiago" }); // "YYYY-MM-DD"
  let hash = 0;
  for (let i = 0; i < santiagoDateStr.length; i++) {
    hash = (hash * 31 + santiagoDateStr.charCodeAt(i)) >>> 0;
  }
  const index = hash % SPANISH_NOUNS.length;
  return { ...SPANISH_NOUNS[index], dateLabel: santiagoDateStr };
}

function renderWordOfTheDay() {
  const el = document.getElementById("word-of-day");
  if (!el) return;

  const entry = wordOfTheDay();
  el.innerHTML = `
    <div class="word-card">
      <span class="word-date">${entry.dateLabel} (Santiago time)</span>
      <span class="word-main">${entry.word}</span>
      <span class="word-translation">${entry.translation}</span>
      <p class="word-example">“${entry.example}”<br/><span class="word-example-translation">${entry.exampleTranslation}</span></p>
    </div>
  `;
}
