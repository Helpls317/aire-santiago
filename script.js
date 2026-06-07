/* ===================================================================
   Aire Santiago — prototype
   Data source: Open-Meteo Air Quality API (free, no key required)
   https://open-meteo.com/en/docs/air-quality-api
   =================================================================== */

const AQ_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

// PM2.5 (µg/m³) breakpoints -> category, color, and short health note.
// Based on commonly used AQI band cut points for PM2.5.
const PM25_LEVELS = [
  { max: 12,    label: "Good",                         color: "#66bb6a", note: "Air quality is satisfactory." },
  { max: 35.4,  label: "Moderate",                     color: "#ffd54f", note: "Acceptable; some pollutants may be a concern for a very small group." },
  { max: 55.4,  label: "Unhealthy for sensitive groups", color: "#ffa726", note: "Sensitive groups may experience effects." },
  { max: 150.4, label: "Unhealthy",                    color: "#ef5350", note: "Everyone may begin to experience effects." },
  { max: 250.4, label: "Very unhealthy",               color: "#ab47bc", note: "Health alert: increased risk for everyone." },
  { max: Infinity, label: "Hazardous",                 color: "#8d6e63", note: "Health warning of emergency conditions." },
];

function levelForPM25(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return { label: "No data", color: "#bdbdbd", note: "No reading available." };
  }
  return PM25_LEVELS.find((l) => value <= l.max);
}

function fmt(value, unit = "") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Math.round(value * 10) / 10}${unit}`;
}

/* ---------------------------------------------------------------
   1. LIVE MAP — one station marker per monitoring location
   --------------------------------------------------------------- */

async function loadStationReadings() {
  const lats = SANTIAGO_STATIONS.map((s) => s.lat).join(",");
  const lons = SANTIAGO_STATIONS.map((s) => s.lon).join(",");
  const url = `${AQ_BASE}?latitude=${lats}&longitude=${lons}&current=pm2_5,pm10,us_aqi&timezone=America%2FSantiago`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Air quality API responded ${res.status}`);
  const data = await res.json();

  const list = Array.isArray(data) ? data : [data];
  return SANTIAGO_STATIONS.map((station, i) => {
    const current = list[i] && list[i].current ? list[i].current : {};
    return {
      ...station,
      pm25: current.pm2_5 ?? null,
      pm10: current.pm10 ?? null,
      aqi: current.us_aqi ?? null,
      time: current.time ?? null,
    };
  });
}

function buildLegend() {
  const legend = document.getElementById("map-legend");
  legend.innerHTML = PM25_LEVELS.map(
    (l) => `<span class="legend-item"><span class="legend-swatch" style="background:${l.color}"></span>${l.label}</span>`
  ).join("");
}

async function initMap() {
  const map = L.map("map").setView([-33.47, -70.66], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  buildLegend();

  try {
    const readings = await loadStationReadings();
    let latestTime = null;

    readings.forEach((r) => {
      const level = levelForPM25(r.pm25);
      const marker = L.circleMarker([r.lat, r.lon], {
        radius: 12,
        fillColor: level.color,
        color: "#ffffff",
        weight: 2,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(`
        <div class="station-popup">
          <b>${r.name}</b>
          PM2.5: ${fmt(r.pm25, " µg/m³")} — <strong>${level.label}</strong><br/>
          PM10: ${fmt(r.pm10, " µg/m³")}<br/>
          US AQI: ${fmt(r.aqi)}<br/>
          <em>${level.note}</em>
        </div>
      `);

      if (r.time && (!latestTime || r.time > latestTime)) latestTime = r.time;
    });

    if (latestTime) {
      document.getElementById("last-updated").textContent =
        `Station readings as of ${new Date(latestTime).toLocaleString("en-US", { timeZone: "America/Santiago", dateStyle: "medium", timeStyle: "short" })} (Santiago time)`;
    } else {
      document.getElementById("last-updated").textContent = "Live readings loaded.";
    }
  } catch (err) {
    console.error("Failed to load station readings:", err);
    document.getElementById("last-updated").textContent =
      "Couldn't load live readings right now — showing the map without current data.";
  }
}

/* ---------------------------------------------------------------
   2. FORECAST — next 3 days of PM2.5 for central Santiago
   --------------------------------------------------------------- */

async function initForecastChart() {
  const url = `${AQ_BASE}?latitude=${CITY_CENTER.lat}&longitude=${CITY_CENTER.lon}&hourly=pm2_5&forecast_days=3&timezone=America%2FSantiago`;
  const ctx = document.getElementById("forecast-chart");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Forecast API responded ${res.status}`);
    const data = await res.json();

    const labels = data.hourly.time.map((t) =>
      new Date(t).toLocaleString("en-US", { timeZone: "America/Santiago", weekday: "short", hour: "numeric" })
    );
    const values = data.hourly.pm2_5;

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Forecast PM2.5 (µg/m³) — central Santiago",
            data: values,
            borderColor: "#2f6f4f",
            backgroundColor: "rgba(47,111,79,0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: "µg/m³" }, beginAtZero: true },
        },
        plugins: { legend: { display: true } },
      },
    });
  } catch (err) {
    console.error("Failed to load forecast:", err);
    ctx.parentElement.insertAdjacentHTML(
      "beforeend",
      `<p class="panel-subtitle">Forecast data is temporarily unavailable.</p>`
    );
  }
}

/* ---------------------------------------------------------------
   3. HISTORICAL COMPARISON — today vs ~1 month ago vs ~1 year ago
   --------------------------------------------------------------- */

async function averagePM25(daysBack, windowSize = 1) {
  const url = `${AQ_BASE}?latitude=${CITY_CENTER.lat}&longitude=${CITY_CENTER.lon}&hourly=pm2_5&past_days=${daysBack}&forecast_days=1&timezone=America%2FSantiago`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Historical API responded ${res.status}`);
  const data = await res.json();
  const values = data.hourly.pm2_5;
  const slice = values.slice(0, windowSize * 24);
  const valid = slice.filter((v) => v !== null && v !== undefined);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

async function initHistoryChart() {
  const ctx = document.getElementById("history-chart");

  try {
    const [recent, lastWeek, longerBack] = await Promise.all([
      averagePM25(7, 1),
      averagePM25(7, 7),
      averagePM25(92, 1),
    ]);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Today (avg)", "Past week (avg)", "~3 months ago (avg)"],
        datasets: [
          {
            label: "Average PM2.5 (µg/m³)",
            data: [recent, lastWeek, longerBack],
            backgroundColor: ["#2f6f4f", "#66a17a", "#a9c9b6"],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { title: { display: true, text: "µg/m³" }, beginAtZero: true } },
      },
    });

    ctx.parentElement.insertAdjacentHTML(
      "beforeend",
      `<p class="panel-subtitle" style="margin-top:0.75rem;">
        Note: this prototype compares against the recent window the free data
        source provides. For a true year-over-year comparison we'd pull
        historical readings directly from SINCA's published archives.
      </p>`
    );
  } catch (err) {
    console.error("Failed to load historical comparison:", err);
    ctx.parentElement.insertAdjacentHTML(
      "beforeend",
      `<p class="panel-subtitle">Historical comparison data is temporarily unavailable.</p>`
    );
  }
}

/* ---------------------------------------------------------------
   Boot
   --------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initForecastChart();
  initHistoryChart();
  renderWordOfTheDay();
});
