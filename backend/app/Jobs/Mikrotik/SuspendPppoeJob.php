<?php

namespace App\Jobs\Mikrotik;

use App\Models\Customer;
use App\Models\Router;
use App\Services\MikrotikService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SuspendPppoeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $customerId;
    
    // Maksimal percobaan 3 kali jika router offline
    public $tries = 3;

    public function __construct($customerId)
    {
        $this->customerId = $customerId;
    }

    public function handle(MikrotikService $mikrotikService)
    {
        $customer = Customer::find($this->customerId);
        if (!$customer || !$customer->router_id || !$customer->username_ppp) return;

        $router = Router::find($customer->router_id);
        if (!$router) return;

        try {
            $mikrotikService->connect($router->host, $router->user, $router->password, $router->port);
            $success = $mikrotikService->disablePppoeSecret($customer->username_ppp);
            
            if ($success) {
                $customer->update(['status' => 'suspended']);
                DB::table('mikrotik_logs')->insert([
                    'router_id' => $router->id,
                    'action' => 'suspend',
                    'status' => 'success',
                    'message' => "Successfully suspended PPPoE {$customer->username_ppp}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Failed to suspend customer: " . $e->getMessage());
            DB::table('mikrotik_logs')->insert([
                'router_id' => $router->id,
                'action' => 'suspend',
                'status' => 'failed',
                'message' => $e->getMessage(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Melempar error agar worker mencoba ulang (retry) job ini
            throw $e;
        }
    }
}
