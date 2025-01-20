<?php
// Ruta del archivo de texto
$inputFile = "paradas.txt";
$outputFile = "paradas.json";
$parsedStopsFile = "paradas.json";

try {
    // Leer el contenido del archivo
    $fileContent = file_get_contents($inputFile);

    if ($fileContent === false) {
        throw new Exception("No se pudo leer el archivo $inputFile");
    }

    // Limpiar y corregir el contenido para que sea JSON válido
    $fileContent = trim($fileContent, "\"()"); // Eliminar comillas y paréntesis externos

    // Reemplazar comillas simples por comillas dobles para cumplir con JSON
    $fileContent = str_replace("'", '"', $fileContent);
    $fileContent = str_replace(";", '', $fileContent);
    $fileContent = substr($fileContent, 0, strlen($fileContent) -1);
file_put_contents('a.json',  $fileContent);
    // Decodificar el JSON
    $jsonData = json_decode($fileContent, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Error al decodificar JSON: " . json_last_error_msg());
    }

    // Guardar el JSON completo en un archivo
    file_put_contents($outputFile, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Extraer solo las paradas
    if (isset($jsonData['Consulta']['Paradas'])) {
        $stops = $jsonData['Consulta']['Paradas'];
        $parsedStops = [];
        foreach ($stops as $stop) {
            $parsedStops[] = [
                'PROVINCIA' => $stop['PROVINCIA'],
                'DESCRIPCION_PROVINCIA' => $stop['DESCRIPCION_PROVINCIA'],
                'MUNICIPIO' => $stop['MUNICIPIO'],
                'DESCRIPCION_MUNICIPIO' => $stop['DESCRIPCION_MUNICIPIO'],
                'PARADA' => $stop['CODIGOREDUCIDOPARADA'],
                'DENOMINACION' => $stop['DENOMINACION'],
            ];
        }
        file_put_contents($parsedStopsFile, json_encode($parsedStops, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    } else {
        throw new Exception("No se encontraron paradas en los datos proporcionados");
    }

    echo "Proceso completado. JSON completo guardado en '$outputFile'. Paradas guardadas en '$parsedStopsFile'.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
