<?php
// filepath: c:\Users\tiago\OneDrive\Documenten\GitHub\examenproject\api.php
header('Content-Type: application/json');
$file = 'savedCustomers.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo '{}';
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    file_put_contents($file, $json);
    echo '{"status":"ok"}';
    exit;
}
?>