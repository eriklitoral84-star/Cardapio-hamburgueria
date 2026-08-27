import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCartBarProps {
  totalItems: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalItems,
  totalPrice,
  onOpenCart,
}) => {
  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-4 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none"
      >
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            onClick={onOpenCart}
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl shadow-orange-950/20 flex items-center justify-between border border-slate-800 transition-all active:scale-[0.99] cursor-pointer group"
          >
            {/* Left badge & count */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/40">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-orange-600 text-[11px] font-black flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              </div>

              <div className="text-left">
                <p className="text-xs text-slate-300 font-medium">
                  {totalItems === 1 ? '1 item adicionado' : `${totalItems} itens adicionados`}
                </p>
                <p className="text-base font-black text-white">
                  {formatCurrency(totalPrice)}
                </p>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-white transition-colors bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-2xl shadow-md shadow-orange-600/30">
              <span>Ver Sacola</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
