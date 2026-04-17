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
            ['name' => 'Ahmed Benali',      'phone' => '0661000101', 'license_no' => 'DL-001', 'status' => 'available'],
            ['name' => 'Karim Idrissi',     'phone' => '0661000102', 'license_no' => 'DL-002', 'status' => 'available'],
            ['name' => 'Youssef Mansour',   'phone' => '0661000103', 'license_no' => 'DL-003', 'status' => 'available'],
            ['name' => 'Sara El Fassi',     'phone' => '0761000104', 'license_no' => 'DL-004', 'status' => 'available'],
            ['name' => 'Omar Tazi',         'phone' => '0661000105', 'license_no' => 'DL-005', 'status' => 'available'],
            ['name' => 'Nadia Chraibi',     'phone' => '0761000106', 'license_no' => 'DL-006', 'status' => 'available'],
            ['name' => 'Hassan Ouali',      'phone' => '0661000107', 'license_no' => 'DL-007', 'status' => 'unavailable'],
            ['name' => 'Fatima Zahra',      'phone' => '0761000108', 'license_no' => 'DL-008', 'status' => 'on_leave'],
        ])->map(fn($d) => Driver::create(['org_id' => $org->id, ...$d]));

        $vehicles = collect([
            ['name' => 'Toyota Hilux',        'plate' => 'A-1001-BE', 'year' => '2021', 'status' => 'available',      'mileage' => 42000],
            ['name' => 'Ford Transit',         'plate' => 'B-2002-CA', 'year' => '2020', 'status' => 'available',      'mileage' => 67000],
            ['name' => 'Renault Master',       'plate' => 'C-3003-DA', 'year' => '2022', 'status' => 'available',      'mileage' => 28000],
            ['name' => 'Mercedes Sprinter',    'plate' => 'D-4004-EB', 'year' => '2019', 'status' => 'available',      'mileage' => 95000],
            ['name' => 'Peugeot Boxer',        'plate' => 'E-5005-FC', 'year' => '2023', 'status' => 'available',      'mileage' => 15000],
            ['name' => 'Iveco Daily',          'plate' => 'F-6006-GA', 'year' => '2021', 'status' => 'available',      'mileage' => 51000],
            ['name' => 'Volkswagen Crafter',   'plate' => 'G-7007-HB', 'year' => '2018', 'status' => 'in_maintenance', 'mileage' => 112000],
            ['name' => 'Citroën Jumper',       'plate' => 'H-8008-IC', 'year' => '2020', 'status' => 'available',      'mileage' => 38000],
        ])->map(fn($v) => Vehicle::create(['org_id' => $org->id, ...$v]));

        // ── PLANNED (4 trips) ──────────────────────────────────────────────────
        Trip::create([
            'org_id'           => $org->id,
            'pickup_address'   => 'Casablanca - Port',
            'dropoff_address'  => 'Rabat - Agdal',
            'scheduled_at'     => now()->addDays(1)->setTime(8, 0),
            'duration_minutes' => 120,
            'priority'         => 'high',
            'status'           => 'planned',
            'notes'            => 'Livraison urgente de matériel médical.',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'pickup_address'   => 'Salé - Hay Salam',
            'dropoff_address'  => 'Kenitra - Centre',
            'scheduled_at'     => now()->addDays(1)->setTime(10, 30),
            'duration_minutes' => 90,
            'priority'         => 'medium',
            'status'           => 'planned',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'pickup_address'   => 'Tanger - Port',
            'dropoff_address'  => 'Tétouan - Médina',
            'scheduled_at'     => now()->addDays(2)->setTime(7, 0),
            'duration_minutes' => 60,
            'priority'         => 'low',
            'status'           => 'planned',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'pickup_address'   => 'Oujda - Gare',
            'dropoff_address'  => 'Nador - Centre',
            'scheduled_at'     => now()->addDays(3)->setTime(14, 0),
            'duration_minutes' => 150,
            'priority'         => 'high',
            'status'           => 'planned',
            'notes'            => 'Transport de marchandises fragiles.',
        ]);

        // ── ASSIGNED (3 trips) ────────────────────────────────────────────────
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[0]->id,
            'vehicle_id'       => $vehicles[0]->id,
            'pickup_address'   => 'Marrakech - Gueliz',
            'dropoff_address'  => 'Agadir - Centre',
            'scheduled_at'     => now()->addDays(2)->setTime(9, 0),
            'duration_minutes' => 180,
            'priority'         => 'medium',
            'status'           => 'assigned',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[2]->id,
            'vehicle_id'       => $vehicles[2]->id,
            'pickup_address'   => 'Béni Mellal - Gare',
            'dropoff_address'  => 'Khouribga - Centre',
            'scheduled_at'     => now()->addDays(1)->setTime(13, 0),
            'duration_minutes' => 60,
            'priority'         => 'low',
            'status'           => 'assigned',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[3]->id,
            'vehicle_id'       => $vehicles[4]->id,
            'pickup_address'   => 'El Jadida - Port',
            'dropoff_address'  => 'Safi - Centre',
            'scheduled_at'     => now()->addDays(2)->setTime(6, 30),
            'duration_minutes' => 120,
            'priority'         => 'high',
            'status'           => 'assigned',
            'notes'            => 'Collecte de marchandises au port.',
        ]);

        // ── IN PROGRESS (2 trips) ─────────────────────────────────────────────
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[1]->id,
            'vehicle_id'       => $vehicles[1]->id,
            'pickup_address'   => 'Fès - Médina',
            'dropoff_address'  => 'Meknès - Centre',
            'scheduled_at'     => now()->subHour(),
            'duration_minutes' => 90,
            'priority'         => 'medium',
            'status'           => 'in_progress',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[4]->id,
            'vehicle_id'       => $vehicles[5]->id,
            'pickup_address'   => 'Mohammedia - Zone Industrielle',
            'dropoff_address'  => 'Casablanca - Derb Sultan',
            'scheduled_at'     => now()->subMinutes(45),
            'duration_minutes' => 60,
            'priority'         => 'high',
            'status'           => 'in_progress',
            'notes'            => 'Livraison express — client prioritaire.',
        ]);

        // ── COMPLETED (4 trips) ───────────────────────────────────────────────
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[0]->id,
            'vehicle_id'       => $vehicles[0]->id,
            'pickup_address'   => 'Casablanca - Ain Sebaâ',
            'dropoff_address'  => 'Casablanca - Maarif',
            'scheduled_at'     => now()->subDays(1)->setTime(10, 0),
            'duration_minutes' => 30,
            'priority'         => 'low',
            'status'           => 'completed',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[2]->id,
            'vehicle_id'       => $vehicles[3]->id,
            'pickup_address'   => 'Rabat - Hay Riad',
            'dropoff_address'  => 'Casablanca - Anfa',
            'scheduled_at'     => now()->subDays(1)->setTime(14, 0),
            'duration_minutes' => 120,
            'priority'         => 'medium',
            'status'           => 'completed',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[5]->id,
            'vehicle_id'       => $vehicles[7]->id,
            'pickup_address'   => 'Settat - Gare',
            'dropoff_address'  => 'Berrechid - Centre',
            'scheduled_at'     => now()->subDays(2)->setTime(8, 0),
            'duration_minutes' => 45,
            'priority'         => 'low',
            'status'           => 'completed',
        ]);
        Trip::create([
            'org_id'           => $org->id,
            'driver_id'        => $drivers[1]->id,
            'vehicle_id'       => $vehicles[2]->id,
            'pickup_address'   => 'Marrakech - Aéroport',
            'dropoff_address'  => 'Ouarzazate - Centre',
            'scheduled_at'     => now()->subDays(2)->setTime(11, 0),
            'duration_minutes' => 240,
            'priority'         => 'high',
            'status'           => 'completed',
            'notes'            => 'Transfert VIP depuis l\'aéroport.',
        ]);
    }
}
