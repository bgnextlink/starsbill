<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
// UPDATE THESE CREDENTIALS ACCORDING TO YOUR CYBERPANEL / CPANEL SETTINGS
$host = 'localhost';
$user = 'root';
$password = ''; // Change this
$database = 'starbilling'; // Change this

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Koneksi database gagal: " . $conn->connect_error]);
    exit();
}

// Simple Router
$request_uri = $_SERVER['REQUEST_URI'];
// remove query string
$uri_parts = explode('?', $request_uri);
$path = $uri_parts[0];

// get the path after /api/
// e.g. /api/customers/1 -> customers/1
$base_path = '/api/';
$pos = strpos($path, $base_path);
if ($pos !== false) {
    $route = substr($path, $pos + strlen($base_path));
} else {
    // Fallback if not matching /api/
    $route = ltrim(parse_url($request_uri, PHP_URL_PATH), '/');
    $route = preg_replace('/^api\//', '', $route);
}

$route_parts = explode('/', trim($route, '/'));
$resource = $route_parts[0];
$id = isset($route_parts[1]) ? intval($route_parts[1]) : null;

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function respond($data) {
    echo json_encode($data);
    exit();
}

function respondError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(["error" => $msg]);
    exit();
}

if ($resource === 'customers') {
    if ($method === 'GET') {
        $result = $conn->query("SELECT * FROM customers ORDER BY id DESC");
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        respond(["data" => $data]);
    } 
    elseif ($method === 'POST') {
        if (!$input) respondError("Data kosong");
        
        // Simple mapping, sanitize properly in production
        $fields = [];
        $values = [];
        $types = "";
        $params = [];
        
        foreach ($input as $key => $val) {
            if ($key !== 'id') { // don't insert id
                $fields[] = "`$key`";
                $values[] = "?";
                $types .= is_int($val) ? "i" : "s";
                $params[] = $val;
            }
        }
        
        $sql = "INSERT INTO customers (" . implode(", ", $fields) . ") VALUES (" . implode(", ", $values) . ")";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            $input['id'] = $conn->insert_id;
            respond(["data" => $input]);
        } else {
            respondError($stmt->error, 500);
        }
    }
    elseif ($method === 'PUT' && $id) {
        if (!$input) respondError("Data kosong");
        
        $sets = [];
        $types = "";
        $params = [];
        
        foreach ($input as $key => $val) {
            if ($key !== 'id') {
                $sets[] = "`$key` = ?";
                $types .= is_int($val) ? "i" : "s";
                $params[] = $val;
            }
        }
        
        $types .= "i";
        $params[] = $id;
        
        $sql = "UPDATE customers SET " . implode(", ", $sets) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            $input['id'] = $id;
            respond(["data" => $input]);
        } else {
            respondError($stmt->error, 500);
        }
    }
    elseif ($method === 'DELETE' && $id) {
        $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            respond(["success" => true]);
        } else {
            respondError($stmt->error, 500);
        }
    }
}
elseif ($resource === 'routers') {
    if ($method === 'GET') {
        $result = $conn->query("SELECT * FROM routers ORDER BY id DESC");
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        respond(["data" => $data]);
    } 
    elseif ($method === 'POST') {
        // Similar to customers POST
        $fields = []; $values = []; $types = ""; $params = [];
        foreach ($input as $key => $val) {
            if ($key !== 'id') {
                $fields[] = "`$key`"; $values[] = "?";
                $types .= is_int($val) ? "i" : "s"; $params[] = $val;
            }
        }
        $sql = "INSERT INTO routers (" . implode(", ", $fields) . ") VALUES (" . implode(", ", $values) . ")";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute()) {
            $input['id'] = $conn->insert_id;
            respond(["data" => $input]);
        } else respondError($stmt->error, 500);
    }
    elseif ($method === 'PUT' && $id) {
        $sets = []; $types = ""; $params = [];
        foreach ($input as $key => $val) {
            if ($key !== 'id') {
                $sets[] = "`$key` = ?";
                $types .= is_int($val) ? "i" : "s"; $params[] = $val;
            }
        }
        $types .= "i"; $params[] = $id;
        $sql = "UPDATE routers SET " . implode(", ", $sets) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute()) {
            $input['id'] = $id;
            respond(["data" => $input]);
        } else respondError($stmt->error, 500);
    }
    elseif ($method === 'DELETE' && $id) {
        $stmt = $conn->prepare("DELETE FROM routers WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) respond(["success" => true]);
        else respondError($stmt->error, 500);
    }
}
elseif ($resource === 'invoices') {
    if ($method === 'GET') {
        $result = $conn->query("SELECT * FROM invoices ORDER BY id DESC");
        $data = [];
        while($row = $result->fetch_assoc()) $data[] = $row;
        respond(["data" => $data]);
    }
}
elseif ($resource === 'tickets') {
    if ($method === 'GET') {
        $result = $conn->query("SELECT * FROM tickets ORDER BY id DESC");
        $data = [];
        while($row = $result->fetch_assoc()) $data[] = $row;
        respond(["data" => $data]);
    }
}

// Fallback
respondError("Route not found: " . $route, 404);
