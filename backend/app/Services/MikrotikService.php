<?php

namespace App\Services;

use RouterosAPI;
use Exception;
use Illuminate\Support\Facades\Log;

class MikrotikService
{
    protected $client;
    protected $connected = false;

    public function __construct()
    {
        $this->client = new RouterosAPI();
        $this->client->timeout = 3;
    }

    public function connect($host, $user, $password, $port = 8728)
    {
        if ($this->client->connect($host, $user, $password, $port)) {
            $this->connected = true;
            return true;
        }

        Log::error("Failed connecting to MikroTik", ['host' => $host]);
        throw new Exception("Koneksi ke MikroTik gagal ($host).");
    }

    public function disconnect()
    {
        if ($this->connected) {
            $this->client->disconnect();
            $this->connected = false;
        }
    }

    public function getSystemResource()
    {
        if (!$this->connected) throw new Exception("Not connected");
        $this->client->write('/system/resource/print');
        return $this->client->read();
    }

    public function addPppoeSecret($name, $password, $profile, $service = 'pppoe')
    {
        if (!$this->connected) throw new Exception("Not connected");
        $this->client->comm("/ppp/secret/add", [
            "name"     => $name,
            "password" => $password,
            "profile"  => $profile,
            "service"  => $service,
        ]);
        return true;
    }

    public function disablePppoeSecret($name)
    {
        if (!$this->connected) throw new Exception("Not connected");
        // Cari ID dulu
        $this->client->write('/ppp/secret/print', false);
        $this->client->write('?name='.$name);
        $users = $this->client->read();

        if (count($users) > 0) {
            $this->client->comm("/ppp/secret/disable", [
                ".id" => $users[0]['.id'],
            ]);
            
            // Putuskan koneksi aktif
            $this->client->write('/ppp/active/print', false);
            $this->client->write('?name='.$name);
            $active = $this->client->read();
            if (count($active) > 0) {
                $this->client->comm("/ppp/active/remove", [
                    ".id" => $active[0]['.id'],
                ]);
            }
            return true;
        }
        return false;
    }

    public function enablePppoeSecret($name)
    {
        if (!$this->connected) throw new Exception("Not connected");
        $this->client->write('/ppp/secret/print', false);
        $this->client->write('?name='.$name);
        $users = $this->client->read();

        if (count($users) > 0) {
            $this->client->comm("/ppp/secret/enable", [
                ".id" => $users[0]['.id'],
            ]);
            return true;
        }
        return false;
    }
    
    public function __destruct()
    {
        $this->disconnect();
    }
}
