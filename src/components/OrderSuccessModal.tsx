import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl: string;
  summaryText: string;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  whatsappUrl,
  summaryText,
  onNewOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Check Icon */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pedido Gerado com Sucesso!
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Se a janela do WhatsApp não abriu automaticamente, clique no botão verde abaixo para enviar o pedido.
          </p>

          {/* WhatsApp Direct Action Button */}
          <div className="mt-6 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Abrir WhatsApp do Restaurante</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Mensagem Formatada</span>
                </>
              )}
            </button>
          </div>

          {/* Collapsible/Scrollable message preview */}
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left max-h-36 overflow-y-auto text-[11px] font-mono text-slate-700 whitespace-pre-wrap select-all">
            {summaryText}
          </div>

          {/* New order action */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center">
            <button
              onClick={() => {
                onNewOrder();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fazer outro pedido</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
