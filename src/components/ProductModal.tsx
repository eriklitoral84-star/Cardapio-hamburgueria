import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductOptionGroup, SelectedOptionItem } from '../types';
import { formatCurrency } from '../utils/currency';
import { X, Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOptionItem[],
    notes: string,
    totalPrice: number
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset state on open
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setValidationError(null);

      // Pre-select first option for required single-choice groups
      const initialMap: Record<string, string[]> = {};
      if (product.optionGroups) {
        product.optionGroups.forEach((group) => {
          if (group.required && group.max === 1 && group.options.length > 0) {
            initialMap[group.id] = [group.options[0].id];
          } else {
            initialMap[group.id] = [];
          }
        });
      }
      setSelectedOptionsMap(initialMap);
    }
  }, [product]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle option click
  const handleToggleOption = (group: ProductOptionGroup, optionId: string) => {
    setSelectedOptionsMap((prev) => {
      const currentSelected = prev[group.id] || [];

      if (group.max === 1) {
        // Radio behavior
        if (group.required) {
          return { ...prev, [group.id]: [optionId] };
        } else {
          // Toggle if not strictly required
          const isSame = currentSelected.includes(optionId);
          return { ...prev, [group.id]: isSame ? [] : [optionId] };
        }
      } else {
        // Checkbox multi-select behavior
        const isSelected = currentSelected.includes(optionId);
        if (isSelected) {
          return { ...prev, [group.id]: currentSelected.filter((id) => id !== optionId) };
        } else {
          if (currentSelected.length >= group.max) {
            // Reached max
            return prev;
          }
          return { ...prev, [group.id]: [...currentSelected, optionId] };
        }
      }
    });
  };

  // Calculate extras and total
  const { extrasTotal, flatSelectedOptions } = useMemo(() => {
    if (!product || !product.optionGroups) {
      return { extrasTotal: 0, flatSelectedOptions: [] };
    }

    let extraSum = 0;
    const flatList: SelectedOptionItem[] = [];

    product.optionGroups.forEach((group) => {
      const selectedIds = selectedOptionsMap[group.id] || [];
      selectedIds.forEach((optId) => {
        const optionObj = group.options.find((o) => o.id === optId);
        if (optionObj) {
          extraSum += optionObj.price;
          flatList.push({
            groupId: group.id,
            groupTitle: group.title,
            optionId: optionObj.id,
            optionName: optionObj.name,
            price: optionObj.price,
          });
        }
      });
    });

    return { extrasTotal: extraSum, flatSelectedOptions: flatList };
  }, [product, selectedOptionsMap]);

  const unitPrice = (product?.price || 0) + extrasTotal;
  const grandTotal = unitPrice * quantity;

  // Validation
  const validateForm = (): boolean => {
    if (!product || !product.optionGroups) return true;

    for (const group of product.optionGroups) {
      const count = (selectedOptionsMap[group.id] || []).length;
      if (group.required && count < (group.min || 1)) {
        setValidationError(`Por favor, selecione uma opção em "${group.title}".`);
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleAdd = () => {
    if (!product) return;
    if (!validateForm()) return;

    onAddToCart(product, quantity, flatSelectedOptions, notes, grandTotal);
    onClose();
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Sheet Content */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Close button float */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Header Hero Image */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />
              {product.badge && (
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 text-xs font-black uppercase tracking-wider text-white bg-orange-600 rounded-xl shadow-md">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {product.name}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {product.description}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-orange-600">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Option Groups (Adicionais, Ponto da Carne, etc.) */}
            {product.optionGroups && product.optionGroups.length > 0 && (
              <div className="p-5 sm:p-6 space-y-6">
                {product.optionGroups.map((group) => {
                  const selectedIds = selectedOptionsMap[group.id] || [];
                  const isSingle = group.max === 1;

                  return (
                    <div key={group.id} className="rounded-3xl border border-slate-100 bg-orange-50/20 p-4 sm:p-5">
                      {/* Group Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            {group.title}
                            {group.required && (
                              <span className="text-[10px] uppercase font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                                Obrigatório
                              </span>
                            )}
                          </h4>
                          {group.subtitle ? (
                            <p className="text-xs text-slate-500 mt-0.5">{group.subtitle}</p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {isSingle ? 'Escolha 1 opção' : `Escolha até ${group.max} opções`}
                            </p>
                          )}
                        </div>

                        {!isSingle && (
                          <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                            {selectedIds.length}/{group.max}
                          </span>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="space-y-2">
                        {group.options.map((option) => {
                          const isSelected = selectedIds.includes(option.id);
                          const isDisabled =
                            !isSelected && !isSingle && selectedIds.length >= group.max;

                          return (
                            <div
                              key={option.id}
                              onClick={() => {
                                if (!isDisabled) handleToggleOption(group, option.id);
                              }}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-50/90 border-orange-400 text-orange-950 shadow-2xs'
                                  : isDisabled
                                  ? 'opacity-50 cursor-not-allowed bg-slate-100/50 border-slate-200'
                                  : 'bg-white hover:bg-orange-50/30 border-slate-200/80 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                {/* Radio/Checkbox Graphic */}
                                <div
                                  className={`w-5 h-5 rounded-${
                                    isSingle ? 'full' : 'md'
                                  } border flex items-center justify-center transition-all shrink-0 ${
                                    isSelected
                                      ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && (
                                    isSingle ? (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    )
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold truncate leading-tight">
                                    {option.name}
                                  </p>
                                  {option.description && (
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {option.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`text-xs sm:text-sm font-extrabold shrink-0 ${
                                  option.price > 0 ? 'text-orange-600' : 'text-green-600'
                                }`}
                              >
                                {option.price > 0 ? `+ ${formatCurrency(option.price)}` : 'Incluso'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Observações / Notes */}
            <div className="p-5 sm:p-6 pt-0">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Alguma observação para a cozinha?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Tirar cebola, ponto bem passado, molho à parte..."
                rows={2}
                maxLength={140}
                className="w-full p-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
              <p className="text-[10px] text-slate-400 text-right mt-1">
                {notes.length}/140 caracteres
              </p>
            </div>
          </div>

          {/* Validation Banner if any */}
          {validationError && (
            <div className="px-5 py-2.5 bg-orange-50 border-t border-orange-100 flex items-center gap-2 text-xs font-bold text-orange-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center gap-3 sm:gap-4 shadow-lg">
            {/* Quantity Selector */}
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 shrink-0 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center text-sm font-black text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-black text-sm sm:text-base flex items-center justify-between transition-all shadow-lg shadow-orange-200 active:scale-[0.99] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar</span>
              </span>
              <span className="font-black">{formatCurrency(grandTotal)}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
