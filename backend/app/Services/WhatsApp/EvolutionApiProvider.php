<?php
namespace App\Services\WhatsApp;

use Illuminate\Support\Facades\Http;
use Exception;

class EvolutionApiProvider implements WhatsAppInterface
{
    protected $url;
    protected $apiKey;
    protected $instance;

    public function __construct()
    {
        $this->url = env('WA_GATEWAY_URL');
        $this->apiKey = env('WA_GATEWAY_API_KEY');
        $this->instance = env('WA_GATEWAY_INSTANCE', 'starbilling');
    }

    public function sendMessage($to, $message)
    {
        $response = Http::withHeaders([
            'apikey' => $this->apiKey
        ])->post("{$this->url}/message/sendText/{$this->instance}", [
            'number' => $to,
            'options' => [
                'delay' => 1200,
                'presence' => 'composing'
            ],
            'textMessage' => [
                'text' => $message
            ]
        ]);

        if (!$response->successful()) {
            throw new Exception("Failed to send WA message via Evolution API");
        }

        return $response->json();
    }
}
