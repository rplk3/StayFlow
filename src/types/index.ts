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
