<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\Trip;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::create([
            'name' => 'Fleet Corp',
            'slug' => 'fleet-corp',
            'plan' => 'pro',
        ]);

        $drivers = collect([
            ['name' => 'Ahmed Benali',    'phone' => '0661001001', 'license_no' => 'DL-001', 'status' => 'available'],
            ['name' => 'Karim Idrissi',   'phone' => '0661001002', 'license_no' => 'DL-002', 'status' => 'available'],
            ['name' => 'Youssef Mansour', 'phone' => '0661001003', 'license_no' => 'DL-003', 'status' => 'available'],
            ['name' => 'Sara El Fassi',   'phone' => '0661001004', 'license_no' => 'DL-004', 'status' => 'unavailable'],
            ['name' => 'Omar Tazi',       'phone' => '0661001005', 'license_no' => 'DL-005', 'status' => 'on_leave'],
        ])->map(fn($d) => Driver::create(['org_id' => $org->id, ...$d]));

        $vehicles = collect([
            ['name' => 'Toyota Hilux',   'plate' => 'A-1001-BE', 'year' => '2021', 'status' => 'available'],
            ['name' => 'Ford Transit',   'plate' => 'B-2002-CA', 'year' => '2020', 'status' => 'available'],
            ['name' => 'Renault Master', 'plate' => 'C-3003-DA', 'year' => '2022', 'status' => 'available'],
            ['name' => 'Mercedes Sprinter', 'plate' => 'D-4004-EB', 'year' => '2019', 'status' => 'in_maintenance'],
            ['name' => 'Peugeot Boxer',  'plate' => 'E-5005-FC', 'year' => '2023', 'status' => 'available'],
        ])->map(fn($v) => Vehicle::create(['org_id' => $org->id, ...$v]));

        // Trip planned (pas encore assigné)
        Trip::create([
            'org_id'          => $org->id,
            'pickup_address'  => 'Casablanca - Port',
            'dropoff_address' => 'Rabat - Agdal',
            'scheduled_at'    => now()->addDays(1)->setTime(8, 0),
            'duration_minutes'=> 120,
            'priority'        => 'high',
            'status'          => 'planned',
        ]);

        // Trip assigné
        Trip::create([
            'org_id'          => $org->id,
            'driver_id'       => $drivers[0]->id,
            'vehicle_id'      => $vehicles[0]->id,
            'pickup_address'  => 'Marrakech - Gueliz',
            'dropoff_address' => 'Agadir - Centre',
            'scheduled_at'    => now()->addDays(2)->setTime(9, 0),
            'duration_minutes'=> 180,
            'priority'        => 'medium',
            'status'          => 'assigned',
        ]);

        // Trip en cours
        Trip::create([
            'org_id'          => $org->id,
            'driver_id'       => $drivers[1]->id,
            'vehicle_id'      => $vehicles[1]->id,
            'pickup_address'  => 'Fès - Médina',
            'dropoff_address' => 'Meknès - Centre',
            'scheduled_at'    => now()->subHour(),
            'duration_minutes'=> 90,
            'priority'        => 'low',
            'status'          => 'in_progress',
        ]);
    }
}
