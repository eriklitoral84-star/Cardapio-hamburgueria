export interface RestaurantConfig {
  name: string;
  tagline: string;
  whatsapp: string;
  type: string;
  primaryColor: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  estimatedPickupTime: string;
  minOrderValue: number;
  address: string;
  openingHours: string;
  isOpen: boolean;
  bannerImage: string;
  logoImage: string;
  pixKey?: string;
  pixKeyType?: string;
  instagram?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface ProductOptionGroup {
  id: string;
  title: string;
  subtitle?: string;
  required: boolean;
  min: number;
  max: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  image: string;
  badge?: string;
  optionGroups?: ProductOptionGroup[];
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface SelectedOptionItem {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique item id in cart
  productId: string;
  name: string;
  price: number;
  unitPriceWithExtras: number;
  totalPrice: number;
  image: string;
  quantity: number;
  selectedOptions: SelectedOptionItem[];
  notes: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  city: string;
}

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethodType = 'pix' | 'credit_card' | 'debit_card' | 'cash';

export interface PaymentOption {
  id: PaymentMethodType;
  name: string;
  iconName: string;
  description: string;
}

export interface OrderState {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  address: DeliveryAddress;
  paymentMethod: PaymentMethodType;
  changeFor: string;
  orderNotes: string;
  couponCode: string;
  appliedDiscount: number;
}
