import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  CartItem,
  OrderState,
  RestaurantConfig,
  SelectedOptionItem,
} from './types';
import rawProductsData from './data/products.json';
import defaultRestaurantConfig from './data/restaurantConfig.json';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartBar } from './components/FloatingCartBar';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StoreInfoModal } from './components/StoreInfoModal';
import { ConfigModal } from './components/ConfigModal';
import { UtensilsCrossed, Sparkles, MessageCircle, Heart, Share2 } from 'lucide-react';

const STORAGE_CONFIG_KEY = 'cardapio_restaurant_config_v1';
const STORAGE_CART_KEY = 'cardapio_cart_items_v1';
const STORAGE_CUSTOMER_KEY = 'cardapio_customer_data_v1';

export default function App() {
  // Store config with localStorage persistence
  const [config, setConfig] = useState<RestaurantConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return defaultRestaurantConfig as RestaurantConfig;
  });

  // Cart items with persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Order details state
  const [orderState, setOrderState] = useState<OrderState>(() => {
    const defaultState: OrderState = {
      customerName: '',
      customerPhone: '',
      orderType: 'delivery',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        complement: '',
        reference: '',
        city: 'São Paulo',
      },
      paymentMethod: 'pix',
      changeFor: '',
      orderNotes: '',
      couponCode: '',
      appliedDiscount: 0,
    };

    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          customerName: parsed.customerName || '',
          customerPhone: parsed.customerPhone || '',
          address: { ...defaultState.address, ...(parsed.address || {}) },
        };
      }
    } catch {
      // fallback
    }
    return defaultState;
  });

  // Navigation & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    whatsappUrl: string;
    summaryText: string;
  }>({
    isOpen: false,
    whatsappUrl: '',
    summaryText: '',
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_CUSTOMER_KEY,
        JSON.stringify({
          customerName: orderState.customerName,
          customerPhone: orderState.customerPhone,
          address: orderState.address,
        })
      );
    } catch {}
  }, [orderState.customerName, orderState.customerPhone, orderState.address]);

  // Categories & Products data
  const { categories, products } = rawProductsData as {
    categories: typeof rawProductsData.categories;
    products: Product[];
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.isAvailable) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filtered products based on search and category
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isAvailable);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q))
      );
    } else if (activeCategoryId) {
      result = result.filter((p) => p.categoryId === activeCategoryId);
    }

    return result;
  }, [products, searchQuery, activeCategoryId]);

  // Group filtered products by category if no specific category or search is active
  const groupedProducts = useMemo(() => {
    if (searchQuery.trim() || activeCategoryId) {
      return null;
    }

    const groups: Array<{ category: (typeof categories)[0]; items: Product[] }> = [];
    categories.forEach((cat) => {
      const items = products.filter((p) => p.isAvailable && p.categoryId === cat.id);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    });
    return groups;
  }, [categories, products, searchQuery, activeCategoryId]);

  // Total cart stats
  const totalCartItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOptionItem[],
    notes: string,
    totalPrice: number
  ) => {
    const extrasSum = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const unitPriceWithExtras = product.price + extrasSum;

    // Build unique line item ID based on options and notes
    const optionsSignature = selectedOptions
      .map((o) => o.optionId)
      .sort()
      .join('-');
    const cartItemId = `${product.id}_${optionsSignature}_${notes.trim().toLowerCase()}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + quantity;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          totalPrice: newQty * unitPriceWithExtras,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          unitPriceWithExtras,
          totalPrice,
          image: product.image,
          quantity,
          selectedOptions,
          notes,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPriceWithExtras,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Config handlers
  const handleSaveConfig = (newConfig: RestaurantConfig) => {
    setConfig(newConfig);
  };

  const handleResetDefaultConfig = () => {
    setConfig(defaultRestaurantConfig as RestaurantConfig);
    localStorage.removeItem(STORAGE_CONFIG_KEY);
  };

  // Order completion
  const handleOrderCompleted = (whatsappUrl: string, summaryText: string) => {
    setSuccessModalData({
      isOpen: true,
      whatsappUrl,
      summaryText,
    });
  };

  const handleNewOrder = () => {
    setCartItems([]);
    setSuccessModalData({ isOpen: false, whatsappUrl: '', summaryText: '' });
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <Header
        config={config}
        onOpenStoreInfo={() => setIsStoreInfoOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
        {/* Search Bar */}
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          isSearching={!!searchQuery.trim()}
          resultCount={filteredProducts.length}
        />

        {/* Categories Bar */}
        {!searchQuery.trim() && (
          <CategoryNav
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            categoryCounts={categoryCounts}
          />
        )}

        {/* Products Display */}
        {groupedProducts ? (
          /* Render by Category Sections */
          <div className="space-y-10">
            {groupedProducts.map((group) => (
              <section key={group.category.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{group.category.name}</span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </h2>
                    {group.category.description && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {group.category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {group.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Render Flat Filtered Grid (by single category or search) */
          <div className="space-y-4">
            {activeCategoryId && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-900">
                  {categories.find((c) => c.id === activeCategoryId)?.name || 'Categoria'}
                </h2>
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="text-xs font-black text-orange-600 hover:underline cursor-pointer"
                >
                  Ver todas
                </button>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Nenhum produto encontrado
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Tente buscar por outro termo ou limpe o filtro para ver todas as delícias do nosso cardápio.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategoryId(null);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-md mx-auto space-y-1">
          <p className="font-bold text-slate-800">
            {config.name} • {config.type}
          </p>
          <p className="text-slate-500">
            {config.address} • Atendimento: {config.openingHours}
          </p>
          <p className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-1">
            Pedidos via WhatsApp com link direto <span>•</span> Cardápio Digital Rápido & Responsivo
          </p>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar
        totalItems={totalCartItemsCount}
        totalPrice={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Product Customizer & Add Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & Checkout Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        config={config}
        orderState={orderState}
        onUpdateOrderState={setOrderState}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Sent Success Confirmation Modal */}
      <OrderSuccessModal
        isOpen={successModalData.isOpen}
        onClose={() => setSuccessModalData((prev) => ({ ...prev, isOpen: false }))}
        whatsappUrl={successModalData.whatsappUrl}
        summaryText={successModalData.summaryText}
        onNewOrder={handleNewOrder}
      />

      {/* Store Info Modal */}
      <StoreInfoModal
        isOpen={isStoreInfoOpen}
        onClose={() => setIsStoreInfoOpen(false)}
        config={config}
      />

      {/* Store Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetDefault={handleResetDefaultConfig}
      />
    </div>
  );
}
