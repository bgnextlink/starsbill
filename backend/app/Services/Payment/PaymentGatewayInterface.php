<?php
namespace App\Services\Payment;

interface PaymentGatewayInterface
{
    public function createTransaction($invoiceId, $amount, $customerDetails);
    public function checkStatus($referenceId);
}
