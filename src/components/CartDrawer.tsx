import React, { useState } from 'react';
import {
  CartItem,
  OrderState,
  RestaurantConfig,
  PaymentMethodType,
  OrderType,
} from '../types';
import { formatCurrency } from '../utils/currency';
import { generateWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Bike,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  Send,
  Sparkles,
  AlertCircle,
  Tag,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  config: RestaurantConfig;
  orderState: OrderState;
  onUpdateOrderState: (updater: (prev: OrderState) => OrderState) => void;
  onOrderCompleted: (whatsappUrl: string, summaryText: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  config,
  orderState,
  onUpdateOrderState,
  onOrderCompleted,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Subtotal of items
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const isDelivery = orderState.orderType === 'delivery';
  const deliveryFee = isDelivery ? config.deliveryFee : 0;
  const total = Math.max(0, subtotal + deliveryFee - orderState.appliedDiscount);

  // Validate coupon
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'BURGER10' || code === 'PRIMEIRACOMPRA') {
      const discount = subtotal * 0.1; // 10%
      onUpdateOrderState((prev) => ({
        ...prev,
        couponCode: code,
        appliedDiscount: discount,
      }));
      setCouponMessage({ text: `Cupom ${code} aplicado: 10% OFF!`, isError: false });
    } else if (code === 'DESCONTO5' || code === 'BEMVINDO') {
      const discount = Math.min(subtotal, 5.0);
      onUpdateOrderState((prev) => ({
        ...prev,
        couponCode: code,
        appliedDiscount: discount,
      }));
      setCouponMessage({ text: `Cupom ${code} aplicado: R$ 5,00 OFF!`, isError: false });
    } else {
      setCouponMessage({ text: 'Cupom inválido ou expirado.', isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    onUpdateOrderState((prev) => ({
      ...prev,
      couponCode: '',
      appliedDiscount: 0,
    }));
    setCouponInput('');
    setCouponMessage(null);
  };

  // Form input validation
  const validateOrder = (): boolean => {
    const errors: Record<string, string> = {};

    if (!orderState.customerName.trim()) {
      errors.customerName = 'Informe seu nome para identificação do pedido';
    }

    if (!orderState.customerPhone.trim()) {
      errors.customerPhone = 'Informe seu WhatsApp para contato';
    }

    if (isDelivery) {
      if (!orderState.address.street.trim()) {
        errors.street = 'Informe o nome da rua/avenida';
      }
      if (!orderState.address.number.trim()) {
        errors.number = 'Nº';
      }
      if (!orderState.address.neighborhood.trim()) {
        errors.neighborhood = 'Informe o bairro';
      }
    }

    if (subtotal < config.minOrderValue) {
      errors.minOrder = `O valor mínimo para pedidos é de ${formatCurrency(config.minOrderValue)}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit and open WhatsApp
  const handleFinalizeOrder = () => {
    if (items.length === 0) return;
    if (!validateOrder()) {
      // scroll to errors
      return;
    }

    const message = generateWhatsAppMessage(
      config,
      items,
      orderState,
      subtotal,
      deliveryFee,
      total
    );

    const whatsappUrl = buildWhatsAppUrl(config.whatsapp, message);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // confetti fallback
    }

    // Open WhatsApp in new window/tab safely
    window.open(whatsappUrl, '_blank');

    // Notify parent for modal confirmation
    onOrderCompleted(whatsappUrl, message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Sua Sacola
                </h2>
                <p className="text-xs text-slate-500">
                  {items.length === 1 ? '1 produto selecionado' : `${items.length} produtos selecionados`}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline p-1 cursor-pointer"
              >
                Esvaziar
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 overscroll-contain">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-4 text-orange-400 shadow-xs">
                  <Store className="w-10 h-10" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Sua sacola está vazia</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Adicione deliciosos lanches, combos ou porções do nosso cardápio para continuar.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-lg shadow-orange-200 transition-all cursor-pointer"
                >
                  Explorar Cardápio
                </button>
              </div>
            ) : (
              <>
                {/* Delivery Type Segmented Toggle */}
                <div className="bg-orange-50/70 p-1.5 rounded-2xl flex gap-1.5 border border-orange-100/80">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateOrderState((prev) => ({ ...prev, orderType: 'delivery' }))
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isDelivery
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                        : 'text-orange-950/70 hover:text-orange-950 hover:bg-white/60'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Entrega</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateOrderState((prev) => ({ ...prev, orderType: 'pickup' }))
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      !isDelivery
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                        : 'text-orange-950/70 hover:text-orange-950 hover:bg-white/60'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Retirada</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Itens Escolhidos
                  </h3>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-2.5"
                    >
                      <div className="flex gap-3.5 items-start">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-100 bg-orange-50"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm font-black text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-slate-400 hover:text-orange-600 p-1 transition-colors cursor-pointer"
                              title="Remover item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs font-black text-orange-600 mt-0.5">
                            {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Selected Options list */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-2.5 text-[11px] space-y-1 text-slate-600 border border-slate-100">
                          {item.selectedOptions.map((opt, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate pr-2 font-medium">➕ {opt.optionName}</span>
                              {opt.price > 0 && (
                                <span className="font-bold text-slate-800 shrink-0">
                                  +{formatCurrency(opt.price)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Item Notes */}
                      {item.notes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100 font-medium">
                          <strong>Obs:</strong> {item.notes}
                        </p>
                      )}

                      {/* Quantity Modifier */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">
                          Unitário: {formatCurrency(item.unitPriceWithExtras)}
                        </span>
                        
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-black text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Seus Dados
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        value={orderState.customerName}
                        onChange={(e) =>
                          onUpdateOrderState((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        placeholder="Seu Nome Completo *"
                        className={`w-full p-3 text-xs sm:text-sm rounded-2xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                          formErrors.customerName
                            ? 'border-orange-400 focus:ring-2 focus:ring-orange-500/20'
                            : 'border-slate-200 focus:border-orange-500'
                        }`}
                      />
                      {formErrors.customerName && (
                        <p className="text-[11px] text-orange-600 mt-1 font-bold">
                          {formErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={orderState.customerPhone}
                        onChange={(e) =>
                          onUpdateOrderState((prev) => ({
                            ...prev,
                            customerPhone: e.target.value,
                          }))
                        }
                        placeholder="WhatsApp com DDD (ex: 11 99999-9999) *"
                        className={`w-full p-3 text-xs sm:text-sm rounded-2xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                          formErrors.customerPhone
                            ? 'border-orange-400 focus:ring-2 focus:ring-orange-500/20'
                            : 'border-slate-200 focus:border-orange-500'
                        }`}
                      />
                      {formErrors.customerPhone && (
                        <p className="text-[11px] text-orange-600 mt-1 font-bold">
                          {formErrors.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address (if Delivery selected) */}
                {isDelivery ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Endereço de Entrega
                      </h3>
                      <span className="text-xs font-extrabold text-green-700 bg-green-50 border border-green-200/60 px-2.5 py-0.5 rounded-lg shadow-2xs">
                        Taxa: {formatCurrency(config.deliveryFee)}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={orderState.address.street}
                            onChange={(e) =>
                              onUpdateOrderState((prev) => ({
                                ...prev,
                                address: { ...prev.address, street: e.target.value },
                              }))
                            }
                            placeholder="Rua / Avenida *"
                            className={`w-full p-3 text-xs sm:text-sm rounded-2xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                              formErrors.street
                                ? 'border-orange-400 focus:ring-2 focus:ring-orange-500/20'
                                : 'border-slate-200 focus:border-orange-500'
                            }`}
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={orderState.address.number}
                            onChange={(e) =>
                              onUpdateOrderState((prev) => ({
                                ...prev,
                                address: { ...prev.address, number: e.target.value },
                              }))
                            }
                            placeholder="Nº *"
                            className={`w-full p-3 text-xs sm:text-sm rounded-2xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                              formErrors.number
                                ? 'border-orange-400 focus:ring-2 focus:ring-orange-500/20'
                                : 'border-slate-200 focus:border-orange-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={orderState.address.neighborhood}
                          onChange={(e) =>
                            onUpdateOrderState((prev) => ({
                              ...prev,
                              address: { ...prev.address, neighborhood: e.target.value },
                            }))
                          }
                          placeholder="Bairro *"
                          className={`w-full p-3 text-xs sm:text-sm rounded-2xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                            formErrors.neighborhood
                              ? 'border-orange-400 focus:ring-2 focus:ring-orange-500/20'
                              : 'border-slate-200 focus:border-orange-500'
                          }`}
                        />
                        <input
                          type="text"
                          value={orderState.address.complement}
                          onChange={(e) =>
                            onUpdateOrderState((prev) => ({
                              ...prev,
                              address: { ...prev.address, complement: e.target.value },
                            }))
                          }
                          placeholder="Complemento (Apt, Bloco)"
                          className="w-full p-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>

                      <input
                        type="text"
                        value={orderState.address.reference}
                        onChange={(e) =>
                          onUpdateOrderState((prev) => ({
                            ...prev,
                            address: { ...prev.address, reference: e.target.value },
                          }))
                        }
                        placeholder="Ponto de Referência (ex: Próximo à padaria)"
                        className="w-full p-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  /* Pickup Store Address Notice */
                  <div className="p-4 rounded-3xl bg-orange-50 border border-orange-100 space-y-1">
                    <p className="text-xs font-black text-orange-900 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-orange-600" />
                      Retirada no Balcão da Loja
                    </p>
                    <p className="text-xs text-orange-800 font-medium">
                      {config.address}
                    </p>
                    <p className="text-[11px] text-orange-700">
                      ⏱️ Tempo estimado para preparo: <strong>{config.estimatedPickupTime}</strong>
                    </p>
                  </div>
                )}

                {/* Forma de Pagamento */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Forma de Pagamento
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Pix */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOrderState((prev) => ({ ...prev, paymentMethod: 'pix' }))
                      }
                      className={`p-3 rounded-2xl border flex flex-col items-start gap-1.5 text-left transition-all cursor-pointer ${
                        orderState.paymentMethod === 'pix'
                          ? 'bg-green-50/90 border-green-500 ring-2 ring-green-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shadow-xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">PIX</p>
                        <p className="text-[10px] text-slate-500">Chave na finalização</p>
                      </div>
                    </button>

                    {/* Cartão de Crédito */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOrderState((prev) => ({
                          ...prev,
                          paymentMethod: 'credit_card',
                        }))
                      }
                      className={`p-3 rounded-2xl border flex flex-col items-start gap-1.5 text-left transition-all cursor-pointer ${
                        orderState.paymentMethod === 'credit_card'
                          ? 'bg-orange-50/90 border-orange-500 ring-2 ring-orange-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Cartão Crédito</p>
                        <p className="text-[10px] text-slate-500">Máquina na entrega</p>
                      </div>
                    </button>

                    {/* Cartão de Débito */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOrderState((prev) => ({
                          ...prev,
                          paymentMethod: 'debit_card',
                        }))
                      }
                      className={`p-3 rounded-2xl border flex flex-col items-start gap-1.5 text-left transition-all cursor-pointer ${
                        orderState.paymentMethod === 'debit_card'
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Cartão Débito</p>
                        <p className="text-[10px] text-slate-500">Máquina na entrega</p>
                      </div>
                    </button>

                    {/* Dinheiro */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOrderState((prev) => ({ ...prev, paymentMethod: 'cash' }))
                      }
                      className={`p-3 rounded-2xl border flex flex-col items-start gap-1.5 text-left transition-all cursor-pointer ${
                        orderState.paymentMethod === 'cash'
                          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Dinheiro</p>
                        <p className="text-[10px] text-slate-500">Pode pedir troco</p>
                      </div>
                    </button>
                  </div>

                  {/* Dinheiro troco field */}
                  {orderState.paymentMethod === 'cash' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Precisa de troco para quanto?
                      </label>
                      <input
                        type="text"
                        value={orderState.changeFor}
                        onChange={(e) =>
                          onUpdateOrderState((prev) => ({ ...prev, changeFor: e.target.value }))
                        }
                        placeholder="Ex: Troco para R$ 50,00 ou Não preciso"
                        className="w-full p-2.5 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  )}

                  {/* Pix Instructions Preview */}
                  {orderState.paymentMethod === 'pix' && config.pixKey && (
                    <div className="p-3.5 rounded-2xl bg-green-50/80 border border-green-200 text-xs text-green-900 space-y-1.5">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Chave {config.pixKeyType || 'Pix'}:
                      </p>
                      <code className="block p-2 bg-white rounded-xl border border-green-200 font-mono text-[11px] select-all">
                        {config.pixKey}
                      </code>
                      <p className="text-[10px] text-green-700">
                        O comprovante pode ser enviado diretamente na conversa do WhatsApp.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cupom de Desconto */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Cupom de Desconto
                  </h3>

                  {orderState.couponCode ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span>
                          Cupom <strong>{orderState.couponCode}</strong> aplicado!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Ex: BURGER10 ou DESCONTO5"
                        className="flex-1 p-3 text-xs rounded-2xl border border-slate-200 bg-slate-50 uppercase focus:bg-white focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-orange-600 text-white font-black text-xs transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p
                      className={`text-[11px] font-bold ${
                        couponMessage.isError ? 'text-orange-600' : 'text-green-600'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* Observações Gerais do Pedido */}
                <div className="space-y-1.5 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Observação Geral do Pedido
                  </h3>
                  <textarea
                    value={orderState.orderNotes}
                    onChange={(e) =>
                      onUpdateOrderState((prev) => ({ ...prev, orderNotes: e.target.value }))
                    }
                    placeholder="Instruções para entrega, portaria, campainha, etc..."
                    rows={2}
                    className="w-full p-3 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 transition-all resize-none"
                  />
                </div>

                {/* Financial Breakdown */}
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal dos Itens</span>
                    <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Taxa de Entrega</span>
                    <span className="font-bold text-slate-900">
                      {isDelivery ? (
                        deliveryFee > 0 ? (
                          formatCurrency(deliveryFee)
                        ) : (
                          'Grátis'
                        )
                      ) : (
                        <span className="text-green-600 font-bold">Grátis (Retirada)</span>
                      )}
                    </span>
                  </div>

                  {orderState.appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Desconto Especial</span>
                      <span>-{formatCurrency(orderState.appliedDiscount)}</span>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-sm sm:text-base font-extrabold text-slate-900">
                    <span>Total a Pagar</span>
                    <span className="text-orange-600 text-xl font-black">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Minimum order notice */}
                {subtotal < config.minOrderValue && (
                  <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-2 text-xs text-orange-800">
                    <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>
                      Pedido mínimo da loja: <strong>{formatCurrency(config.minOrderValue)}</strong> (adicione mais {formatCurrency(config.minOrderValue - subtotal)})
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Action Button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shadow-xl space-y-2 shrink-0">
              <button
                type="button"
                onClick={handleFinalizeOrder}
                className="w-full py-4 px-5 rounded-2xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black text-sm sm:text-base flex items-center justify-between transition-all shadow-lg shadow-green-500/25 active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span>Enviar Pedido no WhatsApp</span>
                </div>
                <span className="bg-green-600/90 px-3 py-1 rounded-xl text-xs sm:text-sm font-black">
                  {formatCurrency(total)}
                </span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Seu pedido será formatado e enviado diretamente para o WhatsApp do restaurante.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
