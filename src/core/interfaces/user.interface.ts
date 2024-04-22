interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  address: {
    billing: string;
    shipping: string;
  };
  role: 'customer' | 'courier';
}

interface Order {
  id: string;
  date: Date;
  status: string;
  details: {
    // Details of the order
  };
}

interface Payment {
  id: string;
  date: Date;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
}

interface Settings {
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  security: {
    twoFactorAuth?: boolean;
    verified: boolean;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserAccount {
  profile: User;
  orders: Order[];
  payments: Payment[];
  settings: Settings;
}

export enum UserRole {
  CUSTOMER = 'customer',
  COURIER = 'courier',
}
