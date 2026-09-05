export interface Driver {
  _id: string;
  name: string;
  licenseNumber: string;
  contact: string;
  availability: boolean;
}

export interface Vehicle {
  _id: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber: string;
  capacity: number;
  status: string;
}

export interface Booking {
  _id: string;
  guestName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  vehicleType?: string;
  passengerCount?: number;
  airport?: string;
  paymentMethod?: 'Cash' | 'Card';
  vehicle?: Vehicle;
  driver?: Driver;
  status: string;
}

export interface Guest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  roomNumber?: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

// ── Driver Auth Types ──

export interface DriverVehicle {
  type: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  capacity: number;
  color: string;
}

export interface DriverAuth {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  contact: string;
  nic: string;
  address: string;
  availability: boolean;
  status: 'pending' | 'approved' | 'rejected';
  vehicle: DriverVehicle;
  token: string;
}

export interface PendingDriver {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  contact: string;
  nic: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  vehicle: DriverVehicle;
  createdAt: string;
}

export interface DriverLoginData {
  email: string;
  password: string;
}

export interface DriverRegisterData {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  contact: string;
  nic?: string;
  address?: string;
  vehicle: DriverVehicle;
}
