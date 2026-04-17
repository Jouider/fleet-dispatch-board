const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    const message =
      data?.errors
        ? Object.values(data.errors as Record<string, string[]>).flat().join('\n')
        : data?.message || 'Something went wrong'
    throw new Error(message)
  }

  return data
}

// ── Types ────────────────────────────────────────────────────────────────────

export type TripStatus = 'planned' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
export type TripPriority = 'low' | 'medium' | 'high'
export type DriverStatus = 'available' | 'unavailable' | 'on_leave'
export type VehicleStatus = 'available' | 'in_maintenance' | 'retired'

export interface Driver {
  id: number
  org_id: number
  name: string
  phone: string | null
  license_no: string | null
  status: DriverStatus
}

export interface Vehicle {
  id: number
  org_id: number
  name: string
  plate: string
  year: string | null
  status: VehicleStatus
  mileage: number
}

export interface Trip {
  id: number
  org_id: number
  driver_id: number | null
  vehicle_id: number | null
  pickup_address: string
  dropoff_address: string
  scheduled_at: string
  duration_minutes: number
  priority: TripPriority
  status: TripStatus
  notes: string | null
  driver?: Driver
  vehicle?: Vehicle
}

export interface TripsByStatus {
  planned?: Trip[]
  assigned?: Trip[]
  in_progress?: Trip[]
  completed?: Trip[]
  cancelled?: Trip[]
}

// ── Trips ─────────────────────────────────────────────────────────────────────

export const tripsApi = {
  list: () => request<TripsByStatus>('/trips'),
  get: (id: number) => request<Trip>(`/trips/${id}`),
  create: (data: Partial<Trip>) =>
    request<Trip>('/trips', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Trip>) =>
    request<Trip>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/trips/${id}`, { method: 'DELETE' }),
  assign: (id: number, driverId: number, vehicleId: number) =>
    request<Trip>(`/trips/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ driver_id: driverId, vehicle_id: vehicleId }),
    }),
  updateStatus: (id: number, status: TripStatus) =>
    request<Trip>(`/trips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// ── Drivers ───────────────────────────────────────────────────────────────────

export const driversApi = {
  list: (status?: DriverStatus) =>
    request<Driver[]>(`/drivers${status ? `?status=${status}` : ''}`),
  create: (data: Partial<Driver>) =>
    request<Driver>('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Driver>) =>
    request<Driver>(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/drivers/${id}`, { method: 'DELETE' }),
}

// ── Vehicles ──────────────────────────────────────────────────────────────────

export const vehiclesApi = {
  list: (status?: VehicleStatus) =>
    request<Vehicle[]>(`/vehicles${status ? `?status=${status}` : ''}`),
  create: (data: Partial<Vehicle>) =>
    request<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Vehicle>) =>
    request<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/vehicles/${id}`, { method: 'DELETE' }),
}
