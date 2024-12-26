document.addEventListener('DOMContentLoaded', function () {
    const loadStopsButton = document.getElementById('loadStops');
    const stopsList = document.getElementById('stopsList');

    loadStopsButton.addEventListener('click', async function () {
        const url = "https://apli.bizkaia.net/APPS/DANOK/TQWS/TQ.ASMX/GetParadasMunicipio_JSON?callback=%22%22&iCodigoProvincia=48&iCodigoMunicipio=015";
        try {
            const response = await fetch(url, { method: 'GET' });
            const text = await response.text();

            // Limpiar y analizar el JSON
            let cleanedText = text.replace('""(', '');
            cleanedText = cleanedText.replace(');', '');
            cleanedText = cleanedText.replace(/'/g, '"');
            const jsonData = JSON.parse(cleanedText);

            if (jsonData?.Consulta?.Paradas) {
                stopsList.innerHTML = jsonData.Consulta.Paradas.map(stop => `
                    <div class="stop-card">
                        <h3>${stop.CODIGOREDUCIDOPARADA} - ${stop.DENOMINACION}</h3>
                        <p><strong>Dirección:</strong> ${stop.DIRECCION}</p>
                        <p><strong>Municipio:</strong> ${stop.DESCRIPCION_MUNICIPIO}</p>
                    </div>
                `).join('');
            } else {
                stopsList.innerHTML = '<p>No se encontraron paradas.</p>';
            }
        } catch (error) {
            console.error('Error al cargar las paradas:', error);
            stopsList.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });
});
