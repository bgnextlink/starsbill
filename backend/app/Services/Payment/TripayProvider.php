<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Exception;

class TripayProvider implements PaymentGatewayInterface
{
    protected $apiKey;
    protected $privateKey;
    protected $merchantCode;
    protected $url;

    public function __construct()
    {
        $this->apiKey = env('PAYMENT_GATEWAY_API_KEY');
        $this->privateKey = env('PAYMENT_GATEWAY_PRIVATE_KEY');
        $this->merchantCode = env('PAYMENT_GATEWAY_MERCHANT');
        $this->url = env('PAYMENT_GATEWAY_ENV') === 'production' 
            ? 'https://tripay.co.id/api' 
            : 'https://tripay.co.id/api-sandbox';
    }

    public function createTransaction($invoiceId, $amount, $customerDetails)
    {
        $data = [
            'method'         => 'BRIVA', // Default or dynamic
            'merchant_ref'   => $invoiceId,
            'amount'         => $amount,
            'customer_name'  => $customerDetails['name'],
            'customer_email' => $customerDetails['email'] ?? 'email@domain.com',
            'customer_phone' => $customerDetails['phone'],
            'order_items'    => [
                [
                    'name'        => 'Tagihan Internet ' . $invoiceId,
                    'price'       => $amount,
                    'quantity'    => 1,
                ]
            ],
            'return_url'   => env('APP_URL') . '/payment/success',
            'expired_time' => (time() + (24 * 60 * 60)), // 24 Hours
            'signature'    => hash_hmac('sha256', $this->merchantCode.$invoiceId.$amount, $this->privateKey)
        ];

        $response = Http::withToken($this->apiKey)->post($this->url . '/transaction/create', $data);

        if (!$response->successful()) {
            throw new Exception("Tripay: Failed to create transaction.");
        }

        return $response->json()['data'];
    }

    public function checkStatus($referenceId)
    {
        $payload = ['reference' => $referenceId];
        $response = Http::withToken($this->apiKey)->get($this->url . '/transaction/detail', $payload);

        if (!$response->successful()) {
            throw new Exception("Tripay: Failed to check transaction status.");
        }

        return $response->json()['data'];
    }
}
