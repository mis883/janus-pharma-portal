import { Product, StockStatus, User, UserRole, Banner, CompanySettings, Order, OrderStatus } from './types';

export const INITIAL_DIVISIONS = [
  "All",
  "Critical Care",
  "Cardiac",
  "Derma",
  "General",
  "Ortho",
  "Pediatric",
  "Marketing Inputs" // New Category
];

export const INITIAL_NEWS_TICKER = [
  "🚀 New Launch: CardioPlus 50mg is now available!",
  "📦 Bulk Order Scheme: Flat 10% off on orders above $5000.",
  "⚠️ Low Stock Alert: Please update your inventory for FluGo tablets.",
  "🎁 Order Complimentary Visual Aids from the new Input Shop!"
];

export const INITIAL_SETTINGS: CompanySettings = {
    name: "Janus Biotech India Pvt Ltd",
    address: "SCO 123, Sector 82, JLPL Industrial Area, Mohali, Punjab",
    phone: "+91-9876543210",
    logoUrl: "", // Empty defaults to icon
    whatsappNumber: "919876543210"
};

export const INITIAL_USERS: User[] = [
    { id: '1', username: 'admin', password: 'admin123', role: UserRole.ADMIN, name: 'Super Admin', isBlocked: false },
    { id: '2', username: 'staff', password: 'staff123', role: UserRole.STAFF, name: 'Rahul Sharma', isBlocked: false },
    { id: '3', username: 'distributor', password: 'user123', role: UserRole.CUSTOMER, name: 'MediCare Pharma', isBlocked: false },
];

export const INITIAL_BANNERS: Banner[] = [
    {
      id: '1',
      headline: "Janus Biotech India Pvt. Ltd.",
      subheadline: "Empowering Healthcare with 3300+ Products across 18 Specialty Divisions.",
      imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1920&q=80",
      overlayColor: "bg-[#0056b3]/70" 
    },
    {
      id: '2',
      headline: "Excellence in Critical Care",
      subheadline: "Premium Injectables & Life-Saving Formulations for Monopoly Distribution.",
      buttonText: "View Critical Care List",
      linkTo: 'Critical Care',
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80",
      overlayColor: "bg-indigo-900/60"
    },
    {
      id: '3',
      headline: "New Input Shop Live!",
      subheadline: "Order Visual Aids, MR Bags, and Gifts directly from the portal.",
      buttonText: "Visit Input Shop",
      linkTo: 'Input Shop',
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1920&q=80",
      overlayColor: "bg-emerald-900/60"
    }
];

const today = new Date().toISOString().split('T')[0];
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
const oldDate = threeMonthsAgo.toISOString().split('T')[0];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    brandName: 'CardioSafe-10',
    composition: 'Atorvastatin 10mg',
    division: 'Cardiac',
    packing: '10x10 Alu-Alu',
    mrp: 120,
    stockStatus: StockStatus.AVAILABLE,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    visualAidUrl: '#',
    landingCost: 45,
    isTrending: true,
    launchDate: oldDate,
    tags: ['Cholesterol', 'Heart Health', 'Cardiac', 'Statin']
  },
  {
    id: '2',
    brandName: 'DermGlo Cream',
    composition: 'Ketoconazole 2% + Zinc',
    division: 'Derma',
    packing: '20g Tube',
    mrp: 85,
    stockStatus: StockStatus.LOW_STOCK,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    videoUrl: 'https://youtube.com',
    landingCost: 25,
    launchDate: today, // New Launch
    isTrending: true,
    tags: ['Fungal Infection', 'Skin', 'Cream', 'Itching']
  },
  {
    id: '3',
    brandName: 'OrthoFlex Gel',
    composition: 'Diclofenac + Menthol',
    division: 'Ortho',
    packing: '30g Tube',
    mrp: 110,
    stockStatus: StockStatus.AVAILABLE,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    landingCost: 30,
    isTrending: false,
    launchDate: oldDate,
    tags: ['Pain Relief', 'Joint Pain', 'Muscle Pain', 'Gel']
  },
  {
    id: '4',
    brandName: 'CritInject 1g',
    composition: 'Ceftriaxone 1g Injection',
    division: 'Critical Care',
    packing: '1 Vial + Water',
    mrp: 65,
    stockStatus: StockStatus.OUT_OF_STOCK,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    landingCost: 22,
    launchDate: oldDate,
    tags: ['Antibiotic', 'Infection', 'Injection', 'Critical']
  },
  {
    id: '5',
    brandName: 'PediCough Syrup',
    composition: 'Ambroxol + Levosalbutamol',
    division: 'Pediatric',
    packing: '100ml Bottle',
    mrp: 95,
    stockStatus: StockStatus.COMING_SOON,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    landingCost: 35,
    launchDate: today, // New Launch
    tags: ['Cough', 'Cold', 'Kids', 'Syrup']
  },
  // Promotional Items
  {
    id: 'promo-1',
    brandName: 'Visual Aid Folder (2024)',
    isPromotional: true,
    division: 'Marketing Inputs',
    packing: '1 Unit',
    mrp: 0,
    stockStatus: StockStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e37d74e?auto=format&fit=crop&w=800&q=80',
    tags: ['Marketing', 'Visual Aid', 'Folder', 'Input']
  },
  {
    id: 'promo-2',
    brandName: 'MR Reporting Bag (Leather)',
    isPromotional: true,
    division: 'Marketing Inputs',
    packing: '1 Unit',
    mrp: 850,
    stockStatus: StockStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    tags: ['Bag', 'MR Bag', 'Gift', 'Input']
  },
  {
    id: 'promo-3',
    brandName: 'Janus Prescription Pads',
    isPromotional: true,
    division: 'Marketing Inputs',
    packing: 'Pack of 10',
    mrp: 0,
    stockStatus: StockStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=800&q=80',
    tags: ['Stationery', 'Prescription', 'Input']
  }
];

export const INITIAL_ORDERS: Order[] = [
    {
        id: 'ORD-1001',
        userId: '3',
        userName: 'MediCare Pharma',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: OrderStatus.DISPATCHED,
        totalInquiryValue: 12000,
        finalPayableAmount: 11500,
        docketNumber: 'DTDC-99887766',
        items: [
            {...INITIAL_PRODUCTS[0], quantity: 50},
            {...INITIAL_PRODUCTS[2], quantity: 20}
        ]
    },
    {
        id: 'ORD-1002',
        userId: '3',
        userName: 'MediCare Pharma',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: OrderStatus.PAYMENT_REQUESTED,
        totalInquiryValue: 8500,
        finalPayableAmount: 8200,
        invoiceUrl: '#', // In real app, this is a link
        items: [
            {...INITIAL_PRODUCTS[1], quantity: 100}
        ]
    }
];