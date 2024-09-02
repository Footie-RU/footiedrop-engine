export interface NewOrder {
  location: Location;
  details: Details;
  payment: Payment;
}

export interface Location {
  pickup: Pickup;
  delivery: Delivery;
}

export interface Pickup {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  floorOrApartment: string;
  country: string;
  locationType: string;
  coordinates: number[];
}

export interface Delivery {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  floorOrApartment: string;
  country: string;
  locationType: string;
  coordinates: number[];
}

export interface Details {
  sender: Sender;
  recipient: Recipient;
  package: Package;
}

export interface Sender {
  name: string;
  phone: string;
  email: string;
  userId: string;
}

export interface Recipient {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface Package {
  title: string;
  type: string;
  quantity: number;
  size: string;
  image: string;
  modeOfDelivery: string;
  message: string;
}

export interface Payment {
  price: number;
}

/**
 * Order status
 * @enum {string}
 * @readonly
 * @description The status of an order
 */
export enum OrderStatus {
  Pending = 'Pending', // Order is created but not yet accepted by any courier
  Accepted = 'Accepted', // Order is accepted by a courier
  InProgress = 'InProgress', // Courier is currently delivering the order
  Delivered = 'Delivered', // Order has been successfully delivered
  Cancelled = 'Cancelled', // Order has been cancelled
  Failed = 'Failed', // Order delivery failed
}
