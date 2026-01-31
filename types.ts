export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum StockStatus {
  AVAILABLE = 'Available',
  LOW_STOCK = 'Low Stock',
  COMING_SOON = 'Coming Soon',
  OUT_OF_STOCK = 'Out of Stock'
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  PAYMENT_REQUESTED = 'Payment Requested',
  PAYMENT_SUBMITTED = 'Payment Submitted',
  DISPATCHED = 'Dispatched',
  CANCELLED = 'Cancelled'
}

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, hashed. Here, plain for mock.
  role: UserRole;
  name: string;
  isBlocked: boolean;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  whatsappNumber: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

export interface Banner {
  id: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  buttonText?: string;
  linkTo?: string; // 'critical-care', 'new', etc.
  overlayColor: string;
}

export interface Product {
  id: string;
  brandName: string;
  composition?: string; // Optional for Promotional Materials
  division?: string; // Optional/Specific for Promotional
  packing: string;
  mrp: number; // Can be 0 for free items
  stockStatus: StockStatus;
  imageUrl: string;
  visualAidUrl?: string; // Link to PDF or Image
  videoUrl?: string;
  landingCost?: number; // Internal only
  isNewLaunch?: boolean; // Deprecated in favor of launchDate calculation
  launchDate?: string; // ISO Format YYYY-MM-DD
  isTrending?: boolean;
  tags?: string[]; // AI Generated Keywords for semantic search
  isPromotional?: boolean; // New Flag for Input Shop items
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FilterState {
  searchQuery: string;
  division: string;
}

export interface OrderHistoryItem {
  orderDate: string;
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string; // Denormalized for display
  date: string; // ISO String
  items: CartItem[];
  status: OrderStatus;
  totalInquiryValue: number; // Sum of MRP * Qty (Approx)
  finalPayableAmount?: number; // Set by Staff
  invoiceUrl?: string; // URL to PDF/Image
  paymentProofUrl?: string; // URL to Screenshot
  docketNumber?: string;
  transportDetails?: string;
}