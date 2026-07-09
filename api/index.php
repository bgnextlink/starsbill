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

// For nested resources like settings/wa-gateway
if ($resource === 'settings' && isset($route_parts[1])) {
    $resource = $route_parts[0] . '/' . $route_parts[1];
    $id = isset($route_parts[2]) ? intval($route_parts[2]) : null;
} else if ($resource === 'acs' && isset($route_parts[1])) {
    $resource = $route_parts[0] . '/' . $route_parts[1];
    $id = isset($route_parts[2]) ? intval($route_parts[2]) : null;
} else {
    $id = isset($route_parts[1]) ? intval($route_parts[1]) : null;
}

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

function handleCrud($conn, $table, $method, $id, $input) {
    if ($method === 'GET') {
        $result = $conn->query("SELECT * FROM $table ORDER BY id DESC");
        $data = [];
        if ($result) {
            while($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        respond(["data" => $data]);
    } 
    elseif ($method === 'POST') {
        if (!$input) respondError("Data kosong");
        $fields = []; $values = []; $types = ""; $params = [];
        foreach ($input as $key => $val) {
            if ($key !== 'id') {
                $fields[] = "`$key`"; $values[] = "?";
                $types .= is_int($val) ? "i" : "s"; $params[] = $val;
            }
        }
        $sql = "INSERT INTO $table (" . implode(", ", $fields) . ") VALUES (" . implode(", ", $values) . ")";
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            if ($stmt->execute()) {
                $input['id'] = $conn->insert_id;
                respond(["data" => $input]);
            } else respondError($stmt->error, 500);
        } else {
            respondError($conn->error, 500);
        }
    }
    elseif ($method === 'PUT' && $id) {
        if (!$input) respondError("Data kosong");
        $sets = []; $types = ""; $params = [];
        foreach ($input as $key => $val) {
            if ($key !== 'id') {
                $sets[] = "`$key` = ?";
                $types .= is_int($val) ? "i" : "s"; $params[] = $val;
            }
        }
        $types .= "i"; $params[] = $id;
        $sql = "UPDATE $table SET " . implode(", ", $sets) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            if ($stmt->execute()) {
                $input['id'] = $id;
                respond(["data" => $input]);
            } else respondError($stmt->error, 500);
        } else {
            respondError($conn->error, 500);
        }
    }
    elseif ($method === 'DELETE' && $id) {
        $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) respond(["success" => true]);
            else respondError($stmt->error, 500);
        } else {
            respondError($conn->error, 500);
        }
    }
}

if ($resource === 'customers') {
    handleCrud($conn, 'customers', $method, $id, $input);
}
elseif ($resource === 'routers') {
    handleCrud($conn, 'routers', $method, $id, $input);
}
elseif ($resource === 'invoices') {
    handleCrud($conn, 'invoices', $method, $id, $input);
}
elseif ($resource === 'tickets') {
    handleCrud($conn, 'tickets', $method, $id, $input);
}
elseif ($resource === 'settings/wa-gateway') {
    if ($method === 'GET') {
        $result = $conn->query("SELECT * FROM wa_settings ORDER BY id ASC LIMIT 1");
        $data = [];
        if ($result && $result->num_rows > 0) {
            $data[] = $result->fetch_assoc();
        } else {
            // default if empty
            $data[] = ["id" => 1, "api_endpoint" => "http://localhost:8000/send-message"];
        }
        respond(["data" => $data]);
    } elseif ($method === 'PUT') {
        $id = 1;
        // check if exists
        $result = $conn->query("SELECT id FROM wa_settings WHERE id = 1");
        if ($result && $result->num_rows === 0) {
            $conn->query("INSERT INTO wa_settings (id, api_endpoint) VALUES (1, 'http://localhost:8000/send-message')");
        }
        
        $sets = []; $types = ""; $params = [];
        foreach ($input as $key => $val) {
            if ($key !== 'id') {
                $sets[] = "`$key` = ?";
                $types .= is_int($val) ? "i" : "s"; $params[] = $val;
            }
        }
        $types .= "i"; $params[] = $id;
        $sql = "UPDATE wa_settings SET " . implode(", ", $sets) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            if ($stmt->execute()) {
                $input['id'] = $id;
                respond(["data" => $input]);
            } else respondError($stmt->error, 500);
        } else {
            respondError($conn->error, 500);
        }
    }
}
elseif ($resource === 'acs/servers') {
    handleCrud($conn, 'acs_servers', $method, $id, $input);
}
elseif ($resource === 'acs/devices') {
    if ($method === 'GET') {
        respond(["data" => []]); // mock for ACS devices since it usually hits external API
    }
}

// Fallback
respondError("Route not found: " . $route, 404);
