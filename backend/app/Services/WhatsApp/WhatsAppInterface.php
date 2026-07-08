<?php
namespace App\Services\WhatsApp;

interface WhatsAppInterface
{
    public function sendMessage($to, $message);
}
