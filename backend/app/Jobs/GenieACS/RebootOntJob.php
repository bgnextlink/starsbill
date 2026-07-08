<?php

namespace App\Jobs\GenieACS;

use App\Services\GenieAcsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RebootOntJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $deviceId;

    public function __construct($deviceId)
    {
        $this->deviceId = $deviceId;
    }

    public function handle(GenieAcsService $acsService)
    {
        try {
            $acsService->rebootDevice($this->deviceId);
        } catch (\Exception $e) {
            // Log the error and fail the job to be retried
            \Log::error("GenieACS Reboot Failed for Device ID {$this->deviceId}: " . $e->getMessage());
            throw $e;
        }
    }
}
