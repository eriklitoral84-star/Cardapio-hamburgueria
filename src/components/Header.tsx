import React from 'react';
import { RestaurantConfig } from '../types';
import { formatCurrency } from '../utils/currency';
import { Clock, MapPin, Phone, Info, Settings, Sparkles, Bike } from 'lucide-react';

interface HeaderProps {
  config: RestaurantConfig;
  onOpenStoreInfo: () => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenStoreInfo,
  onOpenConfig,
}) => {
  return (
    <header className="relative bg-white shadow-xs border-b border-slate-100">
      {/* Top Banner Image with gradient overlay */}
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={config.bannerImage}
          alt={config.name}
          className="w-full h-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Top Floating Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={onOpenConfig}
            title="Configurações da Loja"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold hover:bg-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Personalizar</span>
          </button>
          
          <button
            onClick={onOpenStoreInfo}
            title="Informações da Loja"
            className="p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Info className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Restaurant Identity & Stats Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-14 sm:-mt-16 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Logo Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl shadow-orange-950/10 bg-white shrink-0">
                <img
                  src={config.logoImage}
                  alt={config.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2">
                {config.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-green-500 text-white shadow-md shadow-green-500/30 border-2 border-white">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Aberto
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-600 text-white shadow-md border-2 border-white">
                    Fechado
                  </span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-100/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {config.type}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                  Cardápio Digital Oficial
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {config.name}
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 max-w-2xl font-normal leading-relaxed">
                {config.tagline}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mt-4 pt-4 border-t border-slate-100">
            {/* Delivery Time */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 leading-none">Tempo de Entrega</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 mt-1 truncate">
                  {config.estimatedDeliveryTime}
                </p>
              </div>
            </div>

            {/* Delivery Fee */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 shadow-xs">
                <Bike className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 leading-none">Taxa de Entrega</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 mt-1 truncate">
                  {config.deliveryFee > 0 ? formatCurrency(config.deliveryFee) : 'Grátis'}
                </p>
              </div>
            </div>

            {/* Opening Hours or WhatsApp Action */}
            <div
              onClick={onOpenStoreInfo}
              className="col-span-2 sm:col-span-1 flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-orange-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 leading-none">Localização & Info</p>
                  <p className="text-xs sm:text-sm font-black text-slate-800 mt-1 truncate">
                    Ver detalhes
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-600 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">Abrir →</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
