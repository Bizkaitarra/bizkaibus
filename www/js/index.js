document.addEventListener('DOMContentLoaded', function () {
    const paradas = [
        '0299',
        '0276',
        '0294',
        '2404',
        '0273',
        '0280',
    ];

    // Mostrar spinner durante la carga inicial
    showSpinner();

    // Cargar y mostrar paradas
    fetchAndDisplayStops(paradas)
        .then(() => hideSpinner()); // Ocultar spinner al finalizar la carga inicial

    // Configura la actualización automática cada 30 segundos
    setInterval(() => fetchAndDisplayStops(paradas), 30000);
});

async function fetchAndDisplayStops(paradas) {
    const newStopsElement = document.createElement('div');
    newStopsElement.className = 'row gy-3';

    // Hacer todas las llamadas a la API en paralelo
    const fetchPromises = paradas.map(parada => fetchStopData(parada));
    try {
        const results = await Promise.all(fetchPromises);
        results.forEach(data => appendStops(data, newStopsElement));
    } catch (e) {
        console.error("Error procesando datos:", e);
    }

    const container = document.getElementById('stop-list');
    container.innerHTML = '';
    container.appendChild(newStopsElement);
}

// Función para hacer una llamada a la API
async function fetchStopData(parada) {
    const url = `https://apli.bizkaia.net/APPS/DANOK/TQWS/TQ.ASMX/GetPasoParadaMobile_JSON?callback=%22%22&strLinea=&strParada=${parada}`;
    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();
    let cleanedText = text.replace('""(', '').replace(');', '').replace(/'/g, '"');
    const jsonData = JSON.parse(cleanedText);
    return jsonData.Resultado;
}

function appendStops(xmlData, container) {
    // Parsear el XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");

    // Obtener denominación de la parada
    const denominacionParada = xmlDoc.getElementsByTagName('DenominacionParada')[0]?.textContent || 'Parada desconocida';

    // Crear la ficha principal de la parada
    const stopCard = document.createElement('div');
    stopCard.className = 'card shadow-sm col-md-3'; // Para la parada principal
    stopCard.innerHTML = `
        <div class="card-header bg-danger text-white">
            <h5 class="mb-1">${denominacionParada}</h5>
        </div>
        <div class="card-body">
            <div class="row"> <!-- Contenedor para las tarjetas de buses -->
                ${generateBusCards(xmlDoc)} 
            </div>
        </div>
    `;
    container.appendChild(stopCard);
    const separator = document.createElement('div');
    separator.className = 'col-md-1';
    container.appendChild(separator);
}

// Generar tarjetas individuales para cada autobús
function generateBusCards(xmlDoc) {
    const pasosParada = xmlDoc.getElementsByTagName('PasoParada');
    let cards = '';

    for (let i = 0; i < pasosParada.length; i++) {
        const paso = pasosParada[i];
        const linea = paso.getElementsByTagName('linea')[0]?.textContent || 'N/A';
        const ruta = paso.getElementsByTagName('ruta')[0]?.textContent || 'N/A';

        // Obtener tiempos
        const e1Minutos = parseInt(paso.getElementsByTagName('e1')[0]?.getElementsByTagName('minutos')[0]?.textContent || 'N/A', 10);
        const e2Element = paso.getElementsByTagName('e2')[0]?.getElementsByTagName('minutos')[0];

        const e2Minutos = parseInt(e2Element.textContent, 10);
        // Determinar si "Próximo" debe parpadear
        const e1Class = e1Minutos < 4 ? 'blink' : 'd-none';

        // Crear los spans
        const e1Span = `
            <span class="${e1Class}" style="align-items: center;">
                <img src="img/bus.svg" alt="Bus" width="16" height="16" class="me-1">
            </span>
            <span class="badge bg-success">
                
                Próximo: ${e1Minutos} min
            </span>
        `;
        const e2Span = isNaN(e2Minutos) ? '' : `<span class="badge bg-secondary">Siguiente: ${e2Minutos} min</span>`;

        // Card individual para cada autobús
        cards += `
            <div class="mb-3"> <!-- Aquí usamos col-md-4 para tres por fila -->
                <div class="card border-light">
                    <div class="card-body p-2">
                        <h6 class="card-title mb-1">${linea} - ${ruta}</h6>
                        <p class="card-text mb-0">
                            ${e1Span}
                            ${e2Span}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    return cards;
}

// Funciones para mostrar y ocultar el spinner
function showSpinner() {
    document.getElementById('loading-spinner').classList.remove('d-none');
    document.getElementById('stop-list').classList.add('d-none');
}

function hideSpinner() {
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('stop-list').classList.remove('d-none');
}
