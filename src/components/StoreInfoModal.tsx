import React from 'react';
import { RestaurantConfig } from '../types';
import { formatCurrency } from '../utils/currency';
import {
  X,
  MapPin,
  Clock,
  Bike,
  Store,
  Phone,
  QrCode,
  Instagram,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RestaurantConfig;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-600" />
              Informações do Estabelecimento
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 text-xs sm:text-sm">
            {/* Status */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100/80">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    config.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span className="font-extrabold text-slate-900">
                  {config.isOpen ? 'Estamos Abertos para Pedidos' : 'Fechado no Momento'}
                </span>
              </div>
              <span className="text-xs font-bold text-orange-800 bg-white px-2.5 py-0.5 rounded-lg border border-orange-200/80">
                {config.type}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-slate-900">Endereço do Balcão</p>
                <p className="text-slate-600 mt-0.5">{config.address}</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-slate-900">Horário de Funcionamento</p>
                <p className="text-slate-600 mt-0.5">{config.openingHours}</p>
              </div>
            </div>

            {/* Delivery Estimates */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                  <Bike className="w-3.5 h-3.5 text-green-600" />
                  <span>Entrega Delivery</span>
                </div>
                <p className="font-black text-slate-900 mt-1">{config.estimatedDeliveryTime}</p>
                <p className="text-[11px] text-green-600 font-extrabold mt-0.5">
                  Taxa: {formatCurrency(config.deliveryFee)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                  <Store className="w-3.5 h-3.5 text-orange-600" />
                  <span>Retirada Balcão</span>
                </div>
                <p className="font-black text-slate-900 mt-1">{config.estimatedPickupTime}</p>
                <p className="text-[11px] text-green-600 font-extrabold mt-0.5">Sem taxa extra</p>
              </div>
            </div>

            {/* Pix Key */}
            {config.pixKey && (
              <div className="p-3.5 rounded-2xl bg-green-50/80 border border-green-200">
                <p className="font-extrabold text-green-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-green-700" />
                  Chave Pix para Pagamento ({config.pixKeyType || 'Chave'})
                </p>
                <code className="block mt-1.5 p-2 bg-white rounded-xl border border-green-200 text-xs font-mono select-all text-slate-800">
                  {config.pixKey}
                </code>
              </div>
            )}

            {/* WhatsApp Phone */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-800">WhatsApp Oficial:</span>
              </div>
              <span className="font-mono font-black text-orange-600">+{config.whatsapp}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-orange-600 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
