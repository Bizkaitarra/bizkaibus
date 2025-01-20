<?php

// JSON en una cadena
$jsonString = file_get_contents('paradas_metro_ori.json');

// Decodificar el JSON a un array asociativo
$data = json_decode($jsonString, true);

// Inicializar el array para almacenar las estaciones
$stations = [];

// Recorrer las estaciones en "hydra:member"
foreach ($data['hydra:member'] as $station) {
    // Agregar los datos necesarios al array de estaciones
    $stations[] = [
        'Code' => $station['code'],
        'Name' => $station['name'],
        'Lines' => implode(', ', $station['line']) // Convertir las líneas en una cadena separada por comas
    ];
}

// Imprimir el resultado (opcional)
file_put_contents('paradas_metro.json', json_encode($stations));
