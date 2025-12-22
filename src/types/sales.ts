export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  cost: number;
  stock: number;
  created_at: string;
  categories?: Category;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  payment_type: 'Cash' | 'Card' | 'Online';
  status: 'Pending' | 'Delivered' | 'Cancelled';
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  products?: Product;
  orders?: Order;
}

export interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  netProfit: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  profitMargin: number;
  stockLeft: number;
}

export interface SalesFilters {
  dateFrom: string;
  dateTo: string;
  category: string;
  searchTerm: string;
  status: string;
  paymentType: string;
}


// .................................
// 
// 
