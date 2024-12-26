document.addEventListener('DOMContentLoaded', function () {
    const paradas = [
        '2404',
        '0273',
        '0280',
        '0299',
        '0276',
        '0294'
    ];

    fetchAndDisplayStops(paradas);
    // Configura la actualización automática cada 30 segundos
    setInterval(() => fetchAndDisplayStops(paradas), 30000);
});

async function fetchAndDisplayStops(paradas) {
    const newStopsElement = document.createElement('div');
    newStopsElement.className = 'row gy-3';
    for (const parada of paradas) {
        const url = `https://apli.bizkaia.net/APPS/DANOK/TQWS/TQ.ASMX/GetPasoParadaMobile_JSON?callback=%22%22&strLinea=&strParada=${parada}`;
        try {
            const response = await fetch(url, {method: 'GET'});
            const text = await response.text();
            let cleanedText = text.replace('""(', '');
            cleanedText = cleanedText.replace(');', '');
            cleanedText = cleanedText.replace(/'/g, '"');
            const jsonData = JSON.parse(cleanedText);
            const data = jsonData.Resultado;
            // Muestra los próximos autobuses en pantalla
            appendStops(data, newStopsElement);
        } catch (e) {
            console.error("Error procesando datos:", e);
        }
    }
    const container = document.getElementById('stop-list');
    container.innerHTML = '';
    container.appendChild(newStopsElement);
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
        const e1Minutos = paso.getElementsByTagName('e1')[0]?.getElementsByTagName('minutos')[0]?.textContent || 'N/A';
        const e2Minutos = paso.getElementsByTagName('e2')[0]?.getElementsByTagName('minutos')[0]?.textContent || 'N/A';

        // Card individual para cada autobús
        cards += `
            <div class="mb-3"> <!-- Aquí usamos col-md-4 para tres por fila -->
                <div class="card border-light">
                    <div class="card-body p-2">
                        <h6 class="card-title mb-1"><strong>Línea:</strong> ${linea} - ${ruta}</h6>
                        <p class="card-text mb-0">
                            <span class="badge bg-success">Próximo: ${e1Minutos} min</span>
                            <span class="badge bg-secondary">Siguiente: ${e2Minutos} min</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    return cards;
}




