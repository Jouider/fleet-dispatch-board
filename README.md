# Fleet Dispatch Board

A full-stack trip assignment and dispatch management system built with **Laravel 11** (API) and **Next.js 15** (frontend).

---

## Features

- **Dispatch Board** — Kanban view with 4 columns: Planned → Assigned → In Progress → Completed
- **Trip Management** — Create, edit, delete trips with pickup/dropoff, schedule, duration, and priority
- **Driver & Vehicle Assignment** — Assign trips with real-time conflict detection
- **Overlap Detection** — Prevents scheduling the same driver or vehicle for overlapping trips
- **Status Validation** — Blocks status changes on drivers/vehicles when they have active trips
- **Moroccan Phone Validation** — Driver phone numbers validated against Moroccan format (06/07/+212)
- **Priority System** — High / Medium / Low with visual color indicators

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Laravel 11, MySQL, Eloquent ORM     |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| UI       | shadcn/ui (new-york), Lucide Icons  |
| Toasts   | Sonner                              |

---

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL (MAMP, XAMPP, or native)

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/Jouider/fleet-dispatch-board.git
cd fleet-dispatch-board
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` to set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306          # MAMP: 8889
DB_DATABASE=fleet_management
DB_USERNAME=root
DB_PASSWORD=          # MAMP: root
```

```bash
php artisan migrate --seed
php artisan serve     # → http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # → http://localhost:3000
```

---

## API Endpoints

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List trips (grouped by status) |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/{id}` | Update trip |
| DELETE | `/api/trips/{id}` | Delete trip |
| POST | `/api/trips/{id}/assign` | Assign driver + vehicle |
| PATCH | `/api/trips/{id}/status` | Advance trip status |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | List drivers |
| POST | `/api/drivers` | Create driver |
| PUT | `/api/drivers/{id}` | Update driver |
| DELETE | `/api/drivers/{id}` | Delete driver |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List vehicles |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/{id}` | Update vehicle |
| DELETE | `/api/vehicles/{id}` | Delete vehicle |

---

## Business Rules

### Trip Assignment
- A driver cannot be assigned to overlapping trips
- A vehicle cannot be assigned to overlapping trips
- Overlap detection: `scheduled_at` to `scheduled_at + duration_minutes`
- Trip must be in `planned` status to be assigned

### Status Transitions
```
planned → assigned → in_progress → completed
```

### Driver/Vehicle Status Changes
- Changing a driver to `unavailable` or `on_leave` is blocked if they have active trips
- Changing a vehicle to `in_maintenance` or `retired` is blocked if it has active trips
- Returns HTTP `409 Conflict` with the list of affected trips

### Phone Validation (Drivers)
- Moroccan format only: `06XXXXXXXX`, `07XXXXXXXX`, or `+212XXXXXXXXX`
- Must be unique across all drivers

### License Number
- Must be unique across all drivers

---

## Assumptions & Trade-offs

| Decision | Reason |
|----------|--------|
| `duration_minutes` defaults to 120 | No end_time field — overlap is computed dynamically |
| No authentication | Out of scope for this challenge |
| Hard-coded `org_id = 1` | Single-org MVP; schema is multi-tenant ready |
| SQLite alternative | Switch `DB_CONNECTION=sqlite` + `DB_DATABASE=/path/db.sqlite` for zero-config setup |
| Driver `on_leave` vs `unavailable` | `on_leave` = temporary absence; `unavailable` = suspended/problem |

---

## Project Structure

```
fleet-dispatch-board/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/      # TripController, DriverController, VehicleController
│   │   ├── Http/Requests/         # Form validation with business rules
│   │   ├── Models/                # Trip, Driver, Vehicle, Organization
│   │   └── Services/
│   │       └── TripAssignmentService.php   # Core overlap detection logic
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/               # 5 drivers, 5 vehicles, 3 sample trips
│   └── routes/api.php
└── frontend/
    ├── app/
    │   ├── page.tsx               # Dispatch Board (kanban)
    │   ├── drivers/page.tsx       # Drivers management
    │   └── vehicles/page.tsx      # Vehicles management
    ├── components/
    │   ├── TripCard.tsx
    │   ├── TripFormModal.tsx      # Create/edit trip
    │   ├── AssignModal.tsx        # Assign driver + vehicle
    │   ├── AppSidebar.tsx
    │   ├── StatusBadge.tsx
    │   └── PriorityBadge.tsx
    └── lib/api.ts                 # Typed API client
```

---

## Seed Data

The seeder creates:
- **1 organization** — Fleet Co.
- **5 drivers** — Mix of available / on_leave statuses
- **5 vehicles** — Mix of available / in_maintenance statuses  
- **3 trips** — planned, assigned, and in_progress examples

---

## License

MIT
