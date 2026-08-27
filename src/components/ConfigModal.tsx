import React, { useState } from 'react';
import { RestaurantConfig } from '../types';
import { X, Sliders, RotateCcw, Check, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RestaurantConfig;
  onSaveConfig: (newConfig: RestaurantConfig) => void;
  onResetDefault: () => void;
}

const colorPresets = [
  { name: 'Amber Orange (Padrão)', value: '#EA580C' },
  { name: 'Fire Crimson', value: '#DC2626' },
  { name: 'Rose Red', value: '#E11D48' },
  { name: 'Emerald Green', value: '#059669' },
  { name: 'Indigo Blue', value: '#4F46E5' },
  { name: 'Classic Dark', value: '#0F172A' },
];

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefault,
}) => {
  const [form, setForm] = useState<RestaurantConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

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

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-600" />
                Configurar Dados da Loja
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere dados como WhatsApp, nome e taxas em tempo real.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs sm:text-sm">
            {/* Nome da Loja */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nome da Loja:
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Burger Kraft / Sua Hamburgueria"
                required
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                WhatsApp do Restaurante (com DDD e DDI, apenas números):
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="Ex: 5511999999999"
                required
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Importante: Inclua o DDI do país (55 para Brasil) e DDD. Ex: 5511987654321
              </p>
            </div>

            {/* Tipo de Estabelecimento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tipo de Estabelecimento:
                </label>
                <input
                  type="text"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="Ex: Hamburgueria / Pizzaria"
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Taxa de Entrega (R$):
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>
            </div>

            {/* Tempo de Entrega e Retirada */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tempo Médio de Entrega:
                </label>
                <input
                  type="text"
                  value={form.estimatedDeliveryTime}
                  onChange={(e) => setForm({ ...form, estimatedDeliveryTime: e.target.value })}
                  placeholder="Ex: 30 - 45 min"
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Pedido Mínimo (R$):
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Endereço da Loja:
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ex: Av. Paulista, 1000 - Centro"
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
              />
            </div>

            {/* Chave Pix */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Chave Pix (opcional para pagamentos Pix):
              </label>
              <input
                type="text"
                value={form.pixKey || ''}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                placeholder="Ex: contato@sualoja.com.br ou CNPJ/Telefone"
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-orange-500 text-xs"
              />
            </div>

            {/* Color Accent Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-600" />
                Cor Principal do Aplicativo:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setForm({ ...form, primaryColor: preset.value })}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      form.primaryColor === preset.value
                        ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span className="truncate">{preset.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onResetDefault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-black text-xs shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvo com Sucesso!</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
