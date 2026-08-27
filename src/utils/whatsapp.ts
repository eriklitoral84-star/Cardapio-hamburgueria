import { CartItem, OrderState, RestaurantConfig } from '../types';
import { formatCurrency } from './currency';

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function generateWhatsAppMessage(
  config: RestaurantConfig,
  items: CartItem[],
  orderState: OrderState,
  subtotal: number,
  deliveryFee: number,
  total: number
): string {
  const isDelivery = orderState.orderType === 'delivery';
  const now = new Date();
  const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('pt-BR');

  let message = `🍔 *NOVO PEDIDO - ${config.name.toUpperCase()}*\n`;
  message += `📅 Data: ${dateString} às ${timeString}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Customer info
  message += `👤 *DADOS DO CLIENTE:*\n`;
  message += `• *Nome:* ${orderState.customerName || 'Não informado'}\n`;
  if (orderState.customerPhone) {
    message += `• *Telefone/WhatsApp:* ${orderState.customerPhone}\n`;
  }
  message += `\n`;

  // Order Items
  message += `📋 *ITENS DO PEDIDO:*\n`;
  items.forEach((item, index) => {
    const itemTotal = item.totalPrice;
    message += `*${item.quantity}x ${item.name}* (${formatCurrency(itemTotal)})\n`;
    
    // Grouped or list of options
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      item.selectedOptions.forEach((opt) => {
        const extraPriceStr = opt.price > 0 ? ` (+${formatCurrency(opt.price)})` : '';
        message += `  └ ➕ ${opt.optionName}${extraPriceStr}\n`;
      });
    }

    if (item.notes && item.notes.trim().length > 0) {
      message += `  └ 📝 *Obs:* _${item.notes.trim()}_\n`;
    }
    
    if (index < items.length - 1) {
      message += `\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Delivery or Pickup info
  message += `📍 *FORMA DE ENTREGA:*\n`;
  if (isDelivery) {
    message += `🛵 *Entrega em Domicílio (Delivery)*\n`;
    message += `• *Endereço:* ${orderState.address.street}, Nº ${orderState.address.number}\n`;
    message += `• *Bairro:* ${orderState.address.neighborhood}\n`;
    if (orderState.address.complement) {
      message += `• *Complemento:* ${orderState.address.complement}\n`;
    }
    if (orderState.address.reference) {
      message += `• *Ponto de Ref.:* ${orderState.address.reference}\n`;
    }
    if (orderState.address.city) {
      message += `• *Cidade:* ${orderState.address.city}\n`;
    }
    message += `• *Tempo Estimado:* ${config.estimatedDeliveryTime}\n`;
  } else {
    message += `🛍️ *Retirada no Balcão*\n`;
    message += `• *Endereço da Loja:* ${config.address}\n`;
    message += `• *Tempo Estimado para Retirada:* ${config.estimatedPickupTime}\n`;
  }

  message += `\n`;

  // Payment Method
  message += `💳 *FORMA DE PAGAMENTO:*\n`;
  switch (orderState.paymentMethod) {
    case 'pix':
      message += `• *PIX* (Pagamento Instantâneo)\n`;
      if (config.pixKey) {
        message += `  _Chave ${config.pixKeyType || 'Pix'}:_ \`${config.pixKey}\`\n`;
        message += `  _(Envie o comprovante nesta conversa)_\n`;
      }
      break;
    case 'credit_card':
      message += `• *Cartão de Crédito* (Pagar na maquininha na entrega/retirada)\n`;
      break;
    case 'debit_card':
      message += `• *Cartão de Débito* (Pagar na maquininha na entrega/retirada)\n`;
      break;
    case 'cash':
      message += `• *Dinheiro em Espécie*\n`;
      if (orderState.changeFor && orderState.changeFor.trim()) {
        message += `  _Levar troco para:_ *${orderState.changeFor.trim()}*\n`;
      } else {
        message += `  _Não precisa de troco (valor exato)_\n`;
      }
      break;
  }

  // General notes
  if (orderState.orderNotes && orderState.orderNotes.trim()) {
    message += `\n📌 *OBSERVAÇÃO GERAL DO PEDIDO:*\n_${orderState.orderNotes.trim()}_\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Financial summary
  message += `💰 *RESUMO DE VALORES:*\n`;
  message += `• Subtotal: ${formatCurrency(subtotal)}\n`;
  if (isDelivery) {
    message += `• Taxa de Entrega: ${formatCurrency(deliveryFee)}\n`;
  } else {
    message += `• Taxa de Entrega: Grátis (Retirada)\n`;
  }
  if (orderState.appliedDiscount > 0) {
    message += `• Desconto aplicado: -${formatCurrency(orderState.appliedDiscount)}\n`;
  }
  message += `👉 *TOTAL A PAGAR: ${formatCurrency(total)}*\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Aguardando a confirmação do pedido! Obrigado! ✨`;

  return message;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = sanitizePhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
