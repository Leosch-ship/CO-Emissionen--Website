let allData = [];
let currentSort = {}; // Aktuelle Sortierrichtung pro Spalte

// Hilfsfunktion zum Escapen potenziell gefährlicher Zeichen
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => {
    const escapeChars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return escapeChars[match];
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";
  const navWrapper = document.getElementById("nav-wrapper");
  const navLinks = document.getElementById("nav-links");
  const forest = document.getElementById("forest-deco");

  // Navigation ausrichten je nach Leserichtung
  if (isRTL) {
    navWrapper.style.justifyContent = 'flex-end';
    navLinks.style.direction = 'rtl';
  } else {
    navWrapper.style.justifyContent = 'flex-start';
    navLinks.style.direction = 'ltr';
  }

  // Waldgrafik horizontal spiegeln, wenn RTL
  forest.style.left = isRTL ? '0' : 'auto';
  forest.style.right = isRTL ? 'auto' : '0';
  forest.style.transform = isRTL ? 'scaleX(-1)' : 'scaleX(1)';
});

// Emissionsdaten laden
fetch('data/emissions.json')
  .then(response => response.json())
  .then(data => {
    allData = data;
    setupPage();
    renderTable(data);
  })
  .catch(error => console.error("Fehler beim Laden der Daten:", error));

// HTML-Struktur im <main>-Bereich setzen und Filter-Listener einrichten
function setupPage() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <h2 class="text-xl mb-4">Datenübersicht</h2>
    <label for="filter" class="block mb-2 font-semibold">Suche:</label>
    <input type="text" id="filter" placeholder="Land oder Unternehmen" class="border p-2 mb-4 w-full">
    <div id="table-container"></div>
  `;

  document.getElementById('filter').addEventListener('input', e => {
    const search = e.target.value.toLowerCase();
    const filtered = allData.filter(entry =>
      entry.land.toLowerCase().includes(search) ||
      entry.unternehmen.toLowerCase().includes(search)
    );
    renderTable(filtered);
  });
}

// Tabelle dynamisch erstellen und Daten einfügen
function renderTable(data) {
  const container = document.getElementById("table-container");
  container.innerHTML = ""; // Vorherige Inhalte löschen

  const table = document.createElement("table");
  table.className = "w-full border-collapse shadow-xl rounded overflow-hidden";

  const headers = ["Land", "Unternehmen", "Emissionen (t CO₂)"];
  const headerRow = document.createElement("tr");

  headers.forEach((text, index) => {
    const th = document.createElement("th");
    th.textContent = text;
    th.className = "bg-green-600 text-white p-3 text-sm font-semibold cursor-pointer";

    // Klick auf Spaltenkopf sortiert die Tabelle
    th.addEventListener("click", () => {
      const key = headers[index];
      const direction = currentSort[key] === "asc" ? "desc" : "asc";
      currentSort[key] = direction;

      const sorted = [...data].sort((a, b) => {
        let valA = Object.values(a)[index];
        let valB = Object.values(b)[index];

        if (index === 2) {
          valA = parseInt(valA);
          valB = parseInt(valB);
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }

        if (valA > valB) return direction === "asc" ? 1 : -1;
        if (valA < valB) return direction === "asc" ? -1 : 1;
        return 0;
      });

      renderTable(sorted);
    });

    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  // Datensätze als Tabellenzeilen hinzufügen
  data.forEach((entry, i) => {
    const row = document.createElement("tr");
    row.className = i % 2 === 0
      ? "bg-white"
      : "bg-gray-100 hover:bg-green-50 transition";

    row.innerHTML = `
      <td class="p-3 text-gray-800">${escapeHTML(entry.land)}</td>
      <td class="p-3 text-gray-800">${escapeHTML(entry.unternehmen)}</td>
      <td class="p-3 text-gray-800">${entry.emissionen.toLocaleString()}</td>
    `;

    table.appendChild(row);
  });

  container.appendChild(table);
}

//Unsicher
//document.getElementById("submit").addEventListener("click", () => {
//    const input = document.getElementById("comment").value;
//    document.getElementById("output").innerHTML = `<p>${input}</p>`;
//});

//Sicher
//document.getElementById("submit").addEventListener("click", () => {
//    const input = document.getElementById("comment").value;
//    document.getElementById("output").innerHTML = `<p>${escapeHTML(input)}</p>`;
//});
