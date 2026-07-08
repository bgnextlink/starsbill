<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;
use Illuminate\Support\Facades\Log;

class GenieAcsService
{
    protected $url;
    protected $user;
    protected $pass;

    public function __construct()
    {
        $this->url = env('GENIEACS_URL', 'http://127.0.0.1:7557');
        $this->user = env('GENIEACS_USER');
        $this->pass = env('GENIEACS_PASS');
    }

    protected function client()
    {
        return Http::withBasicAuth($this->user, $this->pass)
                   ->baseUrl($this->url)
                   ->timeout(10);
    }

    public function getDevice($deviceId)
    {
        $response = $this->client()->get("/devices", [
            'query' => json_encode(['_id' => $deviceId])
        ]);

        if (!$response->successful()) {
            throw new Exception("GenieACS: Failed to get device.");
        }

        return $response->json();
    }

    public function rebootDevice($deviceId)
    {
        $payload = [
            "name" => "reboot",
            "device" => $deviceId
        ];

        $response = $this->client()->post("/tasks", $payload);

        if (!$response->successful()) {
            throw new Exception("GenieACS: Failed to dispatch reboot task.");
        }

        return $response->json();
    }

    public function refreshDevice($deviceId)
    {
        $payload = [
            "name" => "refreshObject",
            "objectName" => "",
            "device" => $deviceId
        ];

        $response = $this->client()->post("/tasks", $payload);

        if (!$response->successful()) {
            Log::error("GenieACS Refresh Error", ['response' => $response->body()]);
            throw new Exception("GenieACS: Failed to refresh device.");
        }

        return $response->json();
    }
}
