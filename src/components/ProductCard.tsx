import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/currency';
import { Plus, SlidersHorizontal, ImageOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const hasOptions = (product.optionGroups && product.optionGroups.length > 0) || false;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col justify-between bg-white rounded-3xl border border-slate-100 hover:border-orange-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      <div className="flex gap-3.5 sm:gap-4 items-start">
        {/* Text info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            {/* Badge if present */}
            {product.badge && (
              <span className="inline-block mb-1.5 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200/70 rounded-lg shadow-2xs">
                {product.badge}
              </span>
            )}

            {/* Product Name */}
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>

            {/* Product Description */}
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing & Add Button Mobile Layout */}
          <div className="mt-3 pt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-black text-orange-600">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatCurrency(product.originalPrice!)}
                </span>
              )}
            </div>

            {/* Add action pill */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-black text-xs transition-all shadow-2xs group-hover:bg-orange-600 group-hover:text-white cursor-pointer"
            >
              {hasOptions ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Montar</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Thumbnail Image */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-orange-50 shrink-0 border border-slate-100 shadow-2xs">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-orange-50/50 p-2 text-center">
              <ImageOff className="w-6 h-6 mb-1 text-orange-300" />
              <span className="text-[10px]">Sem foto</span>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-1.5 right-1.5 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase">
              Promo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
